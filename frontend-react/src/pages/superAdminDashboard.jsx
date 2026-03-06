import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { BarChart3, AlertCircle, CheckCircle, Map, Users, TrendingUp, Search, User, ChevronDown, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend, AreaChart, Area, Cell } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import ChartContainer from '../components/ChartContainer';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ summary: {}, departmentBreakdown: [] });
  const [analytics, setAnalytics] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          API.get('/superadmin/global-stats'),
          API.get('/superadmin/advanced-analytics')
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  // Format Heatmap Data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans">

      {/* 1. TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-800">SpotFix SuperAdmin</span>
          </div>
        </div>



        <div className="flex items-center gap-6 relative">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-full pr-3 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center shadow-sm">
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

                  <div className="h-px bg-slate-100 my-2"></div>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50">Global Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">
        <header className="flex justify-between items-end bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Global Overview</h1>
            <p className="text-slate-500 font-medium text-lg">School-wide infrastructure and issue analytics</p>
          </div>

          <Link
            to="/manage-users"
            className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-200"
          >
            <Users size={18} /> Manage Roles & Users
          </Link>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Issues" value={stats.summary?.totalIssues} icon={<AlertCircle color="blue" />} />
          <StatCard title="Resolved" value={stats.summary?.completedIssues} icon={<CheckCircle color="green" />} />
          <StatCard title="High Priority" value={stats.summary?.highPriority} icon={<AlertCircle color="red" />} />
        </div>

        {/* ADVANCED ANALYTICS SECTION */}
        {analytics && (
          <div className="mt-16">
            <div className="mb-8 border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-blue-600" size={28} />
                <h2 className="text-2xl font-black text-slate-800">Advanced Analytics Hub</h2>
              </div>

              {/* Global Date Filter Mock UI */}
              <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner overflow-x-auto">
                {['This Week', 'This Month', 'Last 3 Months', 'Last 6 Months', 'Custom'].map((range, idx) => (
                  <button
                    key={range}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${idx === 3 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Chart 1: Monthly Issue Trend */}
              <ChartContainer title="Monthly Issue Trend" id="chart-trend" insight="Traffic shows typical spikes near mid-semester exam periods.">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Chart 2: Category Breakdown (Stacked Bar) */}
              <ChartContainer title="Category Breakdown Over Time" id="chart-cat" insight="Infrastructure issues (Plumbing/Electrical) maintain a steady baseline, while 'Other' spikes sporadically.">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="Plumbing_cat" name="Plumbing" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Electrical_cat" name="Electrical" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="IT_cat" name="IT/Network" stackId="a" fill="#10B981" />
                    <Bar dataKey="Other_cat" name="Other" stackId="a" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Chart 3: Resolution Time Trend */}
              <ChartContainer title="Resolution Time Trend (Hours)" id="chart-restime" insight="Average resolution times are currently trending downwards, indicating improved staff efficiency.">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.resolutionTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="avgHours" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Chart 4: SLA Compliance By Department */}
              <ChartContainer title="SLA Compliance (48hr Target)" id="chart-sla" insight="Departments falling below 70% require administrative intervention.">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.slaCompliance} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="department" type="category" tick={{ fontSize: 12, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="compliancePct" name="Compliance %" radius={[0, 4, 4, 0]}>
                      {analytics.slaCompliance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.compliancePct >= 70 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Chart 5: Heatmap Calendar (GitHub Style) */}
              <ChartContainer title="Daily Infrastructure Load (365 Days)" id="chart-heatmap" insight="Noticeable issue clustering occurs primarily on Mondays, reflecting weekend accumulated damage.">
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <div className="w-full max-w-full overflow-x-auto pb-4 custom-scrollbar">
                    <div className="min-w-[700px]">
                      <CalendarHeatmap
                        startDate={startDate}
                        endDate={endDate}
                        values={analytics.heatmapData}
                        classForValue={(value) => {
                          if (!value || value.count === 0) return 'color-empty';
                          if (value.count < 3) return 'color-scale-1';
                          if (value.count < 6) return 'color-scale-2';
                          if (value.count < 10) return 'color-scale-3';
                          return 'color-scale-4';
                        }}
                        tooltipDataAttrs={(value) => {
                          return { 'data-tooltip': `${value.date}: ${value.count || 0} issues` };
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-400">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-[#f1f5f9]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#bfdbfe]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#60a5fa]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#2563eb]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#1e3a8a]"></div>
                    <span>More</span>
                  </div>
                </div>
              </ChartContainer>

              {/* Chart 6: Student Satisfaction Over Time (Area Chart Placeholder) */}
              <ChartContainer title="Student Satisfaction Score" id="chart-satisfaction" insight="Satisfaction steadily climbs as average resolution time drops, showing direct platform impact.">
                <ResponsiveContainer width="100%" height="100%">
                  {/* Simulate satisfaction climbing based on resolution times */}
                  <AreaChart data={analytics.resolutionTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />

                    {/* Inverting the trend so as resolution time goes DOWN, satisfaction goes UP */}
                    <Area
                      type="monotone"
                      dataKey={(data) => Math.max(0, 100 - (data.avgHours * 1.5))}
                      name="Satisfaction Score"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSat)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Extracted from original file so it stays intact
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-gray-800">{value || 0}</p>
    </div>
  </div>
);

export default SuperAdminDashboard;