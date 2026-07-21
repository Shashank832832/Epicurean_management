import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Catering', 'Logistics', 'Decoration', 'AV/Tech', 'Printing', 'Other'],
    required: true 
  },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  notes: { type: String },
  website: { type: String }
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
