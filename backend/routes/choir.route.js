import { Router } from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/choir.controller.js';
import {requireAuth} from "../middleware/authMiddleware.js";


const choirRouter=Router();
choirRouter.get('/', getEvents);
choirRouter.post('/', requireAuth, createEvent);
choirRouter.put('/:id', requireAuth, updateEvent);
choirRouter.delete('/:id', requireAuth, deleteEvent);

export {choirRouter};