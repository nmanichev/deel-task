const DeelError = require("./deel-error");

class NotFoundError extends DeelError{
    constructor(message){
        if(!message){
            message = "The requested entity could not be found in Deel service.";
        }

        super(message);

        this._status = 404;
    }
}

module.exports = NotFoundError;