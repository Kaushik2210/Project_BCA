import rateLimit from "express-rate-limit";

const contactRateLimiter=rateLimit({
    windowMs:15*60*1000, //15 minutes
    max:60, //limit each IP to 60 requests per windowMs
    message: {
        status: 429,
        message: "Too many contact form submissions from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

export {contactRateLimiter};