import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { BarChart3, AlertCircle, CheckCircle, Map } from 'lucide-react';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ summary: {}, departmentBreakdown: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/superadmin/global-stats');
        setStats(res.data);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen ml-64">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-800">Global Overview</h1>
        <p className="text-gray-500">School-wide infrastructure and issue analytics</p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Issues" value={stats.summary.totalIssues} icon={<AlertCircle color="blue" />} />
        <StatCard title="Resolved" value={stats.summary.completedIssues} icon={<CheckCircle color="green" />} />
        <StatCard title="High Priority" value={stats.summary.highPriority} icon={<AlertCircle color="red" />} />
      </div>

      {/* Department Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Map className="text-blue-600" size={20} /> Departmental Activity
        </h3>
        <div className="space-y-4">
          {stats.departmentBreakdown.map(dept => (
            <div key={dept._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-bold text-gray-700">{dept._id}</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                {dept.count} Reports
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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