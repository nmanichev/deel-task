const NotFoundError = require("../errors/not-found-error"),
    ValidationError = require("../errors/validation-error"),
    { Op } = require("sequelize"),
    { validationResult } = require("express-validator");

module.exports.findOne = async (req, res) => {
    const result = validationResult(req);

    if(!result.isEmpty()){
        throw new ValidationError(result.array(), "A validation error occured while searching for the contract.");
    }

    const { Contract } = req.app.get("models");

    const profileId = req.profile.id;

    const contract = await Contract.findOne({ 
        where: { 
            id: req.params.contractId,
            [Op.or]: [
                { ContractorId: profileId },
                { ClientId: profileId }
            ]
        } 
    });

    if(!contract){
        throw new NotFoundError("Contract was not found.")
                .addError(`Can't find contract ${req.params.contractId} for your profile.`);
    }

    return res.status(200).json(contract);
};

module.exports.findAll = async (req, res) => {
    const { Contract } = req.app.get("models");

    const profileId = req.profile.id;

    const contracts = await Contract.findAll({
        where: {
            [Op.or]: [
                { ContractorId: profileId },
                { ClientId: profileId }
            ],
            status: {
                [Op.ne] : "terminated"
            }
        }
    });

    return res.status(200).json(contracts);
};