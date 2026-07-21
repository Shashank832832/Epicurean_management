import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flag, Plus, Trash2, Loader2, Calendar } from 'lucide-react';
import api from '../../services/api';

const EventTimeline = ({ event }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ milestone: '', deadline: '' });

  const updateEventMutation = useMutation({
    mutationFn: async (updatedEventData) => {
      await api.put(`/events/${event._id}`, updatedEventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', event._id] });
      setIsModalOpen(false);
      setNewMilestone({ milestone: '', deadline: '' });
    }
  });

  const handleAddMilestone = (e) => {
    e.preventDefault();
    const updatedTimeline = [...(event.timeline || []), { ...newMilestone, deadline: new Date(newMilestone.deadline).toISOString() }];
    // Sort chronologically
    updatedTimeline.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    updateEventMutation.mutate({ timeline: updatedTimeline });
  };

  const handleRemoveMilestone = (indexToRemove) => {
    const updatedTimeline = event.timeline.filter((_, index) => index !== indexToRemove);
    updateEventMutation.mutate({ timeline: updatedTimeline });
  };

  const timeline = event.timeline || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Timeline</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
        >
          <Plus size={16} /> Add Milestone
        </button>
      </div>

      <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 pl-6 space-y-8 py-4">
        {timeline.map((milestone, index) => {
          const isPast = new Date(milestone.deadline) < new Date();
          return (
            <div key={index} className="relative group">
              <div className={`absolute -left-[35px] w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${isPast ? 'bg-emerald-500' : 'bg-primary'}`}></div>
              <button 
                onClick={() => handleRemoveMilestone(index)}
                className="absolute top-0 right-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="glass-card p-4 inline-block min-w-[300px]">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{milestone.milestone}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar size={14} />
                  <span>{new Date(milestone.deadline).toLocaleDateString()} {new Date(milestone.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-xs">
                  <span className={`px-2 py-1 rounded-full ${milestone.status === 'Completed' || isPast ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isPast ? 'Passed' : (milestone.status || 'Pending')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {timeline.length === 0 && (
          <div className="text-slate-500 py-4 italic relative">
             <div className="absolute -left-[33px] w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            No milestones added yet. Start planning!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Add Timeline Milestone</h3>
            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Milestone Title</label>
                <input type="text" required autoFocus value={newMilestone.milestone} onChange={e => setNewMilestone({...newMilestone, milestone: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Deadline</label>
                <input type="datetime-local" required value={newMilestone.deadline} onChange={e => setNewMilestone({...newMilestone, deadline: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 color-scheme-light dark:color-scheme-dark" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={updateEventMutation.isPending} className="px-4 py-2 bg-primary text-white rounded flex items-center">
                  {updateEventMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTimeline;
