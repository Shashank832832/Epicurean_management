import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Guideline', 'Recipe', 'Report', 'Meeting Notes', 'Other'],
    default: 'Other'
  },
  fileUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' } // optional reference
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
export default Document;
