// Import custom utility classes for consistent API error and response formatting.
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Import the async handler wrapper to catch async errors automatically.
import { asyncHandler } from "../utils/asyncHandler.js";

// Import the Admin Mongoose model to interact with the 'admins' collection in MongoDB.
import { Admin } from "../models/admin.model.js";

// =========================================================================
// @desc    Create a new admin user
// @route   POST /api/v1/admin
// @access  Private (Super-Admin only)
// =========================================================================
const createAdmin = asyncHandler(async (req, res) => {
    // Extract username and password from the request body.
    const { username, password } = req.body;

    // Validate that both fields are provided.
    if(!username || !password){
        return res.status(400).json(new ApiError(400, "Username and password is required").toJSON());
    }

    // Check if an admin with the same username already exists in the database.
    const existedAdmin = await Admin.findOne({ username });
    // If a duplicate is found, return HTTP 409 (Conflict).
    if (existedAdmin) {
        return res.status(409).json(new ApiError(409, "Admin with this username already exists").toJSON());
    }

    // Create the new admin document in MongoDB.
    // The password will be automatically hashed by the Mongoose 'pre-save' hook defined in the Admin model.
    const admin = await Admin.create({
        username,
        password
    })

    // Safety check: if the create operation failed for some reason.
    if(!admin){
        return res.status(404).json(new ApiError(404, "Error creating admin").toJSON());
    }

    // Return success response (we do NOT send back the password).
    return res.status(200).json(new ApiResponse(200, "Admin User created successfully"));
})

// =========================================================================
// @desc    Get all admin users (without their passwords)
// @route   GET /api/v1/admin
// @access  Private (Super-Admin only)
// =========================================================================
const getAdmin = asyncHandler(async (req, res) => {
    // Fetch all admin documents from the database.
    // `.select("-password")` explicitly EXCLUDES the password field from the returned data for security.
    const admin = await Admin.find().select("-password");
    // Return the list of admins.
    return res.status(200).json(new ApiResponse(200, admin, "Admins fetched successfully"));
})

// =========================================================================
// @desc    Update an admin's password
// @route   PUT /api/v1/admin
// @access  Private (Super-Admin only)
// =========================================================================
const updateAdmin = asyncHandler(async (req, res) => {
    // Destructure the new password and the admin's ID from the request body.
    // `password:newPassword` renames the destructured variable to 'newPassword' for clarity.
    const { password: newPassword, id } = req.body;

    // Validate that both the new password and the admin ID are provided.
    if(!newPassword || !id){
        return res.status(400).json(new ApiError(400, "All fields are required").toJSON());
    }

    // Find the specific admin document by its MongoDB ObjectId.
    const admin = await Admin.findById(id);

    // If no admin was found with that ID, return 404.
    if(!admin){
        return res.status(404).json(new ApiError(404, "Admin not found").toJSON());
    }

    // Set the new password on the Mongoose document instance.
    // When we call `.save()` next, the 'pre-save' hook in the model will automatically hash this plain-text password.
    admin.password = newPassword;
    // Persist the changes to MongoDB.
    await admin.save();

    // Return success (no data payload needed — just confirmation).
    return res.status(200).json(new ApiResponse(200, null, "Password updated successfully"));
})

// =========================================================================
// @desc    Delete an admin user permanently
// @route   DELETE /api/v1/admin
// @access  Private (Super-Admin only)
// =========================================================================
const deleteAdmin = asyncHandler(async (req, res) => {
    // Extract the admin ID from the request body.
    const { id } = req.body;

    // Validate that an ID was actually provided.
    if(!id){
        return res.status(400).json(new ApiError(400, "Admin ID is required").toJSON());
    }

    // Find the admin by ID and delete it in one atomic operation.
    const admin = await Admin.findByIdAndDelete(id);

    // If no document was found/deleted, the ID was invalid.
    if(!admin){
        return res.status(404).json(new ApiError(404, "Admin not found").toJSON());
    }

    // Confirm deletion.
    return res.status(200).json(new ApiResponse(200, "Admin deleted successfully"));
})

// Export all four CRUD functions using named exports.
export { createAdmin, getAdmin, updateAdmin, deleteAdmin };