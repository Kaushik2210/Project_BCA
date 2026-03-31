// Import Zod.
import zod from "zod";

// Zod validation schema for contact form submissions.
// Validates that the name, email, and message are all present and properly formatted.
export const contactSchema = zod.object({
    name: zod.string().min(1, "Name is required"),         // Name must be non-empty
    email: zod.email("Invalid email address"),              // Must be a valid email format
    message: zod.string().min(1, "Message is required")    // Message must be non-empty
})