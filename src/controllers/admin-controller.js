const NotFoundError = require("../errors/not-found-error"),
    ValidationError = require("../errors/validation-error"),
    { DateTime } = require("luxon"),
    { Op } = require("sequelize"),
    { validationResult } = require("express-validator");

module.exports.findBestProfession = async (req, res) => {
    const result = validationResult(req);

    if(!result.isEmpty()){
        throw new ValidationError(result.array(), "A validation error occured while searhing for the best profession.");
    }

    const { Job, Contract, Profile } = req.app.get("models");

    const sequelize = req.app.get("sequelize");

    const start = DateTime.fromISO(req.query.start, { zone: "utc" }),
        end = DateTime.fromISO(req.query.end, { zone: "utc" });

    const bestProfessions = await Profile.findAll({
        attributes: [ 
            "profession", 
            [sequelize.fn("SUM", sequelize.col("price")), "earned"]
        ],
        include: [{
            model: Contract,
            as: "Contractor",
            attributes: [],
            required: true,
            include: [{
                model: Job, 
                required: true,
                attributes: [],
                where: {
                    paid: true,
                    paymentDate: {
                        [Op.gte]: start.toJSDate(),
                        [Op.lte]: end.toJSDate()
                    }
                }
            }]
        }],
        where: {
            type: "contractor"
        },
        group: [ "profession" ],
        order: [ [sequelize.col("earned"), "DESC"] ],
        limit : 1,
        subQuery: false
    });

    if(bestProfessions.length === 0){
        throw new NotFoundError("Can't find the best profession within the provided date range.")
            .addError(`There are no earning from ${req.query.start} to ${req.query.end}.`);
    }

    return res.status(200).json(bestProfessions[0]);
};

module.exports.findBestClients = async (req, res) => {
    const result = validationResult(req);

    if(!result.isEmpty()){
        throw new ValidationError(result.array(), "A validation error occured while searching for the best clients.");
    }

    const { Job, Contract, Profile } = req.app.get("models");

    const sequelize = req.app.get("sequelize");

    const start = DateTime.fromISO(req.query.start, { zone: "utc" }),
        end = DateTime.fromISO(req.query.end, { zone: "utc" });

    let limit = req.query.limit || 2;

    const bestClients = await Profile.findAll({
        attributes: [ 
            "id",
            [sequelize.literal("firstName || ' ' || lastName"), "fullName"],
            [sequelize.fn("SUM", sequelize.col("price")), "paid"]
        ],
        include: [{
            model: Contract,
            as: "Client",
            attributes: [],
            required: true,
            include: [{
                model: Job, 
                required: true,
                attributes: [],
                where: {
                    paid: true,
                    paymentDate: {
                        [Op.gte]: start.toJSDate(),
                        [Op.lte]: end.toJSDate()
                    }
                }
            }]
        }],
        where: {
            type: "client"
        },
        group: [ "Profile.id" ],
        order: [ [sequelize.col("paid"), "DESC"] ],
        limit : limit,
        subQuery: false
    });

    return res.status(200).json(bestClients);
};