import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
  Search, Plus, Map as MapIcon, Mic, Trophy, Bell, ChevronDown, CheckCircle2, User, Layout, BarChart, Settings, LogOut, FileText, AlertCircle, TrendingUp, Zap, Clock, Package, MapPin, ArrowUpRight, HelpCircle, Flame, ChevronRight, Target, Shield, MessageSquare, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // States
  const [history, setHistory] = useState([]);
  const [pulseFeed, setPulseFeed] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to FixIt Campus! Start reporting to earn Impact Points.", time: "Just now", read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [historyRes, pulseRes, leadersRes] = await Promise.all([
          API.get(`/issues/user/${user.id}`), // My Issues Feed
          API.get('/admin/all-issues'),       // Campus Pulse (Using admin route momentarily to get all campus issues)
          API.get('/admin/users')             // Leaderboard Preview
        ]);

        setHistory(historyRes.data);

        // Sorting and taking top 5 for Campus Pulse
        const recentPulse = pulseRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setPulseFeed(recentPulse);

        // Leaderboard Top 5 (Students Only)
        const studentLeaders = leadersRes.data.filter(u => !['Admin', 'SuperAdmin', 'Staff'].includes(u.role));
        const top5 = studentLeaders.sort((a, b) => b.impactPoints - a.impactPoints).slice(0, 5);
        setLeaderboard(top5);

      } catch (err) {
        console.error("Dashboard Data fetch error:", err);
      }
    };
    if (user) fetchDashboardData();

    // Socket Connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    if (user) {
      newSocket.on(`notification-${user.id}`, (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          text: data.message || "You have a new notification",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        }, ...prev]);
      });

      newSocket.on(`update-${user.id}`, (data) => {
        // Optional: refresh history or show notification
        setNotifications(prev => [{
          id: Date.now(),
          text: data.message || "Your issue status was updated.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        }, ...prev]);
      });

      newSocket.on('new-issue', (newIssue) => {
        setPulseFeed(prev => [newIssue, ...prev].slice(0, 5));
      });
    }

    return () => newSocket.disconnect();
  }, [user]);

  // Stats calculation
  const openIssues = history.filter(i => i.status === 'Pending').length;
  const inProgress = history.filter(i => i.status === 'Processing' || i.status === 'Working').length;
  const resolved = history.filter(i => i.status === 'Completed' || i.status === 'Resolved').length;

  const levelProgress = user?.impactPoints ? (user.impactPoints % 100) / 100 * 100 : 0;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredHistory = history.filter(issue => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Open') return issue.status === 'Pending';
    if (activeTab === 'In Progress') return issue.status === 'Processing' || issue.status === 'Working';
    if (activeTab === 'Resolved') return issue.status === 'Completed' || issue.status === 'Resolved';
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans">

      {/* 1. TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Target size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-800">SpotFix</span>
        </div>



        <div className="flex items-center gap-6 relative">
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-slate-500 hover:text-blue-600 transition-colors">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden py-2 z-50 flex flex-col max-h-[70vh]"
                >
                  <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50">
                    <span className="font-black text-sm text-slate-800">Notifications</span>
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar flex-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-slate-400 font-bold py-6 text-xs">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 border-b border-slate-50 flex gap-3 relative group ${!n.read ? 'bg-blue-50/50' : ''}`}>
                          <div className="mt-1">
                            {n.read ? <CheckCircle2 size={14} className="text-slate-300" /> : <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>}
                          </div>
                          <div className="flex-1 pr-6">
                            <p className={`text-xs ${!n.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>{n.text}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{n.time}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(notif => notif.id !== n.id)); }}
                            className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 rounded-lg transition-all"
                            title="Delete"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-full pr-3 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <User size={16} />
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden py-2 z-50"
                >
                  <button onClick={() => { }} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Profile</button>

                  <div className="h-px bg-slate-100 my-2"></div>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50">Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">

        {/* 2. HERO SECTION - CAMPUS PASSPORT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Background dynamic blur */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-blue-400" size={20} />
                <span className="text-blue-300 text-xs font-black uppercase tracking-widest">Campus Passport</span>
              </div>
              <h1 className="text-4xl font-black mb-1">{user?.name || 'Architect'}</h1>
              <p className="text-slate-400 font-medium text-lg mb-6">{user?.department || 'Student'} • Level {user?.level || 1} Citizen</p>

              <div className="space-y-2 max-w-sm mb-6">
                <div className="flex justify-between text-xs font-bold font-mono text-slate-300">
                  <span>{user?.impactPoints || 0} XP</span>
                  <span>{((user?.level || 1) * 100)} XP</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right">To next level</p>
              </div>

              <div className="flex gap-3">
                <div title="First Responder" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-orange-400 shadow-inner">
                  <Zap size={18} />
                </div>
                <div title="Community Voice" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-blue-400 shadow-inner">
                  <MessageSquare size={18} />
                </div>
                <div title="Campus Hero" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-yellow-400 shadow-inner">
                  <Trophy size={18} />
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex-1 md:w-48">
                <p className="text-3xl font-black">{history.length}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Issues Reported</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex-1 md:w-48">
                <p className="text-3xl font-black text-green-400">{resolved}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Issues Resolved</p>
              </div>
            </div>

          </div>
        </motion.div>

        {/* 3. QUICK ACTION BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button onClick={() => navigate('/report')} className="flex flex-col items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-200 group">
            <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm">Report Issue</span>
          </button>

          <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl transition-all shadow-sm group">
            <Trophy size={24} className="mb-2 text-yellow-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm text-center leading-tight">View<br />Leaderboard</span>
          </button>

          <button onClick={() => navigate('/lost-found')} className="flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl transition-all shadow-sm group">
            <HelpCircle size={24} className="mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm text-center leading-tight">Lost &<br />Found</span>
          </button>

          <button onClick={() => { window.scrollTo({ top: 800, behavior: 'smooth' }) }} className="flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl transition-all shadow-sm group">
            <CheckCircle2 size={24} className="mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm text-center leading-tight">My<br />Issues</span>
          </button>
        </div>

        {/* 4. PERSONAL STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle size={16} className="text-red-500" /></div>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase">Live</span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">{openIssues}</p>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Open Issues</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Clock size={16} className="text-blue-500" /></div>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">Doing</span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">{inProgress}</p>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">In Progress</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 size={16} className="text-green-500" /></div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">{resolved}</p>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Resolved Fixed</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><Zap size={16} className="text-indigo-500" /></div>
              <span className="text-emerald-500 text-[10px] font-black flex items-center gap-1">↑ 12%</span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">4.2h</p>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Avg Res Time</p>
            </div>
          </div>
        </div>

        {/* MAiN BOTTOM SECTION (Pulse, Map, List) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT COL: MY ISSUES */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex gap-1 overflow-x-auto">
                {['All', 'Open', 'In Progress', 'Resolved'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Target className="text-blue-500" /> My Issues Feed
              </h2>

              <AnimatePresence>
                {filteredHistory.map((issue) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    key={issue._id}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${issue.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                          }`}>
                          {issue.priority} Priority
                        </span>
                        <h4 className="font-bold text-lg text-slate-800 leading-tight">{issue.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={12} /> {issue.location?.building} • {issue.location?.room || 'General'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(issue.createdAt || Date.now()).toLocaleDateString()}</p>
                        <div className="mt-2 flex items-center justify-end gap-1 text-slate-400 font-bold text-sm bg-slate-50 px-2 py-1 rounded-lg">
                          <Zap size={14} className="fill-slate-300" /> {issue.upvotes?.length || 0}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Stepper */}
                    <div className="mt-6 mb-4 relative">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full z-0 transition-all duration-1000"
                        style={{ width: issue.status === 'Completed' || issue.status === 'Resolved' ? '100%' : issue.status === 'Processing' || issue.status === 'Working' ? '66%' : '33%' }}
                      ></div>
                      <div className="relative z-10 flex justify-between">
                        <div className="bg-blue-500 w-4 h-4 rounded-full border-4 border-white shadow-sm"></div>
                        <div className={`w-4 h-4 rounded-full border-4 border-white shadow-sm ${issue.status === 'Pending' ? 'bg-slate-200' : 'bg-blue-500'}`}></div>
                        <div className={`w-4 h-4 rounded-full border-4 border-white shadow-sm ${(issue.status === 'Completed' || issue.status === 'Resolved') ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      <span>Reported</span>
                      <span>In Progress</span>
                      <span>Resolved</span>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <MessageSquare size={14} /> Add Comment
                      </button>
                      {(issue.status === 'Completed' || issue.status === 'Resolved') && (
                        <button className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                          Still not fixed?
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {filteredHistory.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} /></div>
                    <p className="text-slate-500 font-bold">No issues found. Everything looks good!</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT COL: MAP & PULSE & LEADERBOARD */}
          <div className="space-y-6">


            {/* 🔥 Campus Pulse */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Flame className="text-orange-500 fill-orange-500" size={18} /> Campus Pulse
                </h3>
                <span className="text-xs font-bold text-slate-400">Live</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {pulseFeed.map((issue) => (
                  <div key={issue._id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{issue.title}</h4>
                      <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mt-1"><MapPin size={10} /> {issue.location?.building}</p>
                    </div>
                    <button className="bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-slate-200 rounded-xl px-2 py-1 flex flex-col items-center transition-all min-w-[36px]">
                      <Zap size={12} className={issue.upvotes?.length > 10 ? 'fill-orange-500 text-orange-500' : 'text-slate-400'} />
                      <span className="text-[10px] font-black">{issue.upvotes?.length || 0}</span>
                    </button>
                  </div>
                ))}
                {pulseFeed.length === 0 && (
                  <div className="p-6 text-center text-sm font-medium text-slate-400">Loading live pulse...</div>
                )}
              </div>
            </div>

            {/* 🏆 Leaderboard Preview */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Trophy className="text-yellow-500" size={18} /> Top Architects
                </h3>
                <button onClick={() => navigate('/leaderboard')} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors flex items-center">View All <ChevronRight size={12} /></button>
              </div>

              <div className="space-y-3">
                {leaderboard.map((ld, i) => (
                  <div key={ld._id} className={`flex items-center justify-between p-2 rounded-xl transition-colors ${ld._id === user?.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 text-center font-black text-xs ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : 'text-slate-300'}`}>
                        #{i + 1}
                      </div>
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex justify-center items-center font-bold text-xs"><User size={14} className="text-slate-500" /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{ld.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-black">{ld.role}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-600 bg-blue-100/50 px-2 py-1 rounded-md">{ld.impactPoints} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 🔔 Recent Notifications Panel */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Bell className="text-slate-400" size={18} /> Notifications
                </h3>
                <button className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">Mark all read</button>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-2xl flex items-start gap-3 transition-colors cursor-pointer ${notif.read ? 'hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50 border border-blue-100'}`}>
                    <div className="mt-1">
                      {notif.text.includes("badge") ? <Trophy size={14} className="text-yellow-500" /> : <AlertCircle size={14} className="text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${notif.read ? 'text-slate-600 font-medium' : 'text-slate-800 font-bold'}`}>{notif.text}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;