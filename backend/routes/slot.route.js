import express from "express";
import { createSlot, getSlotsByDate } from "../controllers/slot.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const slotRouter = express.Router();

slotRouter.get("/", getSlotsByDate);
slotRouter.post("/",requireAuth, createSlot);

export { slotRouter };
