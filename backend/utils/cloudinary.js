// Import Cloudinary's v2 SDK and alias it as 'cloudinary'.
import { v2 as cloudinary } from 'cloudinary';
// Import dotenv to load environment variables.
import dotenv from 'dotenv';
dotenv.config();

// Configure the Cloudinary SDK with credentials from the .env file.
// This is the UTILS version — used in controllers that need cloudinary operations.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,   // Your unique Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY,          // API key for authentication
  api_secret: process.env.API_SECRET,               // API secret (keep private)
});

// Export the configured instance.
export default cloudinary;
