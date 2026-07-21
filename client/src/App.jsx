import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import EventsList from './pages/EventsList';
import EventDetails from './pages/EventDetails';
import Inventory from './pages/Inventory';
import Documents from './pages/Documents';
import Bills from './pages/Bills';
import Contacts from './pages/Contacts';
import Vendors from './pages/Vendors';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="kitchen" element={<div className="p-8">Kitchen coming soon</div>} />
        <Route path="bills" element={<Bills />} />
        <Route path="documents" element={<Documents />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="reports" element={<Reports />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
