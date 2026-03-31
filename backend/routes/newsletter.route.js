// Import newsletter controller functions.
import { collectEmail, getSubscribers } from "../controllers/newsletter.controller.js";
import express from "express";
// Import rate limiter to prevent spam subscribe attempts.
import { RateLimiter } from "../middleware/rateLimiter.js";
// Import auth middleware for protected routes.
import { requireAuth } from "../middleware/authMiddleware.js";

// Create the newsletter router.
const newsletterRouter = express.Router();

// PROTECTED: GET all subscribers (admin only).
newsletterRouter.get("/", requireAuth, getSubscribers);
// PUBLIC + RATE LIMITED: POST to subscribe a new email to the newsletter.
newsletterRouter.post("/subscribe", RateLimiter, collectEmail);

// Export the router.
export { newsletterRouter };