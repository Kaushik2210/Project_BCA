import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import Sermon from "../models/sermon.model.js"
import cloudinaryConfig from "../utils/cloudinary.js"
import streamifier from "streamifier";

export const getSermons=asyncHandler(async (req,res) => {
    // support pagination: ?page=1&limit=6
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 6);

    const totalSermons = await Sermon.countDocuments();
    if (totalSermons === 0) {
        return res.status(200).json(new ApiResponse(200, { sermons: [], pagination: { total: 0, page, limit, totalPages: 0 } }, "Sermons fetched successfully"));
    }

    const totalPages = Math.ceil(totalSermons / limit);
    const skip = (page - 1) * limit;

    const sermons = await Sermon.find({}, 'description title sermon_url sermon_public_id')
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);

    if(!sermons){
        return res.status(404).json(new ApiError(404,"No sermons found"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { sermons, pagination: { total: totalSermons, page, limit, totalPages } }, "Sermons fetched successfully"));

})

export const postSermon=asyncHandler(async(req,res)=>{
    const {title,description}=req.body;
    const file=req.file;

    if(!file || !title || !description){
        return res.status(400).json(new ApiError(400,"All fields are required"));
    }

    //uploading audio to Cloudinary
    const result=await new Promise((resolve,reject)=>{
        const stream=cloudinaryConfig.uploader.upload_stream({
            resource_type:"video",
            folder:"sermons"
        },(error,result)=>{
            if(error){
                console.error("Cloudinary upload error:", error);
                reject(error);
            }else{
                resolve(result);
            }
        });

        streamifier.createReadStream(file.buffer).pipe(stream);
    })

    const sermon=await Sermon.create({
        title,
        description,
        sermon_url:result.secure_url,
        sermon_public_id:result.public_id
    })

    //db failed to save the sermon
    if(!sermon){
        throw new ApiError(503,"Failed to save sermon to database");
    }

    return res
        .status(201)
        .json(new ApiResponse(201,"","Sermon details uploaded successfully"))

})

export const editSermon=asyncHandler(async (req,res) => {
    const {title,description}=req.body;
    const file=req.file;
    const id=req.params.id;

    if(!file && !title && !description){
        return res.status(400).json(new ApiError(400,"All fields are required"));
    }

    const sermon=await Sermon.findById(id);

    if(!sermon){
        return res.status(404).json(new ApiError(404,"Sermon not found"));
    }

    //uploading audio to Cloudinary
    if(file){
        const result=await new Promise((resolve,reject)=>{
            const stream=cloudinaryConfig.uploader.upload_stream({
                resource_type:"video",
                overwrite:true,
                public_id:sermon.sermon_public_id,
                invalidate:true
            },(error,result)=>{
                if(error){
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                }else{
                    resolve(result);
                }
            });
            streamifier.createReadStream(file.buffer).pipe(stream);
        })
    }
    

    const updateSermon=await Sermon.findByIdAndUpdate(id,{
        title,
        description,
    })

    //db failed to save the sermon
    if(!updateSermon){
        throw new ApiError(503,"Failed to update sermon to database");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,"","Sermon details updated successfully"))

})

export const deleteSermon=asyncHandler(async(req,res)=>{
    const id=req.params.id;
    const sermon=await Sermon.findById(id);
    if(!sermon){
        return res.status(404).json(new ApiError(404,"Sermon not found"));
    }


    const sermonDelete=await cloudinaryConfig.uploader.destroy(`${sermon.sermon_public_id}`,{
        resource_type:"video",
        invalidate:true
    });

    if(sermonDelete.result==="not found"){
        return res.status(404).json(new ApiResponse(404,"","Sermon not found in Cloudinary"))
    }else if(sermonDelete.result==="ok"){
        await Sermon.findByIdAndDelete(id);
        return res.status(200).json(new ApiResponse(200,"","Sermon deleted successfully"))
    }

})

