import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Trash2, Loader2, Plus, Filter } from 'lucide-react';
import api from '../services/api';

const Documents = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'Guideline', description: '', file: null });

  const { data: docsResponse, isLoading } = useQuery({
    queryKey: ['documents', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/documents');
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

      await api.post('/documents', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'all'] });
      setIsModalOpen(false);
      setFormData({ title: '', category: 'Guideline', description: '', file: null });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'all'] });
    }
  });

  const allDocs = docsResponse?.data || [];
  const documents = filter === 'All' ? allDocs : allDocs.filter(d => d.category === filter);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  const categories = ['All', 'Guideline', 'Recipe', 'Report', 'Meeting Notes', 'Other'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Document Hub</h1>
          <p className="text-slate-500">Central repository for all club documents, recipes, and guidelines.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Upload Document
        </button>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        <Filter size={18} className="text-slate-400" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {documents.map(doc => {
          const isImage = doc.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i);
          return (
            <div key={doc._id} className="glass-card group flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative border-b border-slate-200 dark:border-slate-700/50">
                {isImage ? (
                  <img src={doc.fileUrl} alt={doc.title} className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-16 h-16 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm transition-colors">
                    <Download size={20} />
                  </a>
                  <button onClick={() => deleteMutation.mutate(doc._id)} className="p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1" title={doc.title}>{doc.title}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {doc.category}
                  </span>
                  {doc.event && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary truncate max-w-[120px]">
                      {doc.event.title}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-grow mb-4">{doc.description}</p>
                <div className="text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto flex justify-between items-center">
                  <span>{doc.uploadedBy?.name}</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
        {documents.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 glass-card">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-1">No documents found</h3>
            <p className="text-slate-500">Upload a new document or adjust your filters.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Upload Global Document</h3>
            <form onSubmit={(e) => { e.preventDefault(); uploadMutation.mutate(formData); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700">
                  <option value="Guideline">Guideline</option>
                  <option value="Recipe">Recipe</option>
                  <option value="Report">Report</option>
                  <option value="Meeting Notes">Meeting Notes</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Description (Optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">File (JPG, PNG, PDF)</label>
                <input type="file" required accept=".jpg,.jpeg,.png,.pdf" onChange={e => setFormData({...formData, file: e.target.files[0]})} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={uploadMutation.isPending || !formData.file} className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center transition-colors">
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

export default Documents;
