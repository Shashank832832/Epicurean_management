import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, LogOut, Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TopNav = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/notifications');
      return data;
    },
    refetchInterval: 30000 // Poll every 30 seconds
  });

  const notifications = notifData?.data || [];

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-300 w-full">
      
      <div className="flex items-center gap-3 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
        >
          <Menu size={24} />
        </button>
        
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search events, bills..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 text-sm outline-none text-slate-700 dark:text-slate-200 transition-colors duration-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 relative shrink-0">
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-500">You're all caught up!</p>
                ) : (
                  notifications.map(n => (
                    <Link key={n.id} to={n.link} onClick={() => setShowNotifications(false)} className="block p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <p className={`text-sm font-semibold mb-1 ${
                        n.type === 'error' ? 'text-red-500' :
                        n.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                      }`}>{n.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{n.message}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-700">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name || 'User'}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{user?.role || 'Guest'}</span>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button 
            onClick={logout}
            className="p-1.5 sm:p-2 ml-1 sm:ml-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
