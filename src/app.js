const express = require("express"),
    cors = require("cors"),
    authenticate = require("./middlewares/authenticate-middleware"),
    async = require("./middlewares/async-middleware"),
    error = require("./middlewares/error-middleware"),
    LoggerFactory = require("./services/factories/logger-factory"),
    contracts = require("./controllers/contracts-controller"),
    jobs = require("./controllers/jobs-controller"),
    profiles = require("./controllers/profiles-controller"),
    admin = require("./controllers/admin-controller"),
    { sequelize } = require("./models"),
    { body, query, param } = require("express-validator"),
    { DateTime } = require("luxon");

const app = express(),
    logger = LoggerFactory.create(),
    port = process.env.PORT || 3001;

    app.use(cors());
    app.use(express.json());

    app.set("sequelize", sequelize);
    app.set("models", sequelize.models);
    app.set("logger", logger);

    app.get("/contracts/:contractId", [
        authenticate,
        param("contractId")
            .exists()
            .withMessage("Can't get contract without its id.")
    ],
    async(async (req, res) => await contracts.findOne(req, res)));

    app.get("/contracts", [
        authenticate
    ],
    async(async (req, res) => await contracts.findAll(req, res)));

    app.get("/jobs", [
        authenticate,
        query("paid")
            .exists()
            .withMessage("paid is required parameter.")
            .isBoolean()
            .withMessage("paid parameter has a boolean type.")
    ],
    async(async (req, res) => await jobs.findAll(req, res)));

    app.post("/jobs/:jobId/pay", [
        authenticate,
        param("jobId").exists().withMessage("Can't update job without is id."),
    ],
    async(async (req, res) => await jobs.pay(req, res)));

    app.post("/balances/deposit/:clientId", [
        param("clientId").exists().withMessage("Can't deposit without client id."),
        body("money")
            .exists()
            .withMessage("Please, specify the money that you want to deposit.")
            .isDecimal()
            .withMessage("Please, specify a valid money amount.")
    ],
    async(async (req, res) => await profiles.deposit(req, res)));

    app.get("/admin/best-profession", [
        query("start")
            .exists()
            .withMessage("Start date should be present.")
            .isISO8601()
            .withMessage("Start date should be in valid ISO 8601 format."),
        query("end")
            .exists()
            .withMessage("End date should be present.")
            .isISO8601()
            .withMessage("End date should be in valid ISO 8601 format.")
            .custom((value, { req }) => value === req.query.start || DateTime.fromISO(value) >= DateTime.fromISO(req.query.start))
            .withMessage("End date should be equal or after start date."),
    ],
    async(async (req, res) => await admin.findBestProfession(req, res)));

    app.get("/admin/best-clients", [
        query("start")
            .exists()
            .withMessage("Start date should be present.")
            .isISO8601()
            .withMessage("Start date should be in valid ISO 8601 format."),
        query("end")
            .exists()
            .withMessage("End date should be present.")
            .isISO8601()
            .withMessage("End date should be in valid ISO 8601 format.")
            .custom((value, { req }) => value === req.query.start || DateTime.fromISO(value) >= DateTime.fromISO(req.query.start))
            .withMessage("End date should be equal or after start date."),
        query("limit")
            .optional()
            .isInt()
            .withMessage("Limit should be an integer number.")
    ],
    async(async (req, res) => await admin.findBestClients(req, res)));

    app.use(error);

    const server = app.listen(port, () => {
        logger.info(`Deel is listening on port ${port}.`);
    });

    process.on("SIGTERM", () => {
        logger.info("SIGTERM signal received, closing Deel server.");

        server.close(() => {
            logger.info("Deel server is closed.");

            process.exit(0);
        });
    });

    process.on("uncaughtException", (error) => {
        logger.error("An uncaught exception detected in Deel.", error);
      
        process.exit(1);
    });

    process.on("unhandledRejection", (error) => {
        logger.error("Unhandled rejection detected in Deel.", error);

        process.exit(1);
    });