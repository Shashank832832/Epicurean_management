import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Trash2, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

const EventDocuments = ({ eventId }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'Other', description: '', file: null });

  const { data: docsResponse, isLoading } = useQuery({
    queryKey: ['documents', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/documents?eventId=${eventId}`);
      return data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('category', data.category);
      if (data.description) formDataToSend.append('description', data.description);
      formDataToSend.append('file', data.file);
      formDataToSend.append('event', eventId);

      await api.post('/documents', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', eventId] });
      setIsModalOpen(false);
      setFormData({ title: '', category: 'Other', description: '', file: null });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', eventId] });
    }
  });

  const documents = docsResponse?.data || [];

  if (isLoading) return <div className="text-center p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Documents</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
        >
          <Plus size={16} /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.map(doc => {
          const isImage = doc.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i);
          return (
            <div key={doc._id} className="glass-card group overflow-hidden flex flex-col h-full">
              <div className="bg-slate-100 dark:bg-slate-800 h-32 flex items-center justify-center relative border-b border-slate-200 dark:border-slate-700/50">
                {isImage ? (
                  <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-12 h-12 text-slate-400" />
                )}
                
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors">
                    <Download size={18} />
                  </a>
                  <button onClick={() => deleteMutation.mutate(doc._id)} className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1" title={doc.title}>{doc.title}</h4>
                </div>
                <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 w-fit mb-2">
                  {doc.category}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 flex-grow">{doc.description}</p>
                <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  By {doc.uploadedBy?.name} on {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
        {documents.length === 0 && (
          <div className="col-span-full text-center py-12 glass-card text-slate-500">
            <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p>No documents uploaded yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Upload Document</h3>
            <form onSubmit={(e) => { e.preventDefault(); uploadMutation.mutate(formData); }} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700">
                  <option value="Guideline">Guideline</option>
                  <option value="Recipe">Recipe</option>
                  <option value="Report">Report</option>
                  <option value="Meeting Notes">Meeting Notes</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">Description (Optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" rows="2"></textarea>
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-700 dark:text-slate-300">File (JPG, PNG, PDF)</label>
                <input type="file" required accept=".jpg,.jpeg,.png,.pdf" onChange={e => setFormData({...formData, file: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-primary/20 dark:hover:file:bg-primary/30 cursor-pointer" />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={uploadMutation.isPending || !formData.file} className="px-4 py-2 bg-primary text-white rounded flex items-center">
                  {uploadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDocuments;
