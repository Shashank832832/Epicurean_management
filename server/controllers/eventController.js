import Event from '../models/Event.js';
import ical from 'node-ical';

// @desc    Get Indian holidays from Google Calendar ICS
// @route   GET /api/events/holidays
// @access  Private
export const getIndianHolidays = async (req, res, next) => {
  try {
    const events = await ical.async.fromURL('https://calendar.google.com/calendar/ical/en.indian%23holiday%40group.v.calendar.google.com/public/basic.ics');
    
    const holidays = [];
    for (const k in events) {
      if (events.hasOwnProperty(k)) {
        const ev = events[k];
        if (ev.type === 'VEVENT') {
          holidays.push({
            id: ev.uid,
            title: `🇮🇳 ${ev.summary}`,
            start: ev.start,
            end: ev.end,
            allDay: true,
            display: 'block',
            backgroundColor: '#ef4444',
            borderColor: '#dc2626'
          });
        }
      }
    }
    res.json({ success: true, data: holidays });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate('coordinator', 'name email');
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('coordinator', 'name email')
      .populate('volunteers.user', 'name phone')
      .populate('timeline.responsibleMember', 'name');
      
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      coordinator: req.user._id // set creator as coordinator by default if not provided
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    await event.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
