import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { BarChart3, TrendingUp, PieChart, Calendar, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalResolved: 0,
    avgResolutionTime: '0h',
    departmentTrends: [],
    monthlyGrowth: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Direct mapping to the Analytics Logic in your Secure Backend
        const res = await API.get('/admin/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error("Analytics Error:", err);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">System Analytics</h1>
          <p className="text-slate-500 font-medium">Visualizing trends and performance.</p>
        </div>
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <Calendar size={18} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600 uppercase">Last 30 Days</span>
        </div>
      </div>

      {/* PRIMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <TrendingUp className="text-blue-600 mb-4" size={24} />
          <p className="text-4xl font-black text-slate-900">{analytics.totalResolved}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Issues Resolved</p>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <BarChart3 className="text-green-600 mb-4" size={24} />
          <p className="text-4xl font-black text-slate-900">{analytics.avgResolutionTime}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg. Resolution Time</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <AlertTriangle className="text-red-600 mb-4" size={24} />
          <p className="text-4xl font-black text-slate-900">{analytics.monthlyGrowth}%</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Report Frequency Inc.</p>
        </div>
      </div>

      {/* TREND VISUALIZATION PLACEHOLDER */}
      <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-200">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-xl font-bold">Issue Trend Classifier</h3>
            <p className="text-blue-400 text-sm">Identifying peaks in campus maintenance needs.</p>
          </div>
          <PieChart className="text-blue-500" size={32} />
        </div>
        
        {/* Production Chart logic would be injected here */}
        <div className="h-64 flex items-end gap-3 px-4">
          {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;