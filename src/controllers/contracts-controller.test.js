const NotFoundError = require("../errors/not-found-error"),
    contracts = require("./contracts-controller"),
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

    describe("Contracts controller", () => {

        it("should throw not found error for the provided profile.", async () => {
            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models);
                
            req.params = {
                contractId: 3
            };

            req.profile = {
                id: 1
            };

            let res = mockResponse();

            await expect(contracts.findOne(req, res)).rejects.toThrow(new NotFoundError("Contract was not found."));
        });

        it("should return client's contract.", async () => {
            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models);

            req.params = {
                contractId: 2
            };

            req.profile = {
                id: 1
            };

            let res = mockResponse();

            await contracts.findOne(req, res);

            expect(res.status).toHaveBeenCalledWith(200);

            const result = res.json.mock.calls[0][0];

            expect(result).toMatchObject({
                dataValues: {
                    ClientId: 1,
                    ContractorId: 6,
                    id: 2,
                    status: "in_progress",
                    terms: "bla bla bla",
                }
            });
        });

        it("should return client's contracts.", async () => {
            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models);
                
            req.profile = {
                id: 2
            };

            let res = mockResponse();

            await contracts.findAll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);

            const result = res.json.mock.calls[0][0];

            expect(result).toMatchObject([
                    {
                        dataValues: {
                            id: 3,
                            terms: "bla bla bla",
                            status: "in_progress",
                            ContractorId: 6,
                            ClientId: 2
                        }
                    },
                    {
                        dataValues: {
                            id: 4,
                            terms: "bla bla bla",
                            status: "in_progress",
                            ContractorId: 7,
                            ClientId: 2
                        }
                    }
            ]);
        });

    });
