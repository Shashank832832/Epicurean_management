import Inventory from '../models/Inventory.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
export const getInventory = async (req, res, next) => {
  try {
    const items = await Inventory.find().populate('lastUpdatedBy', 'name');
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an inventory item
// @route   POST /api/inventory
// @access  Private
export const createInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.create({
      ...req.body,
      lastUpdatedBy: req.user._id
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private
export const updateInventoryItem = async (req, res, next) => {
  try {
    let item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Must use save() to trigger pre-save hook for status calculation
    Object.assign(item, req.body);
    item.lastUpdatedBy = req.user._id;
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
export const deleteInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    await item.deleteOne();
    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    next(error);
  }
};
