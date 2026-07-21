import express from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getIndianHolidays } from '../controllers/eventController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/holidays', protect, getIndianHolidays);

router.route('/')
  .get(protect, getEvents)
  .post(protect, createEvent);

router.route('/:id')
  .get(protect, getEventById)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

export default router;
