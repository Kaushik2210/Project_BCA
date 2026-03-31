// Import Router from Express.
import { Router } from 'express';
// Import choir controller functions.
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/choir.controller.js';
// Import auth middleware.
import { requireAuth } from "../middleware/authMiddleware.js";

// Create the choir router.
const choirRouter = Router();

// PUBLIC: GET all choir events (with optional month/year filtering).
choirRouter.get('/', getEvents);
// PROTECTED: Create a new choir event.
choirRouter.post('/', requireAuth, createEvent);
// PROTECTED: Update an existing choir event by ID.
choirRouter.put('/:id', requireAuth, updateEvent);
// PROTECTED: Delete a choir event by ID.
choirRouter.delete('/:id', requireAuth, deleteEvent);

// Export the router.
export { choirRouter };