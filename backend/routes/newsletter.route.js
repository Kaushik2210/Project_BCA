import { collectEmail,getSubscribers } from "../controllers/newsletter.controller.js";
import express from "express";
import { RateLimiter } from "../middleware/rateLimiter.js";
import requireAuth from "../middleware/authMiddleware.js";

const newsletterRouter=express.Router();

newsletterRouter.get("/", requireAuth, getSubscribers);
newsletterRouter.post("/subscribe",RateLimiter,collectEmail);

export {newsletterRouter};