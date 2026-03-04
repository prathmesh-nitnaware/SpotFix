import React, { useState, useEffect, useContext } from 'react';
import { Bell, BellRing, CheckCircle2, Zap, AlertCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import io from 'socket.io-client';

const NotificationCenter = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Production Data Fetch & Socket Integration
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Direct call to the Scalable DB for user-specific alerts
        const res = await API.get(`/notifications/${user.id}`);
        setNotifications(res.data);
      } catch (err) {
        console.error("History Sync Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // 2. Real-Time Socket.io Connection
    const socket = io('http://localhost:5000'); // Ensure this matches your Node.js port
    socket.on(`notification-${user.id}`, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      // Play a subtle sound or trigger browser notification here
    });

    return () => socket.disconnect();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await API.put(`/notifications/read-all/${user.id}`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Trigger with Real-Time Pulse */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
      >
        {unreadCount > 0 ? (
          <BellRing className="text-blue-600 animate-pulse" size={20} />
        ) : (
          <Bell className="text-slate-400" size={20} />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl z-[100] overflow-hidden"
            >
              {/* Header logic for Role-Based Updates */}
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Campus Pulse</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Live Updates</p>
                </div>
                <button onClick={markAllAsRead} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Mark All Read</button>
              </div>

              <div className="max-h-[450px] overflow-y-auto divide-y divide-slate-50">
                {loading ? (
                  <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
                ) : notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className={`p-5 flex gap-4 transition-colors ${!n.read ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}
                    >
                      {/* Urgency/Category Icons */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                        n.type === 'resolved' ? 'bg-green-50 text-green-600 border-green-100' : 
                        n.type === 'impact' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {n.type === 'resolved' ? <CheckCircle2 size={20} /> : 
                         n.type === 'impact' ? <Zap size={20} className="fill-current" /> : 
                         <AlertCircle size={20} />}
                      </div>
                      
                      <div className="space-y-1">
                        <p className={`text-sm leading-tight ${!n.read ? 'font-black text-slate-800' : 'font-medium text-slate-500'}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{n.createdAt}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center">
                    <p className="text-slate-400 font-black text-sm italic">Campus silence is golden.</p>
                    <p className="text-[10px] text-slate-300 uppercase font-bold mt-1 tracking-widest text-center">No new notifications</p>
                  </div>
                )}
              </div>

              {/* Link to User History */}
              <div className="p-4 text-center bg-slate-50 border-t border-slate-100">
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors">View All Activity</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;