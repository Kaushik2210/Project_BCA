// Import express-rate-limit — a middleware that limits the number of requests from a single IP address.
// This prevents abuse like spam form submissions or brute-force attacks.
import rateLimit from "express-rate-limit";

// Configure the rate limiter with specific rules.
const RateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // Time window: 15 minutes (in milliseconds)
    max: 60,                     // Maximum 60 requests per IP within the 15-minute window
    message: {
        status: 429,             // HTTP 429 = "Too Many Requests"
        message: "Too many contact form submissions from this IP, please try again later.",
    },
    standardHeaders: true,       // Include rate limit info in standard `RateLimit-*` response headers
    legacyHeaders: false,        // Disable deprecated `X-RateLimit-*` headers
})

// Export the configured rate limiter middleware.
export { RateLimiter };