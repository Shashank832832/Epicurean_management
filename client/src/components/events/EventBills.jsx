import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Receipt, Plus, Trash2, Download, Loader2, IndianRupee } from 'lucide-react';
import api from '../../services/api';

const EventBills = ({ eventId }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', vendor: '', amount: '', dateIncurred: '', notes: '', file: null });

  const { data: billsResponse, isLoading } = useQuery({
    queryKey: ['bills', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/bills?eventId=${eventId}`);
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
      formDataToSend.append('event', eventId);

      await api.post('/bills', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', eventId] });
      setIsModalOpen(false);
      setFormData({ title: '', vendor: '', amount: '', dateIncurred: '', notes: '', file: null });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', eventId] });
    }
  });

  const bills = billsResponse?.data || [];
  const totalSpent = bills.reduce((sum, bill) => sum + bill.amount, 0);

  if (isLoading) return <div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bills & Receipts</h3>
          <p className="text-sm text-slate-500">Total processed: ₹{totalSpent.toFixed(2)}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
        >
          <Plus size={16} /> Submit Receipt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bills.map(bill => (
          <div key={bill._id} className="glass-card p-4 flex flex-col md:flex-row gap-4 relative">
            <div className="w-full md:w-24 h-32 md:h-24 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 relative group">
              {bill.receiptUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img src={bill.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Receipt className="text-slate-400" /></div>
              )}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a href={bill.receiptUrl} target="_blank" rel="noreferrer" className="text-white hover:text-primary"><Download size={20} /></a>
              </div>
            </div>
            
            <div className="flex-grow flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{bill.title}</h4>
                  <p className="text-xs text-slate-500">{bill.vendor} • {new Date(bill.dateIncurred).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-0.5 justify-end"><IndianRupee size={14}/> {bill.amount.toFixed(2)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    bill.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    bill.status === 'Reimbursed' ? 'bg-blue-100 text-blue-700' :
                    bill.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {bill.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 flex-grow">{bill.notes}</p>
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400">By {bill.submittedBy?.name}</span>
                <button onClick={() => deleteMutation.mutate(bill._id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {bills.length === 0 && (
          <div className="col-span-2 text-center py-12 glass-card text-slate-500">
            <Receipt className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p>No bills submitted yet.</p>
          </div>
        )}
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

export default EventBills;
