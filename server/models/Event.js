import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  venue: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  objective: {
    type: String,
    trim: true
  },
  expectedParticipants: {
    type: Number,
    default: 0
  },
  theme: {
    type: String,
    trim: true
  },
  volunteers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    assignedTask: String,
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    remarks: String
  }],
  timeline: [{
    milestone: String,
    deadline: Date,
    responsibleMember: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' }
  }],
  color: {
    type: String,
    default: '#F97316' // Primary orange
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Planning', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Planning'
  }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;
