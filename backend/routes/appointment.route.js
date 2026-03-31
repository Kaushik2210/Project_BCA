// Import appointment controller functions.
import { bookAppointment, getAppointments, updateAppointmentStatus } from "../controllers/appointment.controller.js";
// Import auth middleware.
import { requireAuth } from "../middleware/authMiddleware.js";
import express from "express";

// Create the appointment router.
const appointmentRouter = express.Router();

// PROTECTED: GET all appointments (admin only).
appointmentRouter.get("/", requireAuth, getAppointments);
// PROTECTED: PUT to update an appointment's status (pending/confirmed/cancelled).
appointmentRouter.put("/:id", requireAuth, updateAppointmentStatus);
// PUBLIC: POST to book a new appointment (any website visitor can book).
appointmentRouter.post("/book", bookAppointment);

// Export the router.
export { appointmentRouter };