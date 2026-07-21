import express from 'express';
import { getContacts, createContact, updateContact, deleteContact } from '../controllers/contactController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getContacts)
  .post(protect, createContact);

router.route('/:id')
  .put(protect, updateContact)
  .delete(protect, deleteContact);

export default router;
