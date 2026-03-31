// Import the configured Express application from app.js.
import app from "./app.js";

// Import dotenv to load environment variables from the .env file into process.env.
import dotenv from 'dotenv';

// Import the database connection function.
import { connecttoDB } from "./config/database.js";

// Execute dotenv.config() to make all .env variables available via process.env.
dotenv.config();

// Read the PORT number from environment variables (e.g., PORT=8000).
const PORT = process.env.PORT;

// ---- SERVER STARTUP SEQUENCE ----
// 1. First, connect to MongoDB.
// 2. Only AFTER the database connection succeeds, start listening for HTTP requests.
// This ensures the server never accepts requests before the database is ready.
connecttoDB().then(() => {
    // `app.listen()` starts the HTTP server on the specified port.
    app.listen(PORT, () => {
         // Log a confirmation message with the port number.
         console.log(`The server is running on localhost:${PORT}`)
    })
}).catch((error) => {
    // If the database connection fails, log the error and terminate the process.
    console.error("Failed to connect to the database:", error);
    // Exit code 1 signals an error to the operating system.
    process.exit(1);
});