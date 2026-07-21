import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Receipt, IndianRupee, Loader2, Download, TrendingUp } from 'lucide-react';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

const Reports = () => {
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/reports');
      return data;
    }
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  const { summary, expensesByCategory, monthlySpending } = reportData.data;

  // Add dummy data if real data is empty to make the charts look good for demonstration
  const displayMonthly = monthlySpending.length > 0 ? monthlySpending : [
    { name: 'Jan 2026', spent: 4000 },
    { name: 'Feb 2026', spent: 3000 },
    { name: 'Mar 2026', spent: 2000 },
    { name: 'Apr 2026', spent: 2780 },
    { name: 'May 2026', spent: 1890 },
    { name: 'Jun 2026', spent: 2390 },
  ];

  const displayCategory = expensesByCategory.length > 0 ? expensesByCategory : [
    { name: 'Catering', value: 400 },
    { name: 'Logistics', value: 300 },
    { name: 'Decoration', value: 300 },
    { name: 'AV/Tech', value: 200 },
  ];

  const StatCard = ({ title, value, icon: Icon, color, prefix = '' }) => (
    <div className="glass-card p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform">
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
          {prefix && <IndianRupee size={20} className="mr-0.5"/>}
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-slate-500">Track club spending, budget utilization, and event metrics.</p>
        </div>
        <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 h-10 rounded-xl font-medium transition-colors flex items-center gap-2">
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Events Hosted" value={summary.totalEvents || 0} icon={Calendar} color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" />
        <StatCard title="Total Budget Allocated" value={summary.totalBudget || 0} icon={IndianRupee} prefix="₹" color="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" />
        <StatCard title="Total Amount Spent" value={summary.totalSpent || 0} icon={Receipt} prefix="₹" color="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" /> Monthly Spending Trends
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayMonthly} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(226, 232, 240, 0.4)'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="spent" name="Amount Spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses By Category Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Expenses by Category</h3>
          <div className="h-80 w-full flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => `₹${value}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
