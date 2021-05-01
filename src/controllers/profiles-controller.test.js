const DepositError = require("../errors/deposit-error"),
    profiles = require("./profiles-controller"),
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

    describe("Profiles controller", () => {

        it("should throw deposit error, because of maximum deposit amount reached.", async () => {
            const clientId = 2,
                money = 109.68;

            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models)
                .mockReturnValueOnce(sequelize);

            req.params = {
                clientId: clientId
            };

            req.body = {
                money: money
            };

            let res = mockResponse();

            await expect(profiles.deposit(req, res)).rejects.toThrow(new DepositError("Maximum deposit amount reached."));
        });

        it("should deposit 97.34 to client's account.", async () => {
            const { Profile } = sequelize.models;

            const clientId = 2,
                money = 97.34;

            let client = await Profile.findByPk(clientId);

            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models)
                .mockReturnValueOnce(sequelize);

            req.params = {
                clientId: clientId
            };

            req.body = {
                money: money
            };

            let res = mockResponse();

            await profiles.deposit(req, res);

            expect(res.status).toHaveBeenCalledWith(200);

            const result = res.json.mock.calls[0][0];

            expect(result).toMatchObject({
                    dataValues: {
                        id: clientId,
                        balance: client.balance + money
                    }
                });
        });

    });
