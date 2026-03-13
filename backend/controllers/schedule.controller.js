import Schedule from "../models/schedule.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

//
// @desc    Get all schedule days
// @route   GET /api/v1/schedule
// @access  Public
//
export const getSchedule =asyncHandler(async (req,res)=>{
  const schedule = await Schedule.find().sort({ createdAt: 1 });

  if(!schedule){
    return res.status(404).json(new ApiError(404,"No schedule found").toJSON());
  }

  res.status(200).json(new ApiResponse(200,schedule,"Schedule retrieved successfully"));

});

//
// @desc    Create schedule day
// @route   POST /api/v1/schedule
// @access  Private (Admin)
//
export const createSchedule =asyncHandler( async (req, res) => {
  
  const { date, events } = req.body;
  const newDay = await Schedule.create({ date, events });
  
  if(!newDay){
    return res.status(500).json(new ApiError(500,"Failed to create schedule").toJSON());
  }

  return res.status(201).json(new ApiResponse(201,newDay,"Schedule created successfully"));
});

//
// @desc    Update schedule day
// @route   PUT /api/v1/schedule/:id
// @access  Private (Admin)
//
export const updateSchedule = asyncHandler(async (req, res) => {
  
  const updated = await Schedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updated) {
    return res.status(404).json(new ApiError(404,"Schedule not found").toJSON());
  }

  return res.status(200).json(new ApiResponse(200,updated,"Schedule updated successfully"));

});

//
// @desc    Delete schedule day
// @route   DELETE /api/v1/schedule/:id
// @access  Private (Admin)
//
export const deleteSchedule = asyncHandler(async (req, res) => {
  
  const deleted = await Schedule.findByIdAndDelete(req.params.id);
  
  if (!deleted) {
    return res.status(404).json(new ApiError(404,"Schedule not found").toJSON());
  }

  return res.status(200).json(new ApiResponse(200,null,"Schedule deleted successfully"));
});
