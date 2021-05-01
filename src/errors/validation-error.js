const DeelError = require("./deel-error");

class ValidationError extends DeelError{
    constructor(errors, message){
        if(!message){
            message = "Validation error occurred while processing your request.";
        }

        super(message);

        this._errors = errors;

        this._status = 422;
    }
}

module.exports = ValidationError;