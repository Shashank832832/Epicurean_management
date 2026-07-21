import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import purchaseListRoutes from './routes/purchaseListRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import billRoutes from './routes/billRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/purchase-lists', purchaseListRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/analytics', analyticsRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Production: Serve Frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Any route that is not an API route will hit the React app
  app.get('(.*)', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running in development mode');
  });
}

// Database Connection
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
