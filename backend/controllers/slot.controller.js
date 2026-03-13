import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Slot } from "../models/slot.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getSlotsByDate=asyncHandler(async(req,res)=>{
    const {date}=req.query;
    
 
    const slots=await Slot.find({date,isBooked:false});

    if(!slots){
        return res.status(404).json(new ApiError(404,"No slots are available for the given date"));
    }

    const slotsAvailable=[];

    slots.forEach((slot)=>{
        slotsAvailable.push({[`${slot._id}`]:`${slot.startTime}-${slot.endTime}`});
    })

    return res.status(200).json(new ApiResponse(200,slotsAvailable,"slots are available"));
})

const createSlot=asyncHandler(async(req,res)=>{
    const {date,slots}=req.body;
    const errorSlot=[];

    for(let i=0;i<slots.length;i++){
        const currentSlot=slots[i];
        const conflict = await Slot.findOne({date,startTime: { $lt: currentSlot.endTime },endTime: { $gt: currentSlot.startTime }});

        if(conflict.length!==0){
            errorSlot.push([conflict]);
        }else{
            const newSlot=new Slot(date,currentSlot.startTime,currentSlot.endTime);
            newSlot.save();
        }
    }

    if(errorSlot.length!==0){
        return res.status(409).json(new ApiError(409,"Slots are in conflict with existing slots",errorSlot))
    }

    return res.status(201).json(new ApiResponse(201,"Slots created successfully"));
})
