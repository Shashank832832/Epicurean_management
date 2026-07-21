import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, CheckCircle, Circle, Loader2 } from 'lucide-react';
import api from '../../services/api';

const EventPurchaseList = ({ eventId }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'pcs' });

  const { data: purchaseListResponse, isLoading } = useQuery({
    queryKey: ['purchaseList', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/purchase-lists/event/${eventId}`);
      return data;
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async (itemData) => {
      await api.post(`/purchase-lists/event/${eventId}`, itemData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseList', eventId] });
      setIsModalOpen(false);
      setNewItem({ name: '', quantity: 1, unit: 'pcs' });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, purchased }) => {
      await api.put(`/purchase-lists/${id}`, { purchased });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseList', eventId] });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/purchase-lists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseList', eventId] });
    }
  });

  const items = purchaseListResponse?.data || [];
  const purchasedCount = items.filter(i => i.purchased).length;
  const progress = items.length === 0 ? 0 : Math.round((purchasedCount / items.length) * 100);

  if (isLoading) return <div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Purchase Checklist</h3>
          <p className="text-sm text-slate-500">{purchasedCount} of {items.length} items purchased ({progress}%)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item._id} className={`glass-card p-4 flex items-center justify-between transition-colors ${item.purchased ? 'opacity-70 bg-slate-50/50 dark:bg-slate-800/30' : ''}`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => toggleStatusMutation.mutate({ id: item._id, purchased: !item.purchased })}
                className={`${item.purchased ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'} hover:text-emerald-600 transition-colors`}
              >
                {item.purchased ? <CheckCircle size={24} /> : <Circle size={24} />}
              </button>
              <div>
                <p className={`font-medium text-slate-900 dark:text-white ${item.purchased ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                  {item.name}
                </p>
                <p className="text-xs text-slate-500">{item.quantity} {item.unit}</p>
              </div>
            </div>
            <button 
              onClick={() => deleteItemMutation.mutate(item._id)}
              className="text-red-400 hover:text-red-600 p-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-2 text-center py-8 glass-card text-slate-500">
            No items in the purchase list.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Add Purchase Item</h3>
            <form onSubmit={(e) => { e.preventDefault(); addItemMutation.mutate(newItem); }} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Item Name</label>
                <input type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Quantity</label>
                  <input type="number" required min="1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Unit (e.g. kg, pcs)</label>
                  <input type="text" required value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
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

export default EventPurchaseList;
