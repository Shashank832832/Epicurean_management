import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Receipt, Download, Loader2, IndianRupee, Trash2, Plus } from 'lucide-react';
import api from '../services/api';

const Bills = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', vendor: '', amount: '', dateIncurred: '', notes: '', file: null });

  const { data: billsResponse, isLoading } = useQuery({
    queryKey: ['bills', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/bills');
      return data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('vendor', data.vendor);
      formDataToSend.append('amount', data.amount);
      formDataToSend.append('dateIncurred', data.dateIncurred);
      if (data.notes) formDataToSend.append('notes', data.notes);
      formDataToSend.append('receipt', data.file);

      await api.post('/bills', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', 'all'] });
      setIsModalOpen(false);
      setFormData({ title: '', vendor: '', amount: '', dateIncurred: '', notes: '', file: null });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/bills/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', 'all'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', 'all'] });
    }
  });

  const allBills = billsResponse?.data || [];
  const bills = filter === 'All' ? allBills : allBills.filter(b => b.status === filter);
  
  const pendingAmount = allBills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  const statuses = ['All', 'Pending', 'Approved', 'Rejected', 'Reimbursed'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bills & Reimbursements</h1>
          <p className="text-slate-500">Manage all club expenses, vendor bills, and member reimbursements.</p>
        </div>
        <div className="flex gap-4 items-stretch">
          <div className="bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 px-4 py-2 rounded-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1">Pending Approval</p>
            <p className="text-xl font-bold flex items-center justify-center"><IndianRupee size={20}/>{pendingAmount.toFixed(2)}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Submit Receipt
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === status 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Receipt</th>
              <th className="px-6 py-4 font-medium">Details</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium text-center">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions (Admin)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
            {bills.map(bill => (
              <tr key={bill._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <a href={bill.receiptUrl} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden relative group">
                    {bill.receiptUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={bill.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Receipt className="text-slate-400" /></div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Download size={16} className="text-white" />
                    </div>
                  </a>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 dark:text-white text-base mb-1">{bill.title}</p>
                  <p className="text-xs text-slate-500 mb-1">{bill.vendor || 'No Vendor'} • {new Date(bill.dateIncurred).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">Submitted by: <span className="font-medium text-slate-600 dark:text-slate-300">{bill.submittedBy?.name}</span></p>
                  {bill.event && <p className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mt-2">Event: {bill.event.title}</p>}
                </td>
                <td className="px-6 py-4">
                  <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center"><IndianRupee size={16}/>{bill.amount.toFixed(2)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    bill.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    bill.status === 'Reimbursed' ? 'bg-blue-100 text-blue-700' :
                    bill.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col gap-2 items-end">
                    <select 
                      value={bill.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: bill._id, status: e.target.value })}
                      disabled={updateStatusMutation.isPending}
                      className="text-xs border rounded-lg px-2 py-1 bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Pending">Mark Pending</option>
                      <option value="Approved">Mark Approved</option>
                      <option value="Reimbursed">Mark Reimbursed</option>
                      <option value="Rejected">Mark Rejected</option>
                    </select>
                    <button 
                      onClick={() => { if(window.confirm('Delete this bill?')) deleteMutation.mutate(bill._id); }}
                      className="text-slate-400 hover:text-red-500 p-1 flex items-center text-xs gap-1 transition-colors"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-500">
                  <Receipt className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p>No bills found matching your filter.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Submit Receipt for Reimbursement</h3>
            <form onSubmit={(e) => { e.preventDefault(); uploadMutation.mutate(formData); }} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Expense Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Amount (₹)</label>
                  <input type="number" required min="0" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Date Incurred</label>
                  <input type="date" required value={formData.dateIncurred} onChange={e => setFormData({...formData, dateIncurred: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 color-scheme-light dark:color-scheme-dark" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Vendor/Store Name (Optional)</label>
                <input type="text" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Notes/Description</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" rows="2"></textarea>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Receipt Image/PDF</label>
                <input type="file" required accept=".jpg,.jpeg,.png,.pdf" onChange={e => setFormData({...formData, file: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-primary/20 dark:hover:file:bg-primary/30 cursor-pointer" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={uploadMutation.isPending || !formData.file} className="px-4 py-2 bg-primary text-white rounded flex items-center">
                  {uploadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Submit Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;
