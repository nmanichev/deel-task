const DeelError = require("./deel-error");

class DepositError extends DeelError{
    constructor(message){
        if(!message){
            message = "Can't accept your deposit.";
        }

        super(message);

        this._status = 406;
    }
}

module.exports = DepositError;