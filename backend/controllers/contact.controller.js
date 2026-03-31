// Import the Contact Mongoose model to interact with the 'contacts' collection in MongoDB.
import { Contact } from "../models/contact.model.js";

// Import the async handler wrapper that catches any promise rejections in async functions.
import { asyncHandler } from "../utils/asyncHandler.js";

// Import custom error and response utility classes.
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Import the Zod validation schema for contact form submissions.
import { contactSchema } from "../schema/contact.schema.js";

// Import a utility function that strips specified fields from a plain Javascript object.
import omitFields from "../utils/omitFields.js";

// Import mongoose for creating ObjectId instances when needed.
import mongoose from "mongoose";

// =========================================================================
// @desc    Submit a new contact form message
// @route   POST /api/v1/contact
// @access  Public (anyone visiting the website can submit)
// =========================================================================
const postContact = asyncHandler(async (req, res) => {
    // Destructure the three expected fields from the request body.
    const { name, email, message } = req.body;

    // Validate the incoming data against our Zod schema (checks format, length, etc.).
    // `.safeParse()` returns `{ success, error }` instead of throwing.
    const { error } = contactSchema.safeParse({ name, email, message });

    // If validation failed, return the first issue's message as a 400 error.
    if (error) {
        return res.status(400).json(new ApiError(400, error.issues[0].message).toJSON());
    }

    // Save the validated contact form data to MongoDB.
    let contact = await Contact.create({ name, email, message });

    // Safety check: If the create operation somehow failed.
    if(!contact){
        return res.status(500).json(new ApiError(500, "Failed to submit contact form").toJSON());
    }

    // Strip internal/sensitive fields (__v, replied) before sending the response back to the user.
    // `.toObject()` converts the Mongoose document to a plain JS object first.
    contact = omitFields(contact.toObject(), ["__v", "replied"]);

    // Return HTTP 201 (Created) with the sanitized contact data.
    return res.status(201).json(new ApiResponse(201, contact, "Contact form submitted successfully"));
})

// =========================================================================
// @desc    Get all contact form submissions
// @route   GET /api/v1/contact
// @access  Private (Admin only)
// =========================================================================
const getContact = asyncHandler(async (req, res) => {
    // Fetch all contact documents, sorted by newest first.
    const contacts = await Contact.find().sort({ createdAt: -1 });

    // Return the full list.
    return res.status(200).json(new ApiResponse(200, contacts, "Contacts fetched successfully"));
})

// =========================================================================
// @desc    Mark a contact message as replied
// @route   PATCH /api/v1/contact/:id
// @access  Private (Admin only)
// =========================================================================
const markAsReplied = asyncHandler(async (req, res) => {
    // Extract the contact ID from the URL parameter.
    const contactId = req.params.id;

    // Convert the string ID to a proper MongoDB ObjectId for querying.
    const objectId = new mongoose.Types.ObjectId(contactId);

    // Find the specific contact document by its ObjectId.
    const contact = await Contact.findById(objectId);

    // If no contact was found, return 404.
    if(!contact){
        return res.status(404).json(new ApiError(404, "Contact not found").toJSON());
    }

    // Set the 'replied' boolean flag to true on the document.
    contact.replied = true;
    // Persist the change to the database.
    await contact.save();

    // Return the updated contact document.
    return res.status(200).json(new ApiResponse(200, contact, "Contact marked as replied successfully"));
})

// Export all three controller functions as named exports.
export { postContact, getContact, markAsReplied };