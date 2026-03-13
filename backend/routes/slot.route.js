import express from "express";
import { createSlot, getSlotsByDate } from "../controllers/slot.controller.js";

const slotRouter = express.Router();

slotRouter.get("/", getSlotsByDate);
slotRouter.post("/", createSlot);

export { slotRouter };
