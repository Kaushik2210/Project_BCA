// Import the async handler wrapper to automatically catch errors in async route handlers.
import { asyncHandler } from "../utils/asyncHandler.js";

// Import custom error and response classes for consistent API formatting.
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Import the Newsletter Mongoose model to interact with the 'newsletters' collection in MongoDB.
import { Newsletter } from "../models/newsletter.model.js";

// Import the Zod validation library for runtime type-checking and validation.
import zod from "zod";

// =========================================================================
// @desc    Subscribe an email to the newsletter
// @route   POST /api/v1/newsletter/subscribe
// @access  Public (anyone visiting the website can subscribe)
// =========================================================================
const collectEmail = asyncHandler(async (req, res) => {
    // Extract the email string from the POST request body.
    const { email } = req.body;

    // Use Zod's built-in email validator to ensure the string is a properly formatted email address.
    // `.safeParse()` returns a result object instead of throwing an error, letting us handle it gracefully.
    const validateEmail = zod.email("Invalid email address").safeParse(email);

    // If validation failed (e.g., "not-an-email" was submitted), return the first error message.
    if(!validateEmail.success){
        return res.status(400).json(new ApiError(400, validateEmail.error.errors[0].message).toJSON());
    }

    // Check if this email address has already been subscribed previously.
    const existing = await Newsletter.findOne({ email });

    // If a duplicate is found, inform the user they're already subscribed.
    if(existing){
        return res.status(400).json(new ApiError(400, "Email already subscribed").toJSON());
    }

    // Create a new newsletter subscription document in the database.
    const newSubscription = await Newsletter.create({ email });

    // Safety check: If the database failed to create the document.
    if(!newSubscription){
        return res.status(500).json(new ApiError(500, "Failed to subscribe").toJSON());
    }

    // Return HTTP 201 (Created) confirming the subscription was successful.
    return res.status(201).json(new ApiResponse(201, null, "Subscribed successfully"));
})

// =========================================================================
// @desc    Get all newsletter subscribers
// @route   GET /api/v1/newsletter
// @access  Private (Admin only)
// =========================================================================
const getSubscribers = asyncHandler(async (req, res) => {
  // Fetch all subscriber documents, sorted by newest first (descending createdAt).
  const subscribers = await Newsletter.find().sort({ createdAt: -1 });
  // Return the full list of subscribers.
  return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

// Export both functions as named exports.
export { collectEmail, getSubscribers };