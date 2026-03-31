// Import Schema and model from mongoose.
import { Schema, model } from "mongoose";

// Define the Blog schema — each blog post has content, metadata, and publication status.
const blogSchema = new Schema({
    title: {
        type: String,
        required: true          // Every blog must have a title
    },
    content: { 
        type: String,
        required: true          // Blog body content is mandatory
    },
    slug: {
        type: String,
        required: true,         // URL slug is required for routing (e.g., /blog/my-first-post)
        unique: true            // Slugs must be unique to prevent URL collisions
    },
    author: {
        type: String,
        default: ''             // Author name is optional, defaults to empty string
    },
    category: {
        type: String,
        default: 'Other'        // Default category if none specified
    },
    excerpt: {
        type: String,
        default: ''             // Short preview text for blog listing pages
    },
    coverImage: {
        type: String,
        default: ''             // URL to the blog's cover/hero image
    },
    tags: {
        type: [String],         // An array of string tags for categorization (e.g., ["faith", "youth"])
        default: []             // Defaults to an empty array
    },
    status: {
        type: String, 
        enum: ['draft', 'published'],  // Only these two values are allowed (Mongoose enforces this)
        default: 'draft'                // New blogs start as drafts until explicitly published
    }
}, { 
    timestamps: true   // Automatically adds createdAt and updatedAt fields
});

// Compile and export the model bound to the 'Blog' collection.
const Blog = model("Blog", blogSchema);
export default Blog;