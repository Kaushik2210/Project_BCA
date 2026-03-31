// Import blog controller functions.
import { getBlogs, getBlogsAdmin, getBlogsBySlug, editBlog, deleteBlog, postBlog } from "../controllers/blog.controller.js";
// Import Express.
import express from "express";
// Import auth middleware.
import { requireAuth } from "../middleware/authMiddleware.js";

// Create the blog router.
const blogRouter = express.Router();

// ---- PUBLIC ROUTES (no auth required) ----
// GET published blogs with pagination.
blogRouter.get("/", getBlogs);                         
// GET a single blog by its URL-friendly slug (e.g., /api/v1/blogs/my-first-post).
blogRouter.get("/:slug", getBlogsBySlug);             

// ---- PROTECTED ADMIN ROUTES ----
// GET all blogs including drafts (admin view). Must be defined BEFORE /:slug to avoid route conflicts.
blogRouter.get("/admin/all", requireAuth, getBlogsAdmin);
// POST a new blog.
blogRouter.post("/", requireAuth, postBlog);
// PUT (edit) an existing blog by its MongoDB ID.
blogRouter.put("/:id", requireAuth, editBlog);
// DELETE a blog by ID.
blogRouter.delete("/:id", requireAuth, deleteBlog);

// Export the router.
export { blogRouter };
