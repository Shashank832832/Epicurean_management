import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Member', 'Faculty', 'Staff', 'Other'],
    required: true 
  },
  department: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  bio: { type: String },
  avatarUrl: { type: String }
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
