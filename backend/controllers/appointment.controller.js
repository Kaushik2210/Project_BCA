import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import { Appointment } from "../models/appointment.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { Slot } from "../models/slot.model.js";
import { bookAppointmentSchema } from "../schema/appointment.schema.js";
import { appointmentQueue } from "../utils/queue.js";
import { createMeetLink } from "../utils/googleScheduling.js";

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

    return res.status(201).json(new ApiResponse(201, "Appointment created successfully", appointment));
});

const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find().populate('slotId', 'date startTime endTime').lean();

  return res.status(200).json(new ApiResponse(200, appointments, "Appointments retrieved successfully"));

});

const updateAppointmentStatus=asyncHandler(async(req,res)=>{
    console.log("Updating appointment status...");
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

    if(status==="confirmed"){
        const slot=await Slot.findById(appointment.slotId);

        if(slot){
            slot.isBooked=true;
            slot.appointmentId=appointment._id;
            await slot.save();

            if(appointment.appointmentMode==="virtual"){
                const date=slot.date.toISOString().split("T")[0];
                const startTime= new Date(`${date}T${slot.startTime}:00`).toISOString();
                const endTime= new Date(`${date}T${slot.endTime}:00`).toISOString();
                const meetLink=await createMeetLink(date,startTime,endTime,appointment.email);
                console.log("Meet link created:", meetLink);
                const options={month:'short',day:'numeric',year:'numeric'}
                const dateFormatted=new Date(slot.date).toLocaleDateString("en-US",options);
                const startTimeFormatted=new Date()
                startTimeFormatted.setHours(slot.startTime.split(":")[0])
                startTimeFormatted.setMinutes(slot.startTime.split(":")[1])
                const TimeFormatted=startTimeFormatted.toLocaleTimeString("en-US",{hour:'2-digit',minute:'2-digit'});
                appointmentQueue.add("send-email",{
                    email:appointment.email,
                    name:appointment.name,
                    subject:"Appointment with the pastor confirmed",
                    date:dateFormatted,
                    startTime:TimeFormatted,
                    meetLink:meetLink,
                })
            }
        }
    }

    appointment.status=status;

    await appointment.save();

    return res.status(200).json(new ApiResponse(200,"Appointment status updated successfully",appointment));
})

export {bookAppointment,getAppointments,updateAppointmentStatus};
