const DeelError = require("../errors/deel-error"),
    DepositError = require("../errors/deposit-error"),
    NotFoundError = require("../errors/not-found-error"),
    ValidationError = require("../errors/validation-error"),
    { validationResult } = require("express-validator");

module.exports.deposit = async (req, res) => {
    const result = validationResult(req);

    if(!result.isEmpty()){
        throw new ValidationError(result.array(), "A validation error occured while trying to deposit for account.");
    }

    const { Job, Contract, Profile } = req.app.get("models");

    const sequelize = req.app.get("sequelize");

    const depositTransaction = await sequelize.transaction();

    const clientId = req.params.clientId;

    const money = req.body.money;

    try{
        const client = await Profile.findByPk(clientId, { transaction: depositTransaction });

        if(!client || client.type !== "client"){
            throw new NotFoundError("Can't find the client.")
                .addError(`Can't find the client ${clientId} to make deposit for.`);
        }

        const clientJobs = await Job.findAll({
            attributes: {
                include: [
                    [sequelize.fn("SUM", sequelize.col("price")), "totalPrice"]
                ]
            },
            include: [{
                attributes: [],
                model: Contract,
                required: true,
                where: {
                    ClientId: clientId,
                    status: "in_progress"
                }
            }],
            where: {
                paid: null
            }
        }, { transaction: depositTransaction });

        const totalPrice = clientJobs[0].dataValues.totalPrice;

        if(!totalPrice){
            throw new DepositError("We can't take your deposit without active jobs.")
                .addError(`There are no unpaid jobs for client ${clientId}.`);
        }

        const maxDeposit = totalPrice * 0.25;

        if(money > maxDeposit){
            throw new DepositError("Maximum deposit amount reached.")
                .addError(`Deposit ${money} is more than 25% of client ${clientId} total of jobs to pay.`);
        }

        await client.increment({ balance: money }, { transaction: depositTransaction });

        client.balance += money;

        await depositTransaction.commit();

        return res.status(200).json(client);
    }
    catch(error){
        await depositTransaction.rollback();

        if(error instanceof DeelError){
            throw error;
        }
        else{
            throw new DepositError("We can't process your deposit.")
                .addError(`An error occurred while trying to deposit ${req.body.money} to your account.`)
                .causedBy(error);
        }
    }
};