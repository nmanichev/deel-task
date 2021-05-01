const DeelError = require("./deel-error");

class AuthenticationError extends DeelError{
    constructor(message){
        if(!message){
            message = "You are not authenticated for using Deel service.";
        }

        super(message);

        this._status = 401;
    }
}

module.exports = AuthenticationError;