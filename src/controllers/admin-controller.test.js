const NotFoundError = require("../errors/not-found-error"),
    admin = require("./admin-controller"),
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

    describe("Admin controller", () => {

        it("should return programmer as the profession that earned the most.", async () => {
            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models)
                .mockReturnValueOnce(sequelize);
                
            req.query = {
                start: "2020-08-09",
                end: "2020-08-19"
            };

            let res = mockResponse();

            await admin.findBestProfession(req, res);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    dataValues: {
                        profession: "Programmer",
                        earned: 2683
                    }
                })
            );
        });

        it("should return musician as the profession that earned the most.", async () => {
            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models)
                .mockReturnValueOnce(sequelize);
                
            req.query = {
                start: "2020-08-09",
                end: "2020-08-11"
            };

            let res = mockResponse();

            await admin.findBestProfession(req, res);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    dataValues: {
                        profession: "Musician",
                        earned: 21
                    }
                })
            );
        });

        it("should throw not found error within the provided date range.", async () => {
            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models)
                .mockReturnValueOnce(sequelize);
                
            req.query = {
                start: "2020-08-08",
                end: "2020-08-09"
            };

            let res = mockResponse();

            await expect(admin.findBestProfession(req, res)).rejects.toThrow(new NotFoundError("Can't find the best profession within the provided date range."));
        });

        it("should return Ash Kethcum as the best client.", async () => {
            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models)
                .mockReturnValueOnce(sequelize);
                
            req.query = {
                start: "2020-08-09",
                end: "2020-08-18",
                limit: 1
            };

            let res = mockResponse();

            await admin.findBestClients(req, res);

            const functionArg = res.json.mock.calls[0][0];

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(
                expect.arrayContaining([expect.objectContaining({
                    dataValues: {
                        id: 4,
                        fullName: "Ash Kethcum",
                        paid: 2020
                    }
                })])
            );
        });

        it("should return two best clients.", async () => {
            let req = mockRequest();

            req.app.get.mockReturnValueOnce(sequelize.models)
                .mockReturnValueOnce(sequelize);
                
            req.query = {
                start: "2020-08-09",
                end: "2020-08-18"
            };

            let res = mockResponse();

            await admin.findBestClients(req, res);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        dataValues: {
                            id: 4,
                            fullName: "Ash Kethcum",
                            paid: 2020
                        }
                    }),
                    expect.objectContaining({
                        dataValues: {
                            id: 2,
                            fullName: "Mr Robot",
                            paid: 442
                        }
                    })
                ])
            );
        });
    });
