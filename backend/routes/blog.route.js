import { getBlogs,getBlogsBySlug,editBlog,deleteBlog,postBlog } from "../controllers/blog.controller.js";
import express from "express";
import requireAuth from "../middleware/authMiddleware.js";

const blogRouter=express.Router();

blogRouter.get("/",getBlogs);
blogRouter.get("/:slug",getBlogsBySlug);
blogRouter.post("/",requireAuth,postBlog);
blogRouter.put("/:slug",requireAuth,editBlog);
blogRouter.delete("/:slug",requireAuth,deleteBlog);

export {blogRouter};




