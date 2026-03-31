// Custom API Response class for consistent success responses.
// All successful API responses will use this class to ensure uniform JSON output.
class ApiResponse {
    // Constructor accepts: HTTP status code, the data payload, and an optional message.
    constructor(statusCode, data, message = "Success") {
        // Store the HTTP status code.
        this.statusCode = statusCode;
        // Store the response payload (e.g., a list of sermons, a newly created blog, etc.).
        this.data = data;
        // Store a human-readable success message.
        this.message = message;
        // Automatically determine if this was truly a success based on the status code.
        // Any status code below 400 is considered successful (200, 201, 204, etc.).
        this.success = statusCode < 400;
    }
}

// Export the ApiResponse class for use in controllers.
export { ApiResponse }