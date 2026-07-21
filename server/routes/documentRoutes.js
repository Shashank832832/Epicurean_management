import express from 'express';
import { getDocuments, uploadDocument, deleteDocument } from '../controllers/documentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('file'), uploadDocument);

router.route('/:id')
  .delete(protect, deleteDocument);

export default router;
