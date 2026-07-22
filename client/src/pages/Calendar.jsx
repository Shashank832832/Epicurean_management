import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

const Calendar = () => {
  const calendarRef = useRef(null);
  const queryClient = useQueryClient();
  const [isDayDetailsModalOpen, setIsDayDetailsModalOpen] = useState(false);

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get('/events');
      return data;
    },
    select: (data) => {
      return (data?.data || []).map(event => {
        const startStr = new Date(event.date).toISOString().slice(0, 10);
        let endStr = event.endDate ? new Date(event.endDate).toISOString().slice(0, 10) : startStr;
        
        return {
          id: event._id,
          title: event.title,
          start: event.date,
          // If endDate is practically the same as date (or missing), don't pass end to FullCalendar so it renders a 1-day block correctly for allDay
          end: (event.endDate && event.endDate !== event.date) ? event.endDate : undefined,
          allDay: event.allDay,
          backgroundColor: event.color || '#F97316',
          borderColor: event.color || '#F97316',
          originalEvent: event // store original to display in modal
        };
      });
    }
  });

  const { data: holidaysData } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/events/holidays');
        return data.data;
      } catch (error) {
        console.error("Failed to fetch holidays", error);
        return [];
      }
    }
  });

  const combinedEvents = [...(eventsData || []), ...(holidaysData || [])];

  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const { data } = await api.post('/events', eventData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsModalOpen(false);
      setNewEvent({ title: '', allDay: false });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, eventData }) => {
      const { data } = await api.put(`/events/${id}`, eventData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo);
    setIsDayDetailsModalOpen(true);
  };

  const handleOpenAddEvent = () => {
    setIsDayDetailsModalOpen(false);
    setNewEvent(prev => ({ ...prev, allDay: selectedDate?.allDay || false }));
    setIsModalOpen(true);
  };

  const handleEventDrop = (dropInfo) => {
    updateEventMutation.mutate({
      id: dropInfo.event.id,
      eventData: {
        date: dropInfo.event.startStr,
        endDate: dropInfo.event.endStr || dropInfo.event.startStr,
        allDay: dropInfo.event.allDay
      }
    });
  };

  const handleEventResize = (resizeInfo) => {
    updateEventMutation.mutate({
      id: resizeInfo.event.id,
      eventData: {
        date: resizeInfo.event.startStr,
        endDate: resizeInfo.event.endStr
      }
    });
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (newEvent.title) {
      createEventMutation.mutate({
        title: newEvent.title,
        date: selectedDate.startStr,
        endDate: selectedDate.endStr,
        allDay: newEvent.allDay
      });
      let calendarApi = selectedDate.view.calendar;
      calendarApi.unselect();
    }
  };

  // Filter events for the selected date in the modal
  const dayEvents = selectedDate 
    ? combinedEvents.filter(e => {
        const eventStart = new Date(e.start || e.date).setHours(0,0,0,0);
        const selectedStart = new Date(selectedDate.startStr).setHours(0,0,0,0);
        return eventStart === selectedStart;
      })
    : [];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage all club events and schedules</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="calendar-container dark:text-slate-200">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={false} /* Disabled overflow limit */
            weekends={true}
            events={combinedEvents}
            select={handleDateSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="80vh"
          />
        </div>
      </div>

      {/* Day Details Modal */}
      {isDayDetailsModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Schedule for {new Date(selectedDate.startStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6">
                {dayEvents.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No events scheduled for this day.</p>
                ) : (
                  dayEvents.map(evt => (
                    <div key={evt.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-l-4" style={{ borderColor: evt.backgroundColor || '#F97316' }}>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{evt.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {evt.allDay ? 'All Day' : new Date(evt.start || evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsDayDetailsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleOpenAddEvent}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  + Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add New Event</h3>
            </div>
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="e.g. Masterchef Competition"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newEvent.allDay}
                  onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="allDay" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  All-day event
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  {createEventMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .fc {
          --fc-button-bg-color: #F97316;
          --fc-button-border-color: #F97316;
          --fc-button-hover-bg-color: #ea580c;
          --fc-button-hover-border-color: #ea580c;
          --fc-button-active-bg-color: #c2410c;
          --fc-button-active-border-color: #c2410c;
        }
        .dark .fc {
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: rgba(30, 41, 59, 0.5);
          --fc-border-color: rgba(51, 65, 85, 0.5);
          --fc-today-bg-color: rgba(249, 115, 22, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Calendar;
