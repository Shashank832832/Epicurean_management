import express from 'express';
import { getReports, getNotifications } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/reports', protect, getReports);
router.get('/notifications', protect, getNotifications);

export default router;
