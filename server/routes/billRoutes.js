import express from 'express';
import { getBills, submitBill, updateBillStatus, deleteBill } from '../controllers/billController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(protect, getBills)
  .post(protect, upload.single('receipt'), submitBill);

router.route('/:id')
  .delete(protect, deleteBill);

router.route('/:id/status')
  .put(protect, updateBillStatus);

export default router;
