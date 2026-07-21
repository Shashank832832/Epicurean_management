import mongoose from 'mongoose';

const purchaseListSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  assignedMember: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  purchased: { type: Boolean, default: false },
  price: { type: Number, default: 0 }
}, { timestamps: true });

const PurchaseList = mongoose.model('PurchaseList', purchaseListSchema);
export default PurchaseList;
