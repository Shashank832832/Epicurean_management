import Document from '../models/Document.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const filter = req.query.eventId ? { event: req.query.eventId } : {};
    const documents = await Document.find(filter)
      .populate('uploadedBy', 'name')
      .populate('event', 'title')
      .sort('-createdAt');
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

import fs from 'fs';

// @desc    Upload new document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const isPdf = req.file.mimetype === 'application/pdf';
    
    // Upload to Cloudinary from local disk to guarantee integrity
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'epicB',
      resource_type: isPdf ? 'raw' : 'auto',
      use_filename: true,
      unique_filename: true
    });

    // Clean up local file
    fs.unlinkSync(req.file.path);

    const { title, description, category, event } = req.body;

    const document = await Document.create({
      title,
      description,
      category,
      event: event || undefined,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Delete from cloudinary
    await cloudinary.uploader.destroy(document.cloudinaryId);

    // Delete from db
    await document.deleteOne();

    res.json({ success: true, message: 'Document removed' });
  } catch (error) {
    next(error);
  }
};
