import React from 'react';

const EventOverview = ({ event }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Key Information</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-slate-500">Theme</div>
          <div className="col-span-2 text-slate-900 dark:text-slate-200 font-medium">{event.theme || 'N/A'}</div>
          
          <div className="text-slate-500">Objective</div>
          <div className="col-span-2 text-slate-900 dark:text-slate-200 font-medium">{event.objective || 'N/A'}</div>
          
          <div className="text-slate-500">Venue</div>
          <div className="col-span-2 text-slate-900 dark:text-slate-200 font-medium">{event.venue || 'N/A'}</div>
          
          <div className="text-slate-500">Expected Pax</div>
          <div className="col-span-2 text-slate-900 dark:text-slate-200 font-medium">{event.expectedParticipants || 0}</div>
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Description</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {event.description || 'No detailed description provided for this event.'}
        </p>
      </div>
    </div>
  );
};

export default EventOverview;
