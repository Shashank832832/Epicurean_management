import Event from '../models/Event.js';
import Bill from '../models/Bill.js';
import Inventory from '../models/Inventory.js';
import Budget from '../models/Budget.js';

export const getReports = async (req, res, next) => {
  try {
    // 1. Summary Stats
    const totalEvents = await Event.countDocuments();
    
    // Total expenses (Approved & Reimbursed bills)
    const billsResult = await Bill.aggregate([
      { $match: { status: { $in: ['Approved', 'Reimbursed'] } } },
      { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
    ]);
    const totalSpent = billsResult.length > 0 ? billsResult[0].totalSpent : 0;

    // Total Budget
    const budgetResult = await Budget.aggregate([
      { $group: { _id: null, totalBudget: { $sum: '$grandTotal' } } }
    ]);
    const totalBudget = budgetResult.length > 0 ? budgetResult[0].totalBudget : 0;

    // 2. Spending by Category (from PurchaseList)
    const categoryResult = await Budget.aggregate([
      { $lookup: { from: 'purchaselists', localField: '_id', foreignField: 'budget', as: 'purchases' } },
      { $unwind: '$purchases' },
      { $unwind: '$purchases.items' },
      { $group: { _id: '$purchases.items.category', amount: { $sum: '$purchases.items.totalPrice' } } },
      { $sort: { amount: -1 } }
    ]);
    
    // Format for Recharts PieChart
    const expensesByCategory = categoryResult.map(c => ({ name: c._id, value: c.amount }));

    // 3. Monthly Spending Trends (from Bills)
    const monthlyResult = await Bill.aggregate([
      { $match: { status: { $in: ['Approved', 'Reimbursed'] } } },
      { $group: {
          _id: { month: { $month: '$dateIncurred' }, year: { $year: '$dateIncurred' } },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySpending = monthlyResult.map(m => ({
      name: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      spent: m.amount
    }));

    res.json({
      success: true,
      data: {
        summary: { totalEvents, totalSpent, totalBudget },
        expensesByCategory,
        monthlySpending
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = [];

    // Pending Bills
    const pendingBills = await Bill.countDocuments({ status: 'Pending' });
    if (pendingBills > 0) {
      notifications.push({
        id: 'pending-bills',
        title: `${pendingBills} Pending Bills`,
        message: `You have ${pendingBills} bills waiting for approval.`,
        type: 'warning',
        link: '/bills'
      });
    }

    // Low Inventory (Items with less than 5 quantity)
    const lowInventory = await Inventory.find({ quantity: { $lte: 5 } });
    if (lowInventory.length > 0) {
      notifications.push({
        id: 'low-inventory',
        title: `Low Inventory Alert`,
        message: `${lowInventory.length} items are running low on stock.`,
        type: 'error',
        link: '/inventory'
      });
    }

    // Upcoming Events (Next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingEvents = await Event.find({ date: { $gte: now, $lte: nextWeek } });
    if (upcomingEvents.length > 0) {
      notifications.push({
        id: 'upcoming-events',
        title: `Upcoming Events`,
        message: `You have ${upcomingEvents.length} events scheduled in the next 7 days.`,
        type: 'info',
        link: '/events'
      });
    }

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};
