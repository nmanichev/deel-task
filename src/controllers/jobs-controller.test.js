const PaymentError = require("../errors/payment-error"),
    jobs = require("./jobs-controller"),
    { sequelize } = require("../models"),
    { mockRequest, mockResponse } = require("../helpers/jest-helper");

    jest.mock("express-validator", () => {
        return {
            validationResult: jest.fn(() => {
                return {
                    isEmpty: jest.fn(() => true)
                }
            })
        }
    });

    describe("Jobs controller", () => {

        it("should return a client's unpaid job.", async () => {
            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models);

            req.query = {
                paid: false
            };

            req.profile = {
                id: 1
            };

            let res = mockResponse();

            await jobs.findAll(req, res);

            const result = res.json.mock.calls[0][0];

            expect(result).toMatchObject([
                    {
                        dataValues: {
                            id: 2,
                            description: "work",
                            price: 201,
                            paid: null,
                            paymentDate: null,
                            ContractId: 2
                        }
                    }
            ]);
        });

        it("should pay for the client's job.", async () => {
            const { Profile, Job } = sequelize.models;

            const clientId = 1,
                contractorId = 6,
                jobId = 2;

            const client = await Profile.findByPk(clientId),
                contractor = await Profile.findByPk(contractorId),
                job = await Job.findByPk(jobId);

            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models)
                .mockReturnValueOnce(sequelize);

            req.params = {
                jobId: jobId
            };

            req.profile = {
                id: clientId
            };

            let res = mockResponse();

            await jobs.pay(req, res);

            expect(res.status).toHaveBeenCalledWith(200);

            const result = res.json.mock.calls[0][0];

            expect(result).toMatchObject({
                dataValues: {
                    id: jobId,
                    paid: true
                }
            });

            const updatedClient = await Profile.findByPk(clientId),
                updatedContractor = await Profile.findByPk(contractorId);

            expect(updatedClient.balance).toEqual(client.balance - job.price);

            expect(updatedContractor.balance).toEqual(contractor.balance + job.price);
        });

        it("should throw payment error, because client's balance is no enough to pay for this job.", async () =>{
            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models)
                .mockReturnValueOnce(sequelize);

            req.params = {
                jobId: 5
            };

            req.profile = {
                id: 4
            };

            let res = mockResponse();

            await expect(jobs.pay(req, res)).rejects.toThrow(new PaymentError("Your balance is not enough to pay for this job."));
        });

    });
