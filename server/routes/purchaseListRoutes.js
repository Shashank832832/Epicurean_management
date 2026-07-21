import express from 'express';
import { getPurchaseListByEvent, addPurchaseListItem, updatePurchaseListItem, deletePurchaseListItem } from '../controllers/purchaseListController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/event/:eventId')
  .get(protect, getPurchaseListByEvent)
  .post(protect, addPurchaseListItem);

router.route('/:id')
  .put(protect, updatePurchaseListItem)
  .delete(protect, deletePurchaseListItem);

export default router;
