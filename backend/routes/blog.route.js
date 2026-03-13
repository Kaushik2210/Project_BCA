import { getBlogs,getBlogsAdmin,getBlogsBySlug,editBlog,deleteBlog,postBlog } from "../controllers/blog.controller.js";
import express from "express";
import requireAuth from "../middleware/authMiddleware.js";

const blogRouter=express.Router();

// Public routes
blogRouter.get("/", getBlogs);                         
blogRouter.get("/:slug", getBlogsBySlug);             

// Admin routes 
blogRouter.get("/admin/all", requireAuth, getBlogsAdmin);
blogRouter.post("/", requireAuth, postBlog);
blogRouter.put("/:id", requireAuth, editBlog);
blogRouter.delete("/:id", requireAuth, deleteBlog);

export {blogRouter};




