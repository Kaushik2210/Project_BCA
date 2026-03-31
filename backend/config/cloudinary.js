// Import Cloudinary's v2 SDK and alias it as 'cloudinary' for cleaner usage.
import { v2 as cloudinary } from "cloudinary";
// Import dotenv to load environment variables from the .env file.
import dotenv from "dotenv";
// Execute dotenv.config() to make process.env variables available.
dotenv.config();

// Configure the Cloudinary SDK with credentials from environment variables.
// These credentials link your app to your specific Cloudinary cloud account.
cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,         // Your Cloudinary API key
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   // Your cloud name (unique identifier)
    api_secret: process.env.API_SECRET               // Your API secret (keep this private!)
})

// Log to confirm Cloudinary was configured during server startup.
console.log("Cloudinary configured");

// Export the configured Cloudinary instance for use in controllers/utilities.
export default cloudinary;