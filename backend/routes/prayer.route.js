// Import prayer controller functions.
import { createPrayer, getPrayers, markAsPrayed, deletePrayer } from "../controllers/prayer.controller.js";
import express from "express";
// Import auth middleware.
import { requireAuth } from "../middleware/authMiddleware.js";

// Create the prayer router.
const prayerRouter = express.Router();

// PROTECTED: GET all prayer requests (admin only).
prayerRouter.get("/", requireAuth, getPrayers);
// PUBLIC: POST a new prayer request (anyone on the website can submit).
prayerRouter.post("/", createPrayer);
// PROTECTED: DELETE prayer requests in bulk (admin only).
prayerRouter.delete("/", requireAuth, deletePrayer);
// PROTECTED: PUT to mark a prayer as "prayed for" by its ID.
prayerRouter.put("/:id/pray", requireAuth, markAsPrayed);

// Export the router.
export { prayerRouter };
