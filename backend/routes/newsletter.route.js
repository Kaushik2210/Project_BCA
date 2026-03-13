import { collectEmail } from "../controllers/newsletter.controller.js";
import express from "express";
import { RateLimiter } from "../middleware/rateLimiter.js";

const newsletterRouter=express.Router();

newsletterRouter.post("/subscribe",RateLimiter,collectEmail);

export {newsletterRouter};