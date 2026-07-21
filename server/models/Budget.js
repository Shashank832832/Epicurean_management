import mongoose from 'mongoose';

const budgetItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 }
});

const budgetSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  items: [budgetItemSchema],
  subtotal: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  approvedBudget: { type: Number, default: 0 },
  remainingBudget: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save hook to calculate totals
budgetSchema.pre('save', function () {
  let sub = 0;
  if (this.items && this.items.length > 0) {
    this.items.forEach(item => {
      item.total = item.quantity * item.unitPrice;
      sub += item.total;
    });
  }
  this.subtotal = sub;
  this.grandTotal = this.subtotal;
  this.remainingBudget = this.approvedBudget - this.grandTotal;
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
