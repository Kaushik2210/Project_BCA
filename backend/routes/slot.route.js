// Import Express.
import express from "express";
// Import slot controller functions.
import { createSlot, getSlotsByDate } from "../controllers/slot.controller.js";
// Import auth middleware.
import { requireAuth } from "../middleware/authMiddleware.js";

// Create the slot router.
const slotRouter = express.Router();

// PUBLIC: GET available (unbooked) slots for a given date.
slotRouter.get("/", getSlotsByDate);
// PROTECTED: POST to create new time slots (admin only).
slotRouter.post("/", requireAuth, createSlot);

// Export the router.
export { slotRouter };
