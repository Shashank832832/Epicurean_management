import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, Phone, Mail, Globe, MapPin, Star, Plus, Edit, Trash2, Loader2, Navigation } from 'lucide-react';
import api from '../services/api';

const Vendors = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Catering',
    contactPerson: '',
    email: '',
    phone: '',
    rating: 0,
    website: '',
    notes: ''
  });

  const { data: vendorsResponse, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data } = await api.get('/vendors');
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => await api.post('/vendors', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsModalOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => await api.put(`/vendors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsModalOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/vendors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    }
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', category: 'Catering', contactPerson: '', email: '', phone: '', rating: 0, website: '', notes: '' });
  };

  const handleEdit = (vendor) => {
    setEditingId(vendor._id);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contactPerson: vendor.contactPerson || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      rating: vendor.rating || 0,
      website: vendor.website || '',
      notes: vendor.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const allVendors = vendorsResponse?.data || [];
  const vendors = filter === 'All' ? allVendors : allVendors.filter(v => v.category === filter);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  const categories = ['All', 'Catering', 'Logistics', 'Decoration', 'AV/Tech', 'Printing', 'Other'];

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} size={14} className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vendors & Partners</h1>
          <p className="text-slate-500">Directory of suppliers for events, equipment, and services.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Add Vendor
        </button>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === cat 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-105' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map(vendor => (
          <div key={vendor._id} className="glass-card flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 relative bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-primary">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{vendor.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {vendor.category}
                      </span>
                      <div className="flex items-center gap-0.5">{renderStars(vendor.rating)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(vendor)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit size={16} /></button>
                  <button onClick={() => { if(window.confirm('Delete vendor?')) deleteMutation.mutate(vendor._id); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
            
            <div className="p-6 flex-grow flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <a href={`tel:${vendor.phone}`} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-green-50 dark:bg-slate-800/50 dark:hover:bg-green-900/20 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors border border-slate-200 dark:border-slate-700 group/btn">
                  <Phone size={18} className="mb-1 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Call</span>
                </a>
                <a href={`mailto:${vendor.email}`} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200 dark:border-slate-700 group/btn">
                  <Mail size={18} className="mb-1 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Email</span>
                </a>
              </div>

              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mt-2">
                {vendor.contactPerson && <p><strong className="text-slate-900 dark:text-slate-200 font-medium">Contact:</strong> {vendor.contactPerson}</p>}
                {vendor.website && (
                  <p className="flex items-center gap-2">
                    <Globe size={14} className="text-slate-400" />
                    <a href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                      {vendor.website}
                    </a>
                  </p>
                )}
                {vendor.notes && <p className="italic text-xs border-l-2 border-slate-200 dark:border-slate-700 pl-3 mt-4 text-slate-500">"{vendor.notes}"</p>}
              </div>
            </div>
          </div>
        ))}

        {vendors.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card">
            <Store className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Vendors Found</h3>
            <p className="text-slate-500">Click "Add Vendor" to start building your supplier directory.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
              {editingId ? 'Edit Vendor Details' : 'Register New Vendor'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Company Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Service Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                    <option value="Catering">Catering</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Decoration">Decoration</option>
                    <option value="AV/Tech">AV/Tech</option>
                    <option value="Printing">Printing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Primary Contact Person</label>
                <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. John Doe" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Star Rating (0-5)</label>
                  <input type="number" min="0" max="5" step="0.5" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Website</label>
                  <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="www.example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Internal Notes / Terms</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" rows="3"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium flex items-center shadow-lg shadow-primary/20 transition-all">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingId ? 'Update Vendor' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
