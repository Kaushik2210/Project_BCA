import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Newsletter } from "../models/newsletter.model.js";
import zod from "zod";

const collectEmail=asyncHandler(async(req,res)=>{
    const {email}=req.body;

    const validateEmail=zod.email("Invalid email address").safeParse(email);

    if(!validateEmail.success){
        return res.status(400).json(new ApiError(400,validateEmail.error.errors[0].message).toJSON());
    }

    const existing=await Newsletter.findOne({email});

    if(existing){
        return res.status(400).json(new ApiError(400,"Email already subscribed").toJSON());
    }

    const newSubscription=await Newsletter.create({email});

    if(!newSubscription){
        return res.status(500).json(new ApiError(500,"Failed to subscribe").toJSON());
    }

    return res.status(201).json(new ApiResponse(201,null,"Subscribed successfully"));
})

const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});


export {collectEmail,getSubscribers};