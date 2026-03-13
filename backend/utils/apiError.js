class ApiError extends Error{
    constructor(statusCode,message="Error occured",errors=[],stack=""){
        super(message);
        this.statusCode=statusCode;
        this.data=null;
        this.success=false;
        this.errors=errors;
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this,ApiError);
        }
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            success: this.success,
            message: this.message,
            data: this.data,
            errors: this.errors,
        };
    }
}

export {ApiError}