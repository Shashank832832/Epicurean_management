import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Bell, Lock, Palette, Shield } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500">Manage your profile and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Nav for Settings */}
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('Profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'Profile' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <User size={18} /> Profile
          </button>
          <button 
            onClick={() => setActiveTab('Appearance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'Appearance' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Palette size={18} /> Appearance
          </button>
          <button 
            onClick={() => setActiveTab('Notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'Notifications' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Bell size={18} /> Notifications
          </button>
          {user?.role === 'Admin' && (
            <button 
              onClick={() => setActiveTab('Security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'Security' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Shield size={18} /> Security & Roles
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {activeTab === 'Profile' && (
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Information</h3>
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h4>
                  <p className="text-slate-500 mb-3">{user?.role}</p>
                  <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Change Avatar
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Full Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Email Address</label>
                  <input type="email" defaultValue={user?.email} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none" disabled />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Appearance' && (
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Appearance</h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-slate-500 mt-1">Adjust the visual theme of the application.</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {['Email alerts for pending bills', 'In-app alerts for low inventory', 'Weekly summary reports'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{item}</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded focus:ring-primary" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="glass-card p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Security & Roles</h3>
              <p className="text-slate-500 mb-6">Only Admins can access this panel.</p>
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-400">
                <Lock className="mb-2" />
                <h4 className="font-bold mb-1">Role Management Locked</h4>
                <p className="text-sm">Role management and security settings are read-only in the MVP demo version.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
