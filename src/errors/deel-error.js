class DeelError extends Error{
    get type(){
        return this._type;
    }

    get status(){
        return this._status;
    }

    get errors(){
        return this._errors;
    }

    get stackTrace(){
        let stackTrace = `${this._type} stack trace: ${this.stack}\n`;

        if(this._innerError && this._innerError instanceof Error){
            stackTrace += `Caused by ${this._innerError.stack}`;
        }

        return stackTrace;
    }

    constructor(message){
        if(!message){
            message = "Unexpected error occured in Deel service.";
        }

        super(message);

        this._status = 500;
        this._type = this.constructor.name;
        this._errors = [];

        Error.captureStackTrace(this, this.constructor);
    }

    addError(error){
        if(error){
            this._errors.push(error);
        }

        return this;
    }

    causedBy(error){
        this._innerError = error;

        return this;
    }

    toObject(){
        return {
            type: this._type,
            message: this.message,
            errors: this._errors
        };
    }
}

module.exports = DeelError;