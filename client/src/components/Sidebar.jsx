import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  CalendarDays, 
  Package, 
  ChefHat, 
  Receipt, 
  FolderOpen, 
  Users, 
  PieChart, 
  Settings, 
  Contact
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
  { name: 'Events', path: '/events', icon: CalendarDays },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Kitchen', path: '/kitchen', icon: ChefHat },
  { name: 'Bills', path: '/bills', icon: Receipt },
  { name: 'Documents', path: '/documents', icon: FolderOpen },
  { name: 'Vendors', path: '/vendors', icon: Users },
  { name: 'Reports', path: '/reports', icon: PieChart },
  { name: 'Contacts', path: '/contacts', icon: Contact },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 z-10 transition-colors duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <ChefHat className="text-primary" size={28} />
          Epicurean
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Club Management</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-primary' : ''} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
