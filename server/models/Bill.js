import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  title: { type: String, required: true },
  vendor: { type: String },
  amount: { type: Number, required: true },
  dateIncurred: { type: Date, required: true },
  receiptUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Reimbursed'],
    default: 'Pending'
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // optional reference
  notes: { type: String }
}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
