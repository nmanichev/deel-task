const DeelError = require("../errors/deel-error"),
    PaymentError = require("../errors/payment-error"),
    NotFoundError = require("../errors/not-found-error"),
    ValidationError = require("../errors/validation-error"),
    { Op } = require("sequelize"),
    { validationResult } = require("express-validator");

module.exports.findAll = async (req, res) => {
    const result = validationResult(req);

    if(!result.isEmpty()){
        throw new ValidationError(result.array(), "A validation error occured while searcing for jobs.");
    }

    const { Job, Contract } = req.app.get("models");

    const profileId = req.profile.id;

    const paid = req.query.paid === "true" ? true : null;
    
    const jobs = await Job.findAll({
        include: [{
            attributes: [],
            model: Contract,
            required: true,
            where: {
                [Op.or]: [
                    { ContractorId: profileId },
                    { ClientId: profileId }
                ],
                status: "in_progress"
            }
        }],
        where: {
            paid: paid
        }
    });
    
    return res.status(200).json(jobs);
};

module.exports.pay = async (req, res) => {
    const result = validationResult(req);

    if(!result.isEmpty()){
        throw new ValidationError(result.array(), "A validation error occured while paying for a job.");
    }

    const { Job, Contract, Profile } = req.app.get("models");

    const sequelize = req.app.get("sequelize");

    const profileId = req.profile.id;

    const paymentTransaction = await sequelize.transaction();

    try{
        const job = await Job.findByPk(req.params.jobId, { transaction: paymentTransaction });

        if(!job){
            throw new NotFoundError("Can't find the job.")
                .addError(`Can't find job ${req.params.jobId}.`);
        }

        if(job.paid){
            throw new PaymentError("Job is already paid.")
                .addError(`Job ${req.params.jobId} is already paid.`);
        }

        const contract = await Contract.findByPk(job.ContractId, { transaction: paymentTransaction });

        if(contract.ClientId !== profileId || contract.status !== "in_progress"){
            throw new PaymentError("You can't pay for this job.")
                .addError(`Can't find job ${req.params.jobId} for your profile or contract is not in progress.`);
        }

        const client = await Profile.findByPk(profileId, { transaction: paymentTransaction });

        if(client.balance < job.price){
            throw new PaymentError("Your balance is not enough to pay for this job.")
                .addError(`Client ${profileId} has not enough money on his balance to pay for ${job.id} job.`);
        }

        const contractor = await Profile.findByPk(contract.ContractorId, { transaction: paymentTransaction });

        await client.decrement({ balance: job.price }, { transaction: paymentTransaction });

        await contractor.increment({ balance: job.price }, { transaction: paymentTransaction });

        job.paid = true;

        await job.save({ transaction: paymentTransaction });

        await paymentTransaction.commit();

        return res.status(200).json(job);
    }
    catch(error){
        await paymentTransaction.rollback();

        if(error instanceof DeelError){
            throw error;
        }
        else{
            throw new PaymentError("We can't proccess your payment.")
                .addError(`An error occurred while trying to pay for the ${req.params.jobId} job.`)
                .causedBy(error);
        }
    }
};