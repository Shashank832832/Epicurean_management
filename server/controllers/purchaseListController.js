import PurchaseList from '../models/PurchaseList.js';

// @desc    Get purchase list items for an event
// @route   GET /api/purchase-lists/event/:eventId
// @access  Private
export const getPurchaseListByEvent = async (req, res, next) => {
  try {
    const items = await PurchaseList.find({ event: req.params.eventId })
      .populate('assignedMember', 'name')
      .populate('vendor', 'name');
    
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to purchase list
// @route   POST /api/purchase-lists/event/:eventId
// @access  Private
export const addPurchaseListItem = async (req, res, next) => {
  try {
    const item = await PurchaseList.create({
      event: req.params.eventId,
      ...req.body
    });
    
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update purchase list item (e.g. toggle purchased status)
// @route   PUT /api/purchase-lists/:id
// @access  Private
export const updatePurchaseListItem = async (req, res, next) => {
  try {
    const item = await PurchaseList.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete purchase list item
// @route   DELETE /api/purchase-lists/:id
// @access  Private
export const deletePurchaseListItem = async (req, res, next) => {
  try {
    const item = await PurchaseList.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};
