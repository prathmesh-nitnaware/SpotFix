import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios'; // Production instance with JWT headers
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Download,
  ShieldCheck,
  Loader2,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const UserHistory = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetching Real Audit Trail from Scalable DB
  useEffect(() => {
    const fetchUserHistory = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        // Direct mapping to the User History endpoint
        const res = await API.get(`/issues/user-history/${user.id}`);
        setHistory(res.data);
      } catch (err) {
        console.error("History Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserHistory();
  }, [user]);

  // 2. Automated Receipt Generation Logic
  const downloadReceipt = async (issueId) => {
    try {
      // Logic to trigger the digital receipt record
      const response = await API.get(`/issues/receipt/${issueId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SpotFix-Receipt-${issueId.substring(0, 6)}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Could not generate receipt at this time.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* Header Navigation */}
      <div className="flex items-center gap-4 mb-10">
        <Link to="/dashboard" className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all group">
          <ArrowLeft size={20} className="text-slate-600 group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Impact Records</h1>
          <p className="text-slate-500 font-medium text-sm">Official history of your campus contributions.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-bold text-xs uppercase tracking-widest">Accessing Secure Records...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {history.length > 0 ? history.map((record) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={record._id} 
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 ${
                    record.status === 'Completed' 
                      ? 'bg-green-50 text-green-600 border-green-100' 
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {record.status === 'Completed' ? <CheckCircle2 size={32} /> : <Clock size={32} />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{record.category}</span>
                      <span className="text-[10px] text-slate-300 font-bold">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight">{record.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <Zap size={12} className="text-yellow-500 fill-current" />
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                         Impact Earned: <span className="text-blue-600">{record.pointsAwarded || 0} Points</span>
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="flex-1 md:text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      record.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  {record.status === 'Completed' && (
                    <button 
                      onClick={() => downloadReceipt(record._id)}
                      className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                      title="Download Digital Receipt"
                    >
                      <Download size={20} />
                    </button>
                  )}
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-6 text-slate-300">
                  <FileText size={40} />
                </div>
                <h3 className="text-slate-800 font-black text-lg">No records found</h3>
                <p className="text-slate-400 font-medium text-sm mt-1">Your impact history will appear here once you report an issue.</p>
                <Link to="/report" className="inline-block mt-8 px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100 hover:scale-105 transition-transform">
                  Start Your First Report
                </Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Security Branding */}
      <div className="mt-16 flex flex-col items-center justify-center text-center space-y-4">
        <div className="flex items-center gap-2 text-slate-300">
           <ShieldCheck size={16} />
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">The Architects Protocol</span>
        </div>
      </div>
    </div>
  );
};

export default UserHistory;