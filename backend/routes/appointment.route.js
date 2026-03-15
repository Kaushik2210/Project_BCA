import { bookAppointment,getAppointments,updateAppointmentStatus } from "../controllers/appointment.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import express from "express";

const appointmentRouter=express.Router();

appointmentRouter.get("/",requireAuth,getAppointments);
appointmentRouter.put("/:id",requireAuth,updateAppointmentStatus);
appointmentRouter.post("/book",bookAppointment);

export {appointmentRouter};