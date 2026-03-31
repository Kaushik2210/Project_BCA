// Import Express framework to create a Router.
import express from 'express';
// Import all schedule controller functions (CRUD operations).
import { getSchedule, createSchedule, updateSchedule, deleteSchedule } from '../controllers/schedule.controller.js';
// Import the auth middleware that verifies JWT tokens on protected routes.
import { requireAuth } from "../middleware/authMiddleware.js";

// Create a new Express Router instance — a mini-app that handles a group of related routes.
const scheduleRouter = express.Router();

// PUBLIC ROUTE: GET /api/v1/schedule — anyone can view the church schedule.
scheduleRouter.get('/', getSchedule);
// PROTECTED ROUTE: POST — only authenticated admins can create new schedule entries.
// `requireAuth` middleware runs BEFORE `createSchedule` to verify the JWT token.
scheduleRouter.post('/', requireAuth, createSchedule);
// PROTECTED ROUTE: PUT — update an existing schedule by its MongoDB ID.
scheduleRouter.put('/:id', requireAuth, updateSchedule);
// PROTECTED ROUTE: DELETE — permanently remove a schedule entry.
scheduleRouter.delete('/:id', requireAuth, deleteSchedule);

// Export the router to be mounted in app.js.
export { scheduleRouter };