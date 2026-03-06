import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, User, ChevronDown, CheckCircle2, AlertCircle, Bot, Zap,
  TrendingUp, Activity, BarChart3, Clock, MapPin, Loader2, Download,
  MessageSquare, Users, ShieldAlert, FileText, Check, ArrowRight, ArrowLeft, X
} from 'lucide-react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomMarker = (priority) => {
  const colors = {
    'Critical': '#ef4444',
    'High': '#ef4444',
    'Medium': '#f59e0b',
    'Low': '#3b82f6'
  };
  const color = colors[priority] || colors['Medium'];
  return L.divIcon({
    className: 'custom-div-icon',
    html: `< div style = "background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); ${priority === 'High' || priority === 'Critical' ? 'animation: pulse 2s infinite;' : ''}" ></div > `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// DUMMY CAMPUS LOCATIONS FOR THE HEATMAP (Since exact coordinates aren't in DB yet)
const getDummyCoords = (buildingName) => {
  const baseLat = 19.0222;
  const baseLng = 72.8561;
  const hash = buildingName.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
  return [baseLat + (hash % 100) * 0.0001, baseLng + (hash % 100) * 0.0001];
};

const AdminFeed = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [staff, setStaff] = useState([]);
  const [socket, setSocket] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // AI States
  const [aiRanking, setAiRanking] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiPatterns, setAiPatterns] = useState(null);
  const [analyzing, setAnalyzing] = useState({ prioritize: false, summary: false, patterns: false });

  const [searchQuery, setSearchQuery] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  const fetchStaffWorkload = async () => {
    try {
      const res = await API.get('/admin/staff-workload');
      setStaff(res.data || []);
    } catch (err) {
      console.error("Error fetching staff workload:", err);
      setStaff([]);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [issuesRes] = await Promise.all([
          API.get('/admin/all-issues'),
          fetchStaffWorkload() // Call the new function
        ]);
        const sortedIssues = (issuesRes.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setIssues(sortedIssues);
      } catch (err) {
        console.error("Dashboard init error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('new-issue', (issue) => {
      setIssues(prev => [issue, ...prev]);
      addToFeed(`🔴 New ${issue.priority || 'Medium'} priority issue reported in ${issue.location?.building} `, 'alert');
    });

    newSocket.on('issue-status-updated', (updatedIssue) => {
      setIssues(prev => prev.map(i => i._id === updatedIssue._id ? updatedIssue : i));
      addToFeed(`✅ Issue "${updatedIssue.title}" status changed to ${updatedIssue.status} `, 'success');
    });

    newSocket.on('issue-assigned', (updatedIssue) => {
      setIssues(prev => prev.map(i => i._id === updatedIssue._id ? updatedIssue : i));
      addToFeed(`👨‍🔧 Issue "${updatedIssue.title}" assigned to ${updatedIssue.assignedTo?.name || 'staff'} `, 'info');
      fetchStaffWorkload(); // Refresh staff workload after assignment
    });

    return () => newSocket.disconnect();
  }, []);

  const addToFeed = (text, type) => {
    setFeed(prev => [{ id: Date.now(), text, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
  };

  // --- AI ACTIONS ---
  const runAIPrioritize = async () => {
    setAnalyzing(p => ({ ...p, prioritize: true }));
    try {
      const res = await API.post(process.env.VITE_AI_URL ? `${process.env.VITE_AI_URL} /ai-prioritize` : 'http:/ / localhost: 8000 / ai - prioritize', { issues: issues.filter(i => i.status === 'Pending') });
      setAiRanking(res.data.ranked_issues);
      addToFeed('🤖 AI completed live prioritization of Open issues.', 'system');
    } catch (err) { console.error(err); alert("AI Engine unreachable."); }
    setAnalyzing(p => ({ ...p, prioritize: false }));
  };

  const runAISummarize = async () => {
    setAnalyzing(p => ({ ...p, summary: true }));
    try {
      const recent = issues.filter(i => new Date(i.createdAt) > new Date(Date.now() - 86400000));
      const res = await API.post(process.env.VITE_AI_URL ? `${process.env.VITE_AI_URL}/summarize-today` : 'http://localhost:8000/summarize-today', { issues: recent });
      setAiSummary(res.data.summary);
      addToFeed('📝 AI generated the daily structural summary.', 'system');
    } catch (err) { console.error(err); }
    setAnalyzing(p => ({ ...p, summary: false }));
  };

  const runAIPatterns = async () => {
    setAnalyzing(p => ({ ...p, patterns: true }));
    try {
      const res = await API.post(process.env.VITE_AI_URL ? `${process.env.VITE_AI_URL}/detect-patterns` : 'http://localhost:8000/detect-patterns', { issues });
      setAiPatterns(res.data.patterns);
      addToFeed('🔍 AI completed 7-day pattern detection scan.', 'system');
    } catch (err) { console.error(err); }
    setAnalyzing(p => ({ ...p, patterns: false }));
  };

  // --- KANBAN LOGIC ---
  const handleStatusUpdate = async (issueId, status) => {
    try {
      await API.put('/admin/update-status', { issueId, status });
    } catch (err) { console.error(err); }
  };

  // Assign Issue Manually (Override)
  const handleAssign = async (issueId, staffId) => {
    try {
      const res = await API.put('/admin/assign', { issueId, staffId });
      setIssues(issues.map(i => i._id === issueId ? res.data : i));
    } catch (err) {
      console.error(err);
    }
  };

  // Auto Assign via Backend ML/Workload Algorithm
  const handleAutoAssign = async (issueId) => {
    try {
      const res = await API.put('/admin/auto-assign', { issueId });
      setIssues(issues.map(i => i._id === issueId ? res.data : i));
      // Refresh staff workload counts after auto-assignment
      fetchStaffWorkload();
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("No staff available in system to auto-assign.");
      } else {
        console.error(err);
      }
    }
  };

  // --- COMPUTED STATS ---
  const activeIssues = issues.filter(i => i.status !== 'Completed' && i.status !== 'Resolved');
  const openCount = activeIssues.filter(i => i.status === 'Pending').length;
  const inProgressCount = activeIssues.filter(i => i.status === 'In Progress' || i.status === 'Processing' || i.status === 'Working').length;
  const resolvedWeek = issues.filter(i => (i.status === 'Completed' || i.status === 'Resolved') && new Date(i.resolvedAt || i.createdAt) > new Date(Date.now() - 7 * 86400000)).length;
  const newToday = issues.filter(i => new Date(i.createdAt).toDateString() === new Date().toDateString()).length;

  // Unassigned Critical
  const criticalAlerts = activeIssues.filter(i => (i.priority === 'High' || i.priority === 'Critical') && i.status === 'Pending').length;
  const reopenedIssues = activeIssues.filter(i => i.reopened).length;

  // Charts Data
  const categoryData = Object.entries(activeIssues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: 'Open', value: openCount, color: '#ef4444' },
    { name: 'In Progress', value: inProgressCount, color: '#eab308' },
    { name: 'Resolved (7d)', value: resolvedWeek, color: '#22c55e' }
  ];

  const exportCSV = () => {
    const headers = ["ID", "Title", "Category", "Priority", "Status", "Building", "Reported At"];
    const rows = issues.map(i => [i._id, `"${i.title}"`, i.category, i.priority, i.status, i.location?.building, new Date(i.createdAt).toLocaleString()]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campus_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">

      {/* MAIN CONTENT V-STACK */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto w-full">

        {/* 1. TOP NAV BAR */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
                <Bot size={18} className="text-white" />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-800">SpotFix Admin</span>
            </div>
            <div className="hidden md:flex bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
              Central Operations
            </div>
          </div>



          <div className="flex items-center gap-6 relative">
            {/* Live Alert Badge */}
            <div className="relative cursor-pointer hover:scale-105 transition-transform">
              <ShieldAlert size={22} className={criticalAlerts > 0 ? "text-red-500" : "text-slate-400"} />
              {criticalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                  {criticalAlerts}
                </span>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-full pr-3 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-sm">
                  <User size={16} />
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden py-2"
                  >
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-sm font-bold text-slate-800">{user?.name || 'Admin'}</p>
                      <p className="text-xs text-slate-500">{user?.role}</p>
                    </div>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50">Secure Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        {/* 2. AI COMMAND STRIP */}
        <div className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bot className="text-blue-400" size={24} />
              <div>
                <h2 className="text-lg font-black tracking-tight">Architect AI Core</h2>
                <p className="text-xs text-slate-400 font-medium">Neural processing ready to assist operations.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <button onClick={runAIPrioritize} disabled={analyzing.prioritize} className="flex-shrink-0 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700">
                {analyzing.prioritize ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <Zap size={16} className="text-amber-400" />}
                AI Prioritize
              </button>
              <button onClick={runAISummarize} disabled={analyzing.summary} className="flex-shrink-0 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700">
                {analyzing.summary ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <FileText size={16} className="text-blue-400" />}
                Summarize Today
              </button>
              <button onClick={runAIPatterns} disabled={analyzing.patterns} className="flex-shrink-0 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-700">
                {analyzing.patterns ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <Search size={16} className="text-emerald-400" />}
                Detect Patterns
              </button>
            </div>
          </div>

          {/* AI Output Renderers */}
          <AnimatePresence>
            {aiRanking && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-2"><Zap size={12} /> AI Ranked Execution Order</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {aiRanking.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/50">
                      <div className="bg-slate-900 border border-slate-700 font-mono text-xs px-2 py-1 rounded text-amber-400">#{r.rank}</div>
                      <div>
                        <p className="font-bold text-sm text-white">{r.issue} <span className="text-slate-400 text-xs font-normal">in {r.location}</span></p>
                        <p className="text-xs text-slate-400 mt-0.5">{r.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {aiSummary && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 p-4 bg-blue-900/20 border border-blue-800/50 rounded-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-2"><FileText size={12} /> 24H Executive Summary</h3>
                <p className="text-sm text-blue-100 leading-relaxed font-medium">{aiSummary}</p>
              </motion.div>
            )}
            {aiPatterns && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-2"><Search size={12} /> Pattern Detection Result</h3>
                <p className="text-sm text-emerald-100 leading-relaxed font-medium">{aiPatterns}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SCROLLABLE MAIN DASHBOARD AREA */}
        <div className="p-6 space-y-8 flex-shrink-0">

          {/* 9. REOPENED ALERT BANNER */}
          {reopenedIssues > 0 && (
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
              <AlertCircle size={20} className="text-amber-500 flex-shrink-0" />
              <p className="font-bold text-sm">⚠️ {reopenedIssues} issues have been reopened by students — they were marked resolved but the problem persists.</p>
            </motion.div>
          )}

          {/* 3. STATS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Today</span>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={14} /></div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800">{newToday}</h3>
                <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1">+ Live Sync</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-16 h-16 bg-red-50 rounded-tl-full -z-0"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Open Issues</span>
                  <div className="p-1.5 bg-red-50 text-red-600 rounded-lg"><ShieldAlert size={14} /></div>
                </div>
                <h3 className="text-3xl font-black text-slate-800">{openCount}</h3>
                <p className="text-[10px] font-bold text-slate-500 mt-1">Requires assignment</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">In Progress</span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Activity size={14} /></div>
              </div>
              <h3 className="text-3xl font-black text-slate-800">{inProgressCount}</h3>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resolved (7d)</span>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={14} /></div>
              </div>
              <h3 className="text-3xl font-black text-slate-800">{resolvedWeek}</h3>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform md:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Resolution</span>
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Clock size={14} /></div>
              </div>
              <h3 className="text-3xl font-black text-slate-800">4.2<span className="text-sm font-bold text-slate-400">h</span></h3>
            </div>
          </div>



          {/* 5. KANBAN BOARD & 7. STAFF MGT */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* KANBAN */}
            <div className="xl:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg> Active Operations Board</h3>
                  <p className="text-xs text-slate-500 font-medium">Drag or use arrows to move tickets between stages.</p>
                </div>
                <button
                  onClick={() => setShowResolved(true)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  View Resolved Archive
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {/* Kanban Columns */}
                {['Pending', 'In Progress', 'Completed'].map(colStatus => (
                  <div key={colStatus} className="flex-1 min-w-[300px] bg-slate-100/50 p-4 rounded-[2rem] border border-slate-200">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h4 className="font-black text-sm text-slate-700 uppercase tracking-widest">{colStatus === 'Pending' ? 'Open' : colStatus}</h4>
                      <span className="bg-white text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-200">
                        {issues.filter(i => {
                          if (colStatus === 'In Progress') return i.status === 'Processing' || i.status === 'Working' || i.status === 'In Progress';
                          if (colStatus === 'Completed') return i.status === 'Completed';
                          return i.status === colStatus;
                        }).length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {issues.filter(i => {
                        if (searchQuery && !i.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                        if (colStatus === 'In Progress') return i.status === 'Processing' || i.status === 'Working' || i.status === 'In Progress';
                        if (colStatus === 'Completed') return i.status === 'Completed';
                        return i.status === colStatus;
                      }).map(issue => (
                        <motion.div layoutId={issue._id} key={issue._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400">#{issue._id.slice(-4).toUpperCase()}</span>
                            {issue.priority === 'High' || issue.priority === 'Critical' ? (
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><AlertCircle size={10} /> Critical</span>
                            ) : (
                              <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Medium</span>
                            )}
                          </div>
                          <h5 className="font-bold text-sm text-slate-900 leading-tight mb-2">{issue.title}</h5>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 mb-4">
                            <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded"><MapPin size={10} /> {issue.location?.building}</span>
                            <span className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded"><Clock size={10} /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Staff Proof rendering */}
                          {(issue.proofImage || issue.staffNote) && (
                            <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1">
                                <CheckCircle2 size={12} className="text-emerald-500" /> Staff Output
                              </p>
                              {issue.staffNote && <p className="text-xs text-slate-700 italic border-l-2 border-emerald-300 pl-2 mb-2">"{issue.staffNote}"</p>}
                              {issue.proofImage && <a href={issue.proofImage} target="_blank" rel="noreferrer"><img src={issue.proofImage} alt="Fix Proof" className="h-20 w-full object-cover rounded-lg border border-slate-200" /></a>}
                            </div>
                          )}

                          {/* Escalation rendering */}
                          {issue.escalationFlag && (
                            <div className="mb-4 bg-red-50 p-3 rounded-xl border border-red-100">
                              <p className="text-[10px] font-black uppercase text-red-600 mb-1 flex items-center gap-1">
                                <AlertCircle size={12} /> Staff Escalation
                              </p>
                              <p className="text-xs text-red-900 leading-tight">"{issue.escalationNote}"</p>
                            </div>
                          )}

                          {/* Assign & Move Actions */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            {/* Staff Assignment Logic */}
                            {colStatus === 'Pending' ? (
                              <div className="flex items-center justify-between w-full pr-2">
                                <div className="text-[10px] font-bold text-slate-400 italic">Unassigned</div>
                                <button
                                  onClick={() => handleStatusUpdate(issue._id, 'Rejected')}
                                  className="bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                  title="Reject (Invalid Issue)"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  <span className="text-[10px] font-bold uppercase tracking-widest">Reject</span>
                                </button>
                              </div>
                            ) : colStatus === 'In Progress' ? (
                              <div className="flex flex-col gap-1 w-full mr-2">
                                {!issue.assignedTo ? (
                                  <button
                                    onClick={() => handleAutoAssign(issue._id)}
                                    className="flex items-center justify-center gap-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors w-full"
                                  >
                                    <Bot size={14} /> Auto Assign Staff
                                  </button>
                                ) : (
                                  <>
                                    <select
                                      className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1 outline-none w-full appearance-none pr-6 custom-select-bg"
                                      value={issue.assignedTo?._id || issue.assignedTo || ""}
                                      onChange={(e) => handleAssign(issue._id, e.target.value)}
                                    >
                                      <option value="">Unassigned</option>
                                      {staff.map(s => <option key={s._id} value={s._id}>{s.name} ({s.activeTickets} active)</option>)}
                                    </select>
                                    <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest pl-1 mt-0.5">Assigned Tech</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <button onClick={() => handleStatusUpdate(issue._id, 'Resolved')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-2 transition-colors mr-2">
                                <CheckCircle2 size={14} /> Verify & Resolve
                              </button>
                            )}

                            {/* Quick Move Arrows */}
                            <div className="flex gap-1 transition-opacity ml-auto">

                              {colStatus !== 'Completed' && (
                                <button
                                  onClick={() => handleStatusUpdate(issue._id, colStatus === 'Pending' ? 'In Progress' : 'Resolved')}
                                  className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors tooltip relative group"
                                  title="Move Right"
                                >
                                  <ArrowRight size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STAFF MANAGEMENT */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[600px]">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1 flex items-center gap-2"><Users size={16} className="text-indigo-500" /> Tech Registry</h3>
              <p className="text-xs text-slate-500 font-medium mb-6">Live workload assignments</p>

              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {staff.length === 0 ? <p className="text-xs text-slate-400 font-medium italic text-center py-4">No staff profiles found. Please register staff users.</p> : null}
                {staff.map(s => (
                  <div key={s._id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.department}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 border ${s.activeTickets > 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                      {s.activeTickets > 5 ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />} {s.activeTickets}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. ANALYTICS & 10. EXPORT */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><BarChart3 size={20} className="text-purple-600" /> Intelligence & Analytics</h3>
              </div>
              <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md">
                <Download size={14} /> Export CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
              <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center mb-2">Issue Distribution</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none">
                      {statusData.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center mb-2">Category Volume (Active)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Bar dataKey="value" name="Issues" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 8. LIVE ACTIVITY FEED (RIGHT SIDEBAR) */}
      <div className="w-64 border-l border-slate-200 bg-white shadow-xl py-6 px-4 flex flex-col h-full hidden xl:flex flex-shrink-0 z-20">
        <div className="mb-6 px-2 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 flex items-center gap-2"><Activity size={16} className="text-emerald-500" /> Live Stream</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Real-time socket connection</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          <AnimatePresence>
            {feed.map((item) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                className={`p-4 rounded-2xl border ${item.type === 'alert' ? 'bg-red-50 border-red-100' : item.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}
              >
                <p className={`text-xs font-bold leading-relaxed ${item.type === 'alert' ? 'text-red-700' : item.type === 'success' ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {item.text}
                </p>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2 block">{item.time}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {feed.length === 0 && <p className="text-xs text-slate-400 text-center py-10 font-medium">Awaiting network events...</p>}
        </div>
      </div>

      {/* Resolved Issues Modal */}
      {showResolved && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" /> Resolved Archive
              </h2>
              <button onClick={() => setShowResolved(false)} className="p-2 bg-white rounded-full hover:bg-slate-200 transition-colors shadow-sm">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {issues.filter(i => i.status === 'Resolved').length === 0 ? (
                <p className="text-center text-slate-400 font-bold py-10">No resolved issues yet.</p>
              ) : (
                issues.filter(i => i.status === 'Resolved').map(issue => (
                  <div key={issue._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
                    <div>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold text-slate-400">#{issue._id.slice(-4).toUpperCase()}</span>
                        <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Resolved</span>
                      </div>
                      <h5 className="font-bold text-sm text-slate-900 leading-tight mt-1 mb-2">{issue.title}</h5>
                      <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><MapPin size={10} /> {issue.location?.building}</p>
                    </div>
                    {issue.proofImage && <a href={issue.proofImage} target="_blank" rel="noreferrer"><img src={issue.proofImage} alt="Fix Proof" className="h-16 w-24 object-cover rounded-lg border border-slate-200" /></a>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminFeed;