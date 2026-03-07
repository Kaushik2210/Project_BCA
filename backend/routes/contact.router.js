import { postContact,getContact,markAsReplied } from "../controllers/contact.controller.js";
import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import { contactRateLimiter } from "../middleware/rateLimiter.js";

const contactRouter=express.Router();

contactRouter.get("/",getContact);
contactRouter.post("/",contactRateLimiter,postContact);
contactRouter.put("/:id/reply",requireAuth,markAsReplied);

export {contactRouter};