import { postContact,getContact,markAsReplied } from "../controllers/contact.controller.js";
import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import { RateLimiter } from "../middleware/rateLimiter.js";

const contactRouter=express.Router();

contactRouter.get("/",requireAuth,getContact);
contactRouter.post("/",RateLimiter,postContact);
contactRouter.put("/:id/reply",requireAuth,markAsReplied);

export {contactRouter};