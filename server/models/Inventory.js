import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Utensils', 'Appliances', 'Ingredients', 'Cleaning', 'Other'],
    default: 'Other'
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'pcs'
  },
  minQuantity: {
    type: Number,
    default: 5 // threshold for low stock alerts
  },
  location: {
    type: String,
    trim: true,
    default: 'Main Kitchen'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  }
}, { timestamps: true });

// Pre-save hook to update status based on quantity
inventorySchema.pre('save', function () {
  if (this.quantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.minQuantity) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
});

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
