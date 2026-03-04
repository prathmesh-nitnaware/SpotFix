import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  AlertCircle, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Filter,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminFeed = () => {
  const [issues, setIssues] = useState([]); // Real-time data storage
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Fetching all issues from Secure Backend
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await API.get('/admin/all-issues');
        setIssues(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      // Logic for status update and automated emailing
      await API.put(`/admin/update-status`, { issueId, status: newStatus });
      setIssues(prev => prev.map(issue => 
        issue._id === issueId ? { ...issue, status: newStatus } : issue
      ));
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      default: return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Command Center</h1>
          <p className="text-slate-500 font-medium">Monitoring VIT infrastructure health.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {['All', 'High', 'Medium'].map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === p ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ANALYTICS PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{issues.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Tickets</p>
          </div>
        </div>
        {/* Additional analytic cards would map here for "Basic Analytics Dashboard" */}
      </div>

      {/* 3. LIVE ISSUE FEED */}
      <div className="space-y-4">
        <AnimatePresence>
          {issues
            .filter(i => filter === 'All' || i.priority === filter)
            .map((issue) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={issue._id}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center gap-6"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${getPriorityColor(issue.priority)}`}>
                <AlertCircle size={28} className={issue.priority === 'High' ? 'animate-pulse' : ''} />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${getPriorityColor(issue.priority)}`}>
                    {issue.priority} Priority
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Clock size={10} /> {issue.createdAt}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-800 leading-tight">{issue.title}</h3>
                <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {issue.location.building}, {issue.location.room}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleStatusUpdate(issue._id, 'Processing')}
                  className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all"
                >
                  Process
                </button>
                <button 
                  onClick={() => handleStatusUpdate(issue._id, 'Completed')}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-green-600 transition-all shadow-lg"
                >
                  <CheckCircle2 size={14} /> Resolve
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {issues.length === 0 && !loading && (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">Campus is perfectly maintained! No active issues.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeed;