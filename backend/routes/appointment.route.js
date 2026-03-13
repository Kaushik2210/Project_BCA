import { bookAppointment,getAppointments,updateAppointmentStatus } from "../controllers/appointment.controller.js";
import express from "express";

const appointmentRouter=express.Router();

appointmentRouter.get("/",getAppointments);
appointmentRouter.put("/:id",updateAppointmentStatus);
appointmentRouter.post("/book",bookAppointment);

export {appointmentRouter};