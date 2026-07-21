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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', allDay: false });

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get('/events');
      // Format for FullCalendar
      return data.data.map(event => ({
        id: event._id,
        title: event.title,
        start: event.date,
        end: event.endDate || event.date,
        allDay: event.allDay,
        backgroundColor: event.color || '#F97316',
        borderColor: event.color || '#F97316'
      }));
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
    setNewEvent(prev => ({ ...prev, allDay: selectInfo.allDay }));
    setIsModalOpen(true);
  };

  const handleEventDrop = (dropInfo) => {
    updateEventMutation.mutate({
      id: dropInfo.event.id,
      eventData: {
        date: dropInfo.event.startStr,
        endDate: dropInfo.event.endStr,
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
            dayMaxEvents={true}
            weekends={true}
            events={combinedEvents}
            select={handleDateSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="80vh"
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
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
