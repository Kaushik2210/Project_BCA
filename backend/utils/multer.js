// Import the multer library — middleware for handling multipart/form-data file uploads in Express.
import multer from "multer";

// Configure multer with in-memory storage.
// Instead of saving uploaded files to disk, they are kept in RAM as Buffer objects.
// This is ideal when we plan to immediately stream the file to a cloud service like Cloudinary.
const storage = multer({
    storage: multer.memoryStorage(),  // Store files in memory (req.file.buffer)
    limits: {
        fileSize: 50 * 1024 * 1024   // Maximum file size: 50 MB (50 * 1024 KB * 1024 bytes)
    }
})

// Export the configured multer instance for use in route definitions.
export default storage;