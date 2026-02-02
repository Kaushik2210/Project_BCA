import mongoose from "mongoose";

const connecttoDB=async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database error:",error);
        process.exit(1);
    }
}
export {connecttoDB}