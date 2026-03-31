// Import mongoose — the ODM (Object Data Modeling) library for MongoDB and Node.js.
import mongoose from "mongoose";

// Define an async function to establish the MongoDB database connection.
const connecttoDB = async () => {
    try {
        // `mongoose.connect()` opens a connection to the MongoDB database.
        // The connection string (including username, password, cluster URL) is stored
        // securely in the .env file and accessed via `process.env.MONGODB_URL`.
        await mongoose.connect(process.env.MONGODB_URL);
        // If connection succeeds, log confirmation.
        console.log("Database connected successfully");
    } catch (error) {
        // If the connection fails (wrong URL, network issues, etc.), log the error.
        console.error("Database error:", error);
        // `process.exit(1)` immediately terminates the Node.js process with a failure code.
        // We do this because the server cannot function without a database connection.
        process.exit(1);
    }
}

// Export the function so it can be called from index.js during server startup.
export { connecttoDB }