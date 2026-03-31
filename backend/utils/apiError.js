// Custom API Error class that extends the built-in JavaScript Error class.
// This ensures all error responses from our API follow the SAME consistent JSON format.
class ApiError extends Error {
    // Constructor accepts: HTTP status code, a message, optional detailed errors, and an optional stack trace.
    constructor(statusCode, message = "Error occurred", errors = null, stack = "") {
        // Call the parent Error class constructor with the message string.
        super(message);
        // Store the HTTP status code (e.g., 400, 404, 500).
        this.statusCode = statusCode;
        // Always set success to false for errors.
        this.success = false;
        // Store any additional error details (e.g., validation errors array).
        this.errors = errors;
        // If a stack trace was explicitly provided, use it.
        if(stack){
            this.stack = stack;
        } else {
            // Otherwise, automatically capture the stack trace at this point in the code.
            // This helps with debugging by showing exactly where the error originated.
            Error.captureStackTrace(this, ApiError);
        }
    }

    // Custom toJSON method.
    // By default, JavaScript's Error class properties are NOT enumerable,
    // meaning `JSON.stringify(errorInstance)` would return `{}`.
    // This method explicitly defines what fields to include when converting to JSON.
    toJSON() {
        return {
            statusCode: this.statusCode,
            success: this.success,
            message: this.message,
            errors: this.errors,
        };
    }
}

// Export the ApiError class for use in controllers.
export { ApiError }