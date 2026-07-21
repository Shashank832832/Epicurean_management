import Vendor from '../models/Vendor.js';

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
export const getVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find().sort('-rating name');
    res.json({ success: true, data: vendors });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private
export const createVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private
export const updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.json({ success: true, data: vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private
export const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.json({ success: true, message: 'Vendor removed' });
  } catch (error) {
    next(error);
  }
};
