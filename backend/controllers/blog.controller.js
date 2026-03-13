import Blog from "../models/blog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { blogSchema } from "../schema/blog.schema.js";


//pagination
const getBlogs=asyncHandler(async(req,res)=>{
    const page=Math.max(1,parseInt(req.query.page)||1);
    const limit=Math.max(1,parseInt(req.query.limit)||4);

    const totalBlogs=await Blog.countDocuments();
    if(totalBlogs===0){
        return res.status(200).json(new ApiResponse(200,{blogs:[],pagination:{total:0,page,limit,totalPages:0}},"Blogs fetched successfully"));
    }

    const totalPages=Math.ceil(totalBlogs/limit);
    const skip=(page-1)*limit;

    
    const blogs=await Blog.find().sort({createdAt:-1}).skip(skip).limit(limit);

    return res.status(200).json(new ApiResponse(200,{blogs,pagination:{total:totalBlogs,page,limit,totalPages}}, "Blogs fetched successfully"));
})

const postBlog=asyncHandler(async(req,res)=>{
    const {title,content}=req.body;
    let counter=1;

    if(!title || !content){
        return res.status(400).json(new ApiError(400,"Title and content are required").toJSON());
    }

    const validateBlog=blogSchema.safeParse({title,content});

    if(!validateBlog.success){
        const errors=validateBlog.error.errors.map(err=>err.message).join(", ");
        return res.status(400).json(new ApiError(400,errors).toJSON());
    }

    let slug=title.toLowerCase().replace(/[^a-z0-9\s-]+/g,"").replace(/\s+/g,"-");

    while(await Blog.findOne({slug})){
        counter++;
        slug=`${slug}-${counter}`;
    }
    const newBlog=await Blog.create({title,content,slug});

    if(!newBlog){
        return res.status(500).json(new ApiError(500,"Failed to create blog").toJSON());
    }
    return res.status(201).json(new ApiResponse(201,newBlog,"Blog created successfully"));
})

const getBlogsBySlug=asyncHandler(async(req,res)=>{
    const {slug}=req.params;

    const blog=await Blog.findOne({slug});
    if(!blog){
        return res.status(404).json(new ApiError(404,"Blog not found").toJSON());
    }

    return res.status(200).json(new ApiResponse(200,blog,"Blog fetched successfully"));
})

const editBlog=asyncHandler(async(req,res)=>{
    const {slug}=req.params;
    const {title,content}=req.body;

    const blog=await Blog.findOne({slug});
    if(!blog){
        return res.status(404).json(new ApiError(404,"Blog not found").toJSON());
    }

    if(title) blog.title=title;
    if(content) blog.content=content;

    const updatedBlog=await blog.save();
    return res.status(200).json(new ApiResponse(200,updatedBlog,"Blog updated successfully"));
})

const deleteBlog=asyncHandler(async(req,res)=>{
    const {slug}=req.params;

    const deleted=await Blog.findOneAndDelete({slug});

    if(!deleted){
        return res.status(404).json(new ApiError(404,"Blog not found").toJSON());
    }
    return res.status(200).json(new ApiResponse(200,null,"Blog deleted successfully"));
})



export {getBlogs,getBlogsBySlug,postBlog,editBlog,deleteBlog};