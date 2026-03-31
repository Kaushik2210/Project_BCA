// Import contact controller functions.
import { postContact, getContact, markAsReplied } from "../controllers/contact.controller.js";
// Import Express.
import express from "express";
// Import auth middleware for protected routes.
import { requireAuth } from "../middleware/authMiddleware.js";
// Import the rate limiter middleware to prevent spam submissions.
import { RateLimiter } from "../middleware/rateLimiter.js";

// Create the contact router.
const contactRouter = express.Router();

// PROTECTED: GET all contact form submissions (admin only).
contactRouter.get("/", requireAuth, getContact);
// PUBLIC + RATE LIMITED: POST a new contact form submission.
// RateLimiter runs first to block excessive requests from the same IP address.
contactRouter.post("/", RateLimiter, postContact);
// PROTECTED: PUT to mark a contact message as replied by its ID.
contactRouter.put("/:id/reply", requireAuth, markAsReplied);

// Export the router.
export { contactRouter };