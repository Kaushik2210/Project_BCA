import express from 'express';
import {getSchedule,createSchedule,updateSchedule,deleteSchedule} from '../controllers/schedule.controller.js';
import requireAuth from "../middleware/authMiddleware.js";

const scheduleRouter = express.Router();

scheduleRouter.get('/', getSchedule);
scheduleRouter.post('/', requireAuth, createSchedule);
scheduleRouter.put('/:id', requireAuth, updateSchedule);
scheduleRouter.delete('/:id', requireAuth, deleteSchedule);

export {scheduleRouter};