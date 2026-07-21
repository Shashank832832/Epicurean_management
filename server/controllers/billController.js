import Bill from '../models/Bill.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
export const getBills = async (req, res, next) => {
  try {
    const filter = req.query.eventId ? { event: req.query.eventId } : {};
    const bills = await Bill.find(filter)
      .populate('submittedBy', 'name')
      .populate('event', 'title')
      .sort('-createdAt');
    res.json({ success: true, data: bills });
  } catch (error) {
    next(error);
  }
};

import fs from 'fs';

// @desc    Submit new bill
// @route   POST /api/bills
// @access  Private
export const submitBill = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a receipt' });
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

    const { title, vendor, amount, dateIncurred, event, notes } = req.body;

    const bill = await Bill.create({
      title,
      vendor,
      amount: Number(amount),
      dateIncurred: new Date(dateIncurred),
      event: event || undefined,
      notes,
      receiptUrl: result.secure_url,
      cloudinaryId: result.public_id,
      submittedBy: req.user._id
    });

    res.status(201).json({ success: true, data: bill });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};

// @desc    Update bill status
// @route   PUT /api/bills/:id/status
// @access  Private (Admin/Treasurer)
export const updateBillStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    
    res.json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Private
export const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Delete receipt from cloudinary
    await cloudinary.uploader.destroy(bill.cloudinaryId);

    await bill.deleteOne();

    res.json({ success: true, message: 'Bill deleted' });
  } catch (error) {
    next(error);
  }
};
