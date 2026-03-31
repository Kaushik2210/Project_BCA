// Import the Prayer Mongoose model to interact with the 'prayers' collection in MongoDB.
import Prayer from "../models/prayer.model.js";

// Import the async handler wrapper to automatically catch async errors.
import { asyncHandler } from "../utils/asyncHandler.js";

// Import the Zod validation schema for prayer request submissions.
import { prayerSchema } from "../schema/prayer.schema.js";

// Import custom error and response formatting classes.
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Import mongoose for creating ObjectId instances.
import mongoose from "mongoose";

// =========================================================================
// @desc    Create a new prayer request
// @route   POST /api/v1/prayer
// @access  Public (anyone can submit a prayer request)
// =========================================================================
const createPrayer = asyncHandler(async (req, res) => {
    // Destructure the prayer request fields from the request body.
    const { name, description } = req.body;

    // Validate against the Zod schema (checks required fields, string lengths, etc.).
    const { error } = prayerSchema.safeParse({ name, description });

    // If validation fails, return the first error message.
    if(error){
        return res.status(400).json(new ApiError(400, error.issues[0].message).toJSON());
    }

    // Create the prayer request document in MongoDB.
    const prayer = await Prayer.create({ name, description });

    // Safety check: If the creation somehow failed.
    if(!prayer){
        return res.status(500).json(new ApiError(500, "Failed to create prayer").toJSON());
    }

    // Return HTTP 201 (Created) with the newly created prayer document.
    return res.status(201).json(new ApiResponse(201, prayer, "Prayer created successfully"));
})

// =========================================================================
// @desc    Get all prayer requests
// @route   GET /api/v1/prayer
// @access  Private (Admin only)
// =========================================================================
const getPrayers = asyncHandler(async (req, res) => {
    // Fetch all prayer documents, sorted by newest first (descending createdAt).
    const prayers = await Prayer.find().sort({ createdAt: -1 });

    // Safety check: If the query failed.
    if(!prayers){
        return res.status(500).json(new ApiError(500, "Failed to fetch prayers").toJSON());
    }

    // Return the list of prayers.
    return res.status(200).json(new ApiResponse(200, prayers, "Prayers fetched successfully"));
})

// =========================================================================
// @desc    Mark a prayer request as "prayed for"
// @route   PATCH /api/v1/prayer/:id
// @access  Private (Admin only)
// =========================================================================
const markAsPrayed = asyncHandler(async (req, res) => {
    // Extract the prayer ID from the URL parameter.
    const { id } = req.params;

    // Convert the string ID to a proper MongoDB ObjectId.
    const objectId = new mongoose.Types.ObjectId(id);

    // Find the prayer document by its ID.
    const prayer = await Prayer.findById(objectId);

    // If not found, return 404.
    if(!prayer){
        return res.status(404).json(new ApiError(404, "Prayer not found").toJSON());
    }

    // Set the 'prayed' boolean flag to true.
    prayer.prayed = true;
    // Persist the change to the database.
    await prayer.save();

    // Return the updated prayer document.
    return res.status(200).json(new ApiResponse(200, prayer, "Prayer marked as prayed"));
})

// =========================================================================
// @desc    Delete multiple prayer requests at once (bulk delete)
// @route   DELETE /api/v1/prayer
// @access  Private (Admin only)
// =========================================================================
const deletePrayer = asyncHandler(async (req, res) => {
    // Extract the array of prayer IDs to delete from the request body.
    const ArrayOfIds = req.body.ids;

    // Use MongoDB's `deleteMany` with the `$in` operator to delete all documents whose _id is in our array.
    // This is more efficient than deleting one-by-one in a loop.
    const result = await Prayer.deleteMany({ _id: { $in: ArrayOfIds } });

    // If no documents were actually deleted, the IDs were invalid or already gone.
    if(result.deletedCount === 0){
        return res.status(404).json(new ApiError(404, "No prayers found to delete").toJSON());
    }

    // Return the count of how many were successfully deleted using a template literal.
    return res.status(200).json(new ApiResponse(200, null, `${result.deletedCount} prayers deleted successfully`));
})

// Export all four controller functions.
export { createPrayer, getPrayers, markAsPrayed, deletePrayer }
