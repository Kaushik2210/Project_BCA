import { collectEmail } from "../controllers/newsletter.controller";
import express from "express";
import { RateLimiter } from "../middleware/rateLimiter";

const newsletterRouter=express.Router();

newsletterRouter.post("/subscribe",RateLimiter,collectEmail);

export {newsletterRouter};