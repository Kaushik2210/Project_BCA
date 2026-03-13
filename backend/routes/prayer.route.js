import { createPrayer,getPrayers,markAsPrayed,deletePrayer } from "../controllers/prayer.controller.js";
import express from "express";
import requireAuth from "../middleware/authMiddleware.js";

const prayerRouter=express.Router();

prayerRouter.get("/",requireAuth,getPrayers);
prayerRouter.post("/",createPrayer);
prayerRouter.delete("/",requireAuth,deletePrayer);
prayerRouter.put("/:id/pray",requireAuth,markAsPrayed);

export {prayerRouter};
