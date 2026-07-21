import express from 'express';
import { getBudgetByEvent, addBudgetItem, deleteBudgetItem } from '../controllers/budgetController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/event/:eventId')
  .get(protect, getBudgetByEvent);

router.route('/event/:eventId/items')
  .post(protect, addBudgetItem);

router.route('/event/:eventId/items/:itemId')
  .delete(protect, deleteBudgetItem);

export default router;
