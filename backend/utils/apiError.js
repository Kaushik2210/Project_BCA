class ApiError extends Error{
    constructor(statusCode,message="Error occurred",errors=null,stack=""){
        super(message);
        this.statusCode=statusCode;
        this.success=false;
        this.errors=errors;
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this,ApiError);
        }
    }

    //toJSON method to convert the ApiError instance to a JSON object since Error class fields are not enumerable by default
    toJSON() {
        return {
            statusCode: this.statusCode,
            success: this.success,
            message: this.message,
            errors: this.errors,
        };
    }
}

export {ApiError}