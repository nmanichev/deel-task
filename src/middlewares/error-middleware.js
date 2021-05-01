const DeelError = require("../errors/deel-error");

module.exports = (err, req, res, next) => {
    let logger = req.app.get("logger");

    let message = err.message;

    if (res.headersSent) {
        return next(err);
    }

    if(err instanceof DeelError){
        logger.warn(`Deel error occurred.`, err);
    }

    if(!(err instanceof DeelError)){
        logger.warn(`Unhandled error occurred, wrapping it in a Deel error.`, err);

        err = new DeelError()
                    .causedBy(err);
    }

    let errorObject = err.toObject();

    if(process.env.NODE_ENV === "development"){
        errorObject.stack = err.stackTrace;
        errorObject.message = message;
    }

    return res.status(err.status).json({
        error: errorObject
    });
}
