import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import { Appointment } from "../models/appointment.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { Slot } from "../models/slot.model.js";
import { bookAppointmentSchema } from "../schema/appointment.schema.js";

const bookAppointment = asyncHandler(async (req, res) => {
    const validation = bookAppointmentSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json(new ApiError(400,validation.error.errors.map(e => e.message).join(", ")).toJSON());
    }

    const { slotId, name, email, phone, appointmentMode, message } = req.body;


    //atomic updates so two people can book the same slot
    const slot = await Slot.findOneAndUpdate(
        { _id: slotId, isBooked: false },
        { $set: { isBooked: true } },
        { new: true }
    );

    if (!slot) {
        return res.status(400).json(new ApiError(400, "Slot already booked or not found").toJSON());
    }

    const appointment = await Appointment.create({
        slotId,
        name,
        email,
        phone,
        appointmentMode,
        message
    });

    slot.appointmentId = appointment._id;
    await slot.save();

    return res.status(201).json(new ApiResponse(true, "Appointment created successfully", appointment));
});

const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find().populate('slotId', 'date startTime endTime').lean();

  return res.status(200).json(new ApiResponse(200, appointments, "Appointments retrieved successfully"));

});
const updateAppointmentStatus=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    const {status}=req.body;

    if(!['pending','confirmed','cancelled'].includes(status)){
        return res.status(400).json(new ApiError(400,"Invalid status").toJSON());
    }

    const appointment=await Appointment.findById(id);

    if(!appointment){
        return res.status(404).json(new ApiError(404,"Appointment not found").toJSON());
    }

    if(status==="cancelled"){
        const slot=await Slot.findById(appointment.slotId);

        if(slot){
            slot.isBooked=false;
            slot.appointmentId=null;
            await slot.save();
        }
    }

    appointment.status=status;
    await appointment.save();

    return res.status(200).json(new ApiResponse(true,"Appointment status updated successfully",appointment));
})

export {bookAppointment,getAppointments,updateAppointmentStatus};
