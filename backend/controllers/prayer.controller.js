import Prayer from "../models/prayer.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { prayerSchema } from "../schema/prayer.schema.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const createPrayer=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;

    const {error}=prayerSchema.safeParse({name,description});

    if(error){
        return res.status(400).json(new ApiError(400,error.issues[0].message).toJSON());
    }

    const prayer=await Prayer.create({name,description});

    if(!prayer){
        return res.status(500).json(new ApiError(500,"Failed to create prayer").toJSON());
    }

    return res.status(201).json(new ApiResponse(201,prayer,"Prayer created successfully").toJSON());

})

export const getPrayers=asyncHandler(async(req,res)=>{
    const prayers=await Prayer.find().sort({createdAt:-1});

    if(!prayers){
        return res.status(500).json(new ApiError(500,"Failed to fetch prayers").toJSON());
    }

    return res.status(200).json(new ApiResponse(200,prayers,"Prayers fetched successfully").toJSON());
})

export const markAsPrayed=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    const prayer=await Prayer.findById(id);

    if(!prayer){
        return res.status(404).json(new ApiError(404,"Prayer not found").toJSON());
    }

    prayer.prayed=true;
    await prayer.save();
    return res.status(200).json(new ApiResponse(200,prayer,"Prayer marked as prayed").toJSON());
})

export const deletePrayer=asyncHandler(async(req,res)=>{
    const ArrayOfIds=req.body.ids;
    const result=await Prayer.deleteMany({_id:{$in:ArrayOfIds}});

    if(result.deletedCount===0){
        return res.status(404).json(new ApiError(404,"No prayers found to delete").toJSON());
    }

    return res.status(200).json(new ApiResponse(200,null,`${result.deletedCount} prayers deleted successfully`).toJSON());
})

export {createPrayer,getPrayers,markAsPrayed,deletePrayer}
