import React, { useState, useEffect } from 'react';
import API from '../api/axios'; // Secure Backend Instance
import { MoreVertical, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBoard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const columns = ['Pending', 'Processing', 'Working', 'Completed'];

  // 1. Fetching real issues from the Scalable DB
  useEffect(() => {
    const getBoardData = async () => {
      try {
        setLoading(true);
        const res = await API.get('/admin/all-issues');
        setIssues(res.data);
      } catch (err) {
        console.error("Board Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    getBoardData();
  }, []);

  // 2. Status Update Logic (Triggers Gamification & Emails)
  const updateStatus = async (id, newStatus) => {
    try {
      await API.put('/admin/update-status', { issueId: id, status: newStatus });
      setIssues(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error("Status Update Failed:", err);
    }
  };

  const highPriorityCount = issues.filter(i => i.priority === 'High' && i.status !== 'Completed').length;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* 3. ADMIN HEADER WITH REAL-TIME STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 font-medium">Managing VIT Infrastructure.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-red-50 text-red-600 px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100 shadow-sm flex items-center gap-2">
            <AlertCircle size={14} /> {highPriorityCount} Urgent
          </div>
          <div className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200">
            {issues.length} Active Tickets
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-bold text-xs uppercase tracking-[0.2em]">Syncing Architects Board...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {columns.map(col => (
            <div key={col} className="bg-slate-100/50 p-4 rounded-[2rem] border border-slate-100 min-h-[70vh]">
              <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2 px-2">
                <div className={`w-2 h-2 rounded-full ${col === 'Pending' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
                {col} ({issues.filter(i => i.status === col).length})
              </h3>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {issues.filter(i => i.status === col).map(issue => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={issue._id} 
                      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-xl transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter border ${
                          issue.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                        }`}>
                          {issue.priority} Priority
                        </span>
                        <div className="relative group/menu">
                           <MoreVertical size={14} className="text-slate-300 hover:text-slate-600" />
                           {/* Quick Action Dropdown */}
                           <div className="absolute right-0 top-full mt-2 hidden group-hover/menu:block bg-slate-900 text-white rounded-xl shadow-xl z-10 w-32 p-1 overflow-hidden">
                              {columns.filter(c => c !== col).map(nextCol => (
                                <button 
                                  key={nextCol}
                                  onClick={() => updateStatus(issue._id, nextCol)}
                                  className="w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-blue-600 rounded-lg"
                                >
                                  Move to {nextCol}
                                </button>
                              ))}
                           </div>
                        </div>
                      </div>
                      <h4 className="font-black text-slate-800 text-sm leading-tight mb-1">{issue.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                         <Clock size={10} /> {issue.room}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBoard;