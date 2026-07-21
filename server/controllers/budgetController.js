import Budget from '../models/Budget.js';

// @desc    Get budget for an event (create if not exists)
// @route   GET /api/budgets/event/:eventId
// @access  Private
export const getBudgetByEvent = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ event: req.params.eventId });
    
    if (!budget) {
      budget = await Budget.create({
        event: req.params.eventId,
        items: []
      });
    }
    
    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to budget
// @route   POST /api/budgets/event/:eventId/items
// @access  Private
export const addBudgetItem = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ event: req.params.eventId });
    
    if (!budget) {
      budget = await Budget.create({ event: req.params.eventId, items: [] });
    }
    
    budget.items.push(req.body);
    
    // Save triggers calculations in pre-save hook
    await budget.save();
    
    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item from budget
// @route   DELETE /api/budgets/event/:eventId/items/:itemId
// @access  Private
export const deleteBudgetItem = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ event: req.params.eventId });
    
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    
    budget.items = budget.items.filter(item => item._id.toString() !== req.params.itemId);
    await budget.save();
    
    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};
