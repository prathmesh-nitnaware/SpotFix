import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
  Zap, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  // Mock data for UI - will be replaced by User History API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/issues/user/${user.id}`);
        setHistory(res.data);
      } catch (err) {
        setHistory([
          { _id: '1', title: 'AC Leakage', status: 'Resolved', priority: 'High', date: '2026-03-01' },
          { _id: '2', title: 'Projector Noise', status: 'Processing', priority: 'Medium', date: '2026-03-02' }
        ]);
      }
    };
    if(user) fetchHistory();
  }, [user]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. CAMPUS PASSPORT */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em]">Architect Passport</p>
              <h1 className="text-3xl font-black mt-1">{user?.name || 'Architect'}</h1>
              <p className="text-blue-200 text-sm font-medium">{user?.department || 'VIT Student'}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/30">
              <Trophy size={28} className="text-yellow-300" />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold opacity-80 uppercase">Impact Points</span>
              </div>
              <p className="text-3xl font-black">450</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={16} className="text-orange-400" />
                <span className="text-xs font-bold opacity-80 uppercase">Global Rank</span>
              </div>
              <p className="text-3xl font-black">#12</p>
            </div>
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </motion.div>

      {/* 2. QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/report')}
          className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:border-blue-500 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Report New Issue</h3>
              <p className="text-xs text-slate-500">ML-Powered Priority Triage</p>
            </div>
          </div>
          <ArrowUpRight className="text-slate-300 group-hover:text-blue-600 transition-all" />
        </button>

        <button 
          onClick={() => navigate('/lost-found')}
          className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:border-orange-500 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Lost & Found</h3>
              <p className="text-xs text-slate-500">Community Support</p>
            </div>
          </div>
          <ArrowUpRight className="text-slate-300 group-hover:text-orange-600 transition-all" />
        </button>
      </div>

      {/* 3. USER HISTORY */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 px-2">Recent Activities</h2>
        <div className="space-y-3">
          {history.length > 0 ? history.map((issue) => (
            <div key={issue._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${issue.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  {issue.status === 'Resolved' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{issue.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{issue.date}</p>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                issue.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {issue.status}
              </span>
            </div>
          )) : (
            <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">No reports found. Be an Architect!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;