// Import Zod.
import zod from "zod";

// Zod validation schema for blog posts.
// Ensures that title and content are present and non-empty strings.
export const blogSchema = zod.object({
    title: zod.string().min(1, "Title is required"),     // Blog title must be at least 1 character
    content: zod.string().min(1, "Content is required")  // Blog content must be at least 1 character
})