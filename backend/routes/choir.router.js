import { Router } from 'express';
const router = Router();
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/choir.controller.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Optional: protect routes


const choirRouter=Router();
// Public: get all events (optionally by month)
choirRouter.get('/', getEvents);

// Protected CRUD routes for admin
choirRouter.post('/', authMiddleware, createEvent);
choirRouter.put('/:id', authMiddleware, updateEvent);
choirRouter.delete('/:id', authMiddleware, deleteEvent);

export {choirRouter};