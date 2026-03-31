// Import the async handler wrapper to catch async errors automatically.
import { asyncHandler } from "../utils/asyncHandler.js"

// Import custom error and response formatting classes.
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

// Import the Sermon Mongoose model.
import Sermon from "../models/sermon.model.js"

// Import the pre-configured Cloudinary instance for cloud-based file storage.
import cloudinaryConfig from "../config/cloudinary.js"

// Import 'streamifier' — a utility that converts a Buffer (in-memory file data) into a readable stream.
// Cloudinary's upload API requires a stream, but multer stores files as Buffers in memory.
import streamifier from "streamifier";

// =========================================================================
// @desc    Get paginated list of sermons
// @route   GET /api/v1/sermon?page=1&limit=6
// @access  Public
// =========================================================================
export const getSermons = asyncHandler(async (req, res) => {
    // Parse the 'page' query parameter, defaulting to 1. `Math.max(1, ...)` ensures it's never less than 1.
    const page = Math.max(1, parseInt(req.query.page) || 1);
    // Parse the 'limit' query parameter (items per page), defaulting to 6.
    const limit = Math.max(1, parseInt(req.query.limit) || 6);

    // Count the total number of sermon documents in the collection (for pagination math).
    const totalSermons = await Sermon.countDocuments();
    // If there are zero sermons, return an empty array immediately with pagination metadata.
    if (totalSermons === 0) {
        return res.status(200).json(new ApiResponse(200, { sermons: [], pagination: { total: 0, page, limit, totalPages: 0 } }, "Sermons fetched successfully"));
    }

    // Calculate the total number of pages by dividing total items by items per page, rounding up.
    const totalPages = Math.ceil(totalSermons / limit);
    // Calculate how many documents to skip (e.g., page 2 with limit 6 skips the first 6 docs).
    const skip = (page - 1) * limit;

    // Fetch sermons from MongoDB with specific field projection (only return these 4 fields).
    // Sort by `_id: -1` (newest first), then skip and limit for pagination.
    const sermons = await Sermon.find({}, 'description title sermon_url sermon_public_id')
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    // Safety check: If the query returned null (unlikely but defensive).
    if(!sermons){
        return res.status(404).json(new ApiError(404, "No sermons found").toJSON());
    }

    // Return the paginated sermons along with pagination metadata for the frontend to build navigation.
    return res
        .status(200)
        .json(new ApiResponse(200, { sermons, pagination: { total: totalSermons, page, limit, totalPages } }, "Sermons fetched successfully"));
})

// =========================================================================
// @desc    Upload a new sermon (with audio file to Cloudinary)
// @route   POST /api/v1/sermon
// @access  Private (Admin only)
// =========================================================================
export const postSermon = asyncHandler(async (req, res) => {
    // Extract text fields from the request body.
    const { title, description } = req.body;
    // Extract the uploaded file from multer's middleware (stored in memory as a Buffer).
    const file = req.file;

    // Validate that all three pieces are present.
    if(!file || !title || !description){
        return res.status(400).json(new ApiError(400, "All fields are required").toJSON());
    }

    // Upload the audio file to Cloudinary using a stream-based approach.
    // We wrap it in a Promise because Cloudinary's upload_stream uses callbacks, not async/await.
    const result = await new Promise((resolve, reject) => {
        // Create a Cloudinary upload stream with configuration options.
        const stream = cloudinaryConfig.uploader.upload_stream({
            resource_type: "video",  // Cloudinary treats audio files as "video" resource type
            folder: "sermons"        // Store in the "sermons" folder on Cloudinary
        }, (error, result) => {
            // Callback: If upload failed, reject the promise.
            if(error){
                console.error("Cloudinary upload error:", error);
                reject(error);
            } else {
                // If upload succeeded, resolve with the result (contains URL, public_id, etc.).
                resolve(result);
            }
        });

        // Convert the in-memory Buffer into a readable stream and pipe it into Cloudinary's upload stream.
        streamifier.createReadStream(file.buffer).pipe(stream);
    })

    // Save the sermon metadata and the Cloudinary URL to the MongoDB database.
    const sermon = await Sermon.create({
        title,
        description,
        sermon_url: result.secure_url,         // The HTTPS URL to access the uploaded audio
        sermon_public_id: result.public_id     // Cloudinary's unique identifier (needed for deletion/updates)
    })

    // Safety check: If the database save failed.
    if(!sermon){
        return res.status(503).json(new ApiError(503, "Failed to update sermon to database").toJSON());
    }

    // Return HTTP 201 (Created) with the new sermon data.
    return res
        .status(201)
        .json(new ApiResponse(201, sermon, "Sermon details uploaded successfully"));
})

// =========================================================================
// @desc    Edit an existing sermon (optionally replace the audio file)
// @route   PUT /api/v1/sermon/:id
// @access  Private (Admin only)
// =========================================================================
export const editSermon = asyncHandler(async (req, res) => {
    // Extract text fields and the optional new audio file.
    const { title, description } = req.body;
    const file = req.file;
    // Extract the sermon ID from the URL parameter.
    const id = req.params.id;

    // At least one field must be provided for an update.
    if(!file && !title && !description){
        return res.status(400).json(new ApiError(400, "All fields are required").toJSON());
    }

    // Find the existing sermon by ID.
    const sermon = await Sermon.findById(id);

    // If not found, return 404.
    if(!sermon){
        return res.status(404).json(new ApiError(404, "Sermon not found").toJSON());
    }

    // If a new audio file was provided, upload it to Cloudinary (overwriting the old one).
    if(file){
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinaryConfig.uploader.upload_stream({
                resource_type: "video",
                overwrite: true,                          // Replace the existing file at the same public_id
                public_id: sermon.sermon_public_id,       // Use the existing public_id so the URL stays the same
                invalidate: true                          // Purge CDN cache so the new file is served immediately
            }, (error, result) => {
                if(error){
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                } else {
                    resolve(result);
                }
            });
            // Pipe the new file buffer into the upload stream.
            streamifier.createReadStream(file.buffer).pipe(stream);
        })
    }
    
    // Update the sermon's text fields in MongoDB.
    const updateSermon = await Sermon.findByIdAndUpdate(id, {
        title,
        description,
    })

    // Safety check: If the database update failed.
    if(!updateSermon){
        return res.status(503).json(new ApiError(503, "Failed to update sermon to database").toJSON());
    }

    // Return the updated sermon data.
    return res
        .status(200)
        .json(new ApiResponse(200, updateSermon, "Sermon details updated successfully"));
})

// =========================================================================
// @desc    Delete a sermon (removes audio from Cloudinary AND document from MongoDB)
// @route   DELETE /api/v1/sermon/:id
// @access  Private (Admin only)
// =========================================================================
export const deleteSermon = asyncHandler(async (req, res) => {
    // Get the sermon ID from the URL.
    const id = req.params.id;

    // Find the sermon to get its Cloudinary public_id.
    const sermon = await Sermon.findById(id);
    if(!sermon){
        return res.status(404).json(new ApiError(404, "Sermon not found").toJSON());
    }

    // Delete the audio file from Cloudinary using its public_id.
    // `resource_type: "video"` must match what was used during upload.
    // `invalidate: true` purges the CDN cache.
    const sermonDelete = await cloudinaryConfig.uploader.destroy(`${sermon.sermon_public_id}`, {
        resource_type: "video",
        invalidate: true
    });

    // Check the result from Cloudinary.
    if(sermonDelete.result === "not found"){
        // The file wasn't found on Cloudinary (maybe already deleted manually).
        return res.status(404).json(new ApiResponse(404, "", "Sermon not found in Cloudinary"))
    } else if(sermonDelete.result === "ok"){
        // Cloudinary deletion was successful — now delete the MongoDB document too.
        await Sermon.findByIdAndDelete(id);
        return res.status(200).json(new ApiResponse(200, "", "Sermon deleted successfully"))
    }
})
