import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Package, Receipt, Users, Loader2, IndianRupee, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card p-6 flex flex-col hover:-translate-y-1 transition-transform">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 flex items-center">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  const { data: eventsRes, isLoading: loading1 } = useQuery({ queryKey: ['events'], queryFn: () => api.get('/events') });
  const { data: contactsRes, isLoading: loading2 } = useQuery({ queryKey: ['contacts'], queryFn: () => api.get('/contacts') });
  const { data: billsRes, isLoading: loading3 } = useQuery({ queryKey: ['bills', 'all'], queryFn: () => api.get('/bills') });
  const { data: inventoryRes, isLoading: loading4 } = useQuery({ queryKey: ['inventory'], queryFn: () => api.get('/inventory') });

  if (loading1 || loading2 || loading3 || loading4) {
    return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today to include all of today's events
  
  const allEvents = eventsRes?.data?.data || [];
  const upcomingEvents = allEvents.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const allContacts = contactsRes?.data?.data || [];
  
  const pendingBills = billsRes?.data?.data?.filter(b => b.status === 'Pending') || [];
  const pendingAmount = pendingBills.reduce((sum, b) => sum + b.amount, 0);
  
  const lowInventory = inventoryRes?.data?.data?.filter(i => i.quantity <= 5) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's what's happening with the club today.</p>
        </div>
        <Link to="/events" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          + New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Upcoming Events" 
          value={upcomingEvents.length} 
          icon={CalendarDays} 
          color="bg-primary" 
        />
        <StatCard 
          title="Directory Contacts" 
          value={allContacts.length} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Pending Bills" 
          value={<><IndianRupee size={20} className="mr-0.5" />{pendingAmount.toFixed(2)}</>} 
          icon={Receipt} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Low Inventory Items" 
          value={lowInventory.length} 
          icon={Package} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <CalendarDays className="text-primary" size={20} /> Upcoming Events Schedule
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No upcoming events scheduled.</p>
            ) : (
              upcomingEvents.slice(0, 5).map(event => (
                <div key={event._id} className="border-l-4 border-primary pl-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-r-xl">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{event.title}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{event.venue || 'No Venue Specified'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Receipt className="text-amber-500" size={20} /> Bills Requiring Approval
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {pendingBills.length === 0 ? (
              <p className="text-slate-500 text-center py-10">All caught up! No pending bills.</p>
            ) : (
              pendingBills.slice(0, 5).map(bill => (
                <div key={bill._id} className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50 dark:bg-amber-500/10 rounded-r-xl">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{bill.title}</p>
                    <p className="font-bold text-slate-900 dark:text-white flex items-center text-sm"><IndianRupee size={14}/>{bill.amount.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Vendor: {bill.vendor || 'N/A'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Date: {new Date(bill.dateIncurred).toLocaleDateString()}</p>
                </div>
              ))
            )}
            {pendingBills.length > 5 && (
              <Link to="/bills" className="block text-center text-sm text-primary hover:underline mt-4">
                View all {pendingBills.length} pending bills
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
