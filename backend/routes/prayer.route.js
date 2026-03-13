import { createPrayer,getPrayers,markAsPrayed,deletePrayer } from "../controllers/prayer.controller.js";
import express from "express";
import requireAuth from "../middleware/authMiddleware.js";

const prayerRouter=express.Router();

prayerRouter.use(requireAuth);

prayerRouter.get("/",getPrayers);
prayerRouter.post("/",createPrayer);
prayerRouter.delete("/",deletePrayer);
prayerRouter.put("/:id/pray",markAsPrayed);

export {prayerRouter};
