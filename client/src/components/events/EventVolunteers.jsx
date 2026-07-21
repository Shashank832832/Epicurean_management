import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, Loader2 } from 'lucide-react';
import api from '../../services/api';

const EventVolunteers = ({ event }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({ role: '', assignedTask: '' });

  const updateEventMutation = useMutation({
    mutationFn: async (updatedEventData) => {
      await api.put(`/events/${event._id}`, updatedEventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', event._id] });
      setIsModalOpen(false);
      setNewVolunteer({ role: '', assignedTask: '' });
    }
  });

  const handleAddVolunteer = (e) => {
    e.preventDefault();
    const updatedVolunteers = [...(event.volunteers || []), newVolunteer];
    updateEventMutation.mutate({ volunteers: updatedVolunteers });
  };

  const handleRemoveVolunteer = (indexToRemove) => {
    const updatedVolunteers = event.volunteers.filter((_, index) => index !== indexToRemove);
    updateEventMutation.mutate({ volunteers: updatedVolunteers });
  };

  const volunteers = event.volunteers || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Volunteer Roster</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
        >
          <Plus size={16} /> Assign Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {volunteers.map((vol, index) => (
          <div key={index} className="glass-card p-5 relative group">
            <button 
              onClick={() => handleRemoveVolunteer(index)}
              className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <Users size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{vol.role}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  vol.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                  vol.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {vol.status || 'Pending'}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">Task:</span> {vol.assignedTask}
            </p>
          </div>
        ))}
        
        {volunteers.length === 0 && (
          <div className="col-span-3 text-center py-12 glass-card text-slate-500">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p>No volunteers assigned yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Assign Volunteer Role</h3>
            <form onSubmit={handleAddVolunteer} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Role Title (e.g. Head Chef)</label>
                <input type="text" required autoFocus value={newVolunteer.role} onChange={e => setNewVolunteer({...newVolunteer, role: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Specific Task</label>
                <textarea required value={newVolunteer.assignedTask} onChange={e => setNewVolunteer({...newVolunteer, assignedTask: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" rows="3"></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={updateEventMutation.isPending} className="px-4 py-2 bg-primary text-white rounded flex items-center">
                  {updateEventMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventVolunteers;
