import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import api from '../../services/api';

const EventBudget = ({ eventId }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ item: '', quantity: 1, unitPrice: 0 });

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budget', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/budgets/event/${eventId}`);
      return data.data;
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async (itemData) => {
      await api.post(`/budgets/event/${eventId}/items`, itemData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', eventId] });
      setIsModalOpen(false);
      setNewItem({ item: '', quantity: 1, unitPrice: 0 });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId) => {
      await api.delete(`/budgets/event/${eventId}/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', eventId] });
    }
  });

  if (isLoading) return <div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Budget Breakdown</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 font-medium">Item Description</th>
              <th className="px-6 py-3 font-medium text-right">Quantity</th>
              <th className="px-6 py-3 font-medium text-right">Unit Price</th>
              <th className="px-6 py-3 font-medium text-right">Total</th>
              <th className="px-6 py-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {budgetData?.items?.map(item => (
              <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{item.item}</td>
                <td className="px-6 py-3 text-right">{item.quantity}</td>
                <td className="px-6 py-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
                <td className="px-6 py-3 text-right font-semibold">₹{item.total.toFixed(2)}</td>
                <td className="px-6 py-3 text-center">
                  <button 
                    onClick={() => deleteItemMutation.mutate(item._id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {(!budgetData?.items || budgetData.items.length === 0) && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No budget items added yet.</td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-50 dark:bg-slate-800/50 font-medium">
            <tr className="text-lg font-bold border-t-2 border-slate-200 dark:border-slate-700">
              <td colSpan="3" className="px-6 py-4 text-right text-slate-900 dark:text-white">Total:</td>
              <td className="px-6 py-4 text-right text-primary">₹{budgetData?.grandTotal?.toFixed(2) || '0.00'}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Add Budget Item</h3>
            <form onSubmit={(e) => { e.preventDefault(); addItemMutation.mutate(newItem); }} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Description</label>
                <input type="text" required value={newItem.item} onChange={e => setNewItem({...newItem, item: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Quantity</label>
                  <input type="number" required min="1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Unit Price (₹)</label>
                  <input type="number" required min="0" step="0.01" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value)})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={addItemMutation.isPending} className="px-4 py-2 bg-primary text-white rounded flex items-center">
                  {addItemMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventBudget;
