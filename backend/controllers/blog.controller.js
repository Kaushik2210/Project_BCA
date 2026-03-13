import Blog from "../models/blog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { blogSchema } from "../schema/blog.schema.js";
import mongoose from "mongoose";


//pagination
const getBlogs=asyncHandler(async(req,res)=>{
    const page=Math.max(1,parseInt(req.query.page)||1);
    const limit=Math.max(1,parseInt(req.query.limit)||4);
    
    const filter={status:'published'}
    const totalBlogs=await Blog.countDocuments(filter);
    if(totalBlogs===0){
        return res.status(200).json(new ApiResponse(200,{blogs:[],pagination:{total:0,page,limit,totalPages:0}},"Blogs fetched successfully"));
    }

    const totalPages=Math.ceil(totalBlogs/limit);
    const skip=(page-1)*limit;

    
    const blogs=await Blog.find().sort({createdAt:-1}).skip(skip).limit(limit);

    if(!blogs){
        return res.status(404).json(new ApiError(404,"No blogs found").toJSON());
    }
    return res.status(200).json(new ApiResponse(200,{blogs,pagination:{total:totalBlogs,page,limit,totalPages}}, "Blogs fetched successfully"));
})

const getBlogsAdmin=asyncHandler(async(req,res)=>{
    const page=Math.max(1,parseInt(req.query.page)||1);
    const limit=Math.max(1,parseInt(req.query.limit)||4);
    
    const totalBlogs=await Blog.countDocuments();
    if(totalBlogs===0){
        return res.status(200).json(new ApiResponse(200,{blogs:[],pagination:{total:0,page,limit,totalPages:0}},"Blogs fetched successfully"));
    }

    const totalPages=Math.ceil(totalBlogs/limit);
    const skip=(page-1)*limit;

    
    const blogs=await Blog.find().sort({createdAt:-1}).skip(skip).limit(limit);

    if(!blogs){
        return res.status(404).json(new ApiError(404,"No blogs found").toJSON());
    }
    return res.status(200).json(new ApiResponse(200,{blogs,pagination:{total:totalBlogs,page,limit,totalPages}}, "Blogs fetched successfully"));
})

const postBlog = asyncHandler(async (req, res) => {
  const { title, content, author, category, excerpt, coverImage, tags, status } = req.body;
  let counter = 1;

  if (!title || !content) {
    return res.status(400).json(new ApiError(400, "Title and content are required").toJSON());
  }

  let slug = title.toLowerCase().replace(/[^a-z0-9\s-]+/g, "").replace(/\s+/g, "-");
  const baseSlug = slug;
  while (await Blog.findOne({ slug })) {
    counter++
    slug = `${baseSlug}-${counter}`;
  }

  const newBlog = await Blog.create({
    title, content, slug,
    author: author || '',
    category: category || 'Other',
    excerpt: excerpt || '',
    coverImage: coverImage || '',
    tags: Array.isArray(tags) ? tags : [],
    status: status || 'draft',
  });

  return res.status(201).json(new ApiResponse(201, newBlog, "Blog created successfully"));
});


const getBlogsBySlug=asyncHandler(async(req,res)=>{
    const {slug}=req.params;

    const blog=await Blog.findOne({slug});
    if(!blog){
        return res.status(404).json(new ApiError(404,"Blog not found").toJSON());
    }

    return res.status(200).json(new ApiResponse(200,blog,"Blog fetched successfully"));
})

const editBlog = asyncHandler(async (req, res) => {
  const { id } = req.params; 
  const { title, content, author, category, excerpt, coverImage, tags, status } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json(new ApiError(404, "Blog not found").toJSON());
  if (title!== undefined) blog.title= title;
  if (content!== undefined) blog.content=content;
  if (author!== undefined) blog.author=author;
  if (category!== undefined) blog.category=category;
  if (excerpt!== undefined) blog.excerpt=excerpt;
  if (coverImage!== undefined) blog.coverImage=coverImage;
  if (tags!== undefined) blog.tags=tags;
  if (status!== undefined) blog.status=status;

  const updatedBlog = await blog.save();
  return res.status(200).json(new ApiResponse(200, updatedBlog, "Blog updated successfully"));
});


const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id || id === "undefined") {
        return res.status(400).json(new ApiError(400, "Valid Blog ID is required"));
    }

    const deleted = await Blog.findByIdAndDelete(id);

    if (!deleted) {
        return res.status(404).json(new ApiError(404, "Blog not found").toJSON());
    }

    return res.status(200).json(new ApiResponse(200, null, "Blog deleted successfully"));
});



export {getBlogs,getBlogsAdmin,getBlogsBySlug,postBlog,editBlog,deleteBlog};