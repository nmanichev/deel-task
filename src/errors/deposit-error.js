const DeelError = require("./deel-error");

class PaymentError extends DeelError{
    constructor(message){
        if(!message){
            message = "Your payment request is forbidden.";
        }

        super(message);

        this._status = 403;
    }
}

module.exports = PaymentError;