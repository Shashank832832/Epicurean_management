import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2, ArrowLeft, Calendar, MapPin, Users, User, Edit, Trash2 } from 'lucide-react';

// Subcomponents
import EventOverview from '../components/events/EventOverview';
import EventBudget from '../components/events/EventBudget';
import EventPurchaseList from '../components/events/EventPurchaseList';
import EventVolunteers from '../components/events/EventVolunteers';
import EventTimeline from '../components/events/EventTimeline';
import EventDocuments from '../components/events/EventDocuments';
import EventBills from '../components/events/EventBills';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data.data;
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async (updatedData) => {
      const { data } = await api.put(`/events/${id}`, updatedData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsEditModalOpen(false);
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    }
  });

  const handleDeleteEvent = () => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      deleteEventMutation.mutate();
    }
  };

  useEffect(() => {
    if (eventData) {
      const d = new Date(eventData.date);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');

      let durationHours = 1;
      if (eventData.endDate) {
        const ed = new Date(eventData.endDate);
        durationHours = (ed.getTime() - d.getTime()) / (1000 * 60 * 60);
        if (durationHours <= 0) durationHours = 1;
      }
      
      setEditFormData({
        title: eventData.title,
        description: eventData.description || '',
        venue: eventData.venue || '',
        date: `${yyyy}-${mm}-${dd}`,
        startTime: `${hh}:${min}`,
        duration: durationHours,
        expectedParticipants: eventData.expectedParticipants || 0,
        status: eventData.status
      });
    }
  }, [eventData]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (!eventData) return <div className="text-center text-slate-500 p-12">Event not found</div>;

  const tabs = ['Overview', 'Budget', 'Purchase List', 'Volunteers', 'Timeline', 'Documents', 'Bills', 'Notes'];

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editFormData.date && editFormData.startTime && editFormData.duration) {
      const startStr = `${editFormData.date}T${editFormData.startTime}:00`;
      const startDate = new Date(startStr);
      const endDate = new Date(startDate.getTime() + editFormData.duration * 60 * 60 * 1000);
      
      const updatedData = {
        ...editFormData,
        date: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      
      updateEventMutation.mutate(updatedData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/events" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Events
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{eventData.title}</h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  eventData.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                  eventData.status === 'Planning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                  eventData.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                }`}>
                {eventData.status}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">{eventData.objective || 'No objective provided for this event.'}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDeleteEvent}
              disabled={deleteEventMutation.isPending}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
            >
              {deleteEventMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Delete
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Edit size={16} /> Edit Event
            </button>
          </div>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="glass-card p-4 flex flex-wrap gap-6 items-center text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {new Date(eventData.date).toLocaleDateString()} {new Date(eventData.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {eventData.endDate && eventData.endDate !== eventData.date ? ` - ${new Date(eventData.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
          </span>
        </div>
        {eventData.venue && (
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            <span className="font-medium text-slate-800 dark:text-slate-200">{eventData.venue}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <span className="font-medium text-slate-800 dark:text-slate-200">{eventData.expectedParticipants} Expected</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={18} className="text-primary" />
          <span>Coordinator: <span className="font-medium text-slate-800 dark:text-slate-200">{eventData.coordinator?.name || 'Unassigned'}</span></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === 'Overview' && <EventOverview event={eventData} />}
        {activeTab === 'Budget' && <EventBudget eventId={id} />}
        {activeTab === 'Purchase List' && <EventPurchaseList eventId={id} />}
        {activeTab === 'Volunteers' && <EventVolunteers event={eventData} />}
        {activeTab === 'Timeline' && <EventTimeline event={eventData} />}
        {activeTab === 'Documents' && <EventDocuments eventId={id} />}
        {activeTab === 'Bills' && <EventBills eventId={id} />}
        
        {/* Placeholder tabs for future phases */}
        {['Notes'].includes(activeTab) && (
          <div className="glass-card p-12 text-center text-slate-500">
            <p>{activeTab} integration will be available in the next phase.</p>
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="text-xl font-bold text-slate-900 dark:white">Edit Event Details</h3>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
                  <input type="text" required value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
                
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input type="date" required value={editFormData.date || ''} onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white color-scheme-light dark:color-scheme-dark" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                      <input type="time" required value={editFormData.startTime || ''} onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white color-scheme-light dark:color-scheme-dark" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (Hours)</label>
                      <input type="number" min="0.5" step="0.5" required value={editFormData.duration || 1} onChange={(e) => setEditFormData({ ...editFormData, duration: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white color-scheme-light dark:color-scheme-dark" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    <option value="Planning">Planning</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Venue</label>
                  <input type="text" value={editFormData.venue} onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expected Participants</label>
                  <input type="number" min="0" value={editFormData.expectedParticipants} onChange={(e) => setEditFormData({ ...editFormData, expectedParticipants: Number(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Theme</label>
                  <input type="text" value={editFormData.theme} onChange={(e) => setEditFormData({ ...editFormData, theme: e.target.value })} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Objective</label>
                  <input type="text" value={editFormData.objective} onChange={(e) => setEditFormData({ ...editFormData, objective: e.target.value })} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea rows="4" value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"></textarea>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={updateEventMutation.isPending} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                  {updateEventMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
