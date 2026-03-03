import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Rss, // Replaces Map for "Live Feed"
  Trophy, 
  Settings, 
  LogOut, 
  ClipboardList,
  ShieldCheck,
  Zap // For "Quick Actions" or Analytics
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const navItems = {
    Student: [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20}/> },
      { name: 'Report Issue', path: '/report', icon: <PlusCircle size={20}/> },
      { name: 'Live Feed', path: '/feed', icon: <Rss size={20}/> }, // Updated: Direct feed instead of map
      { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20}/> },
    ],
    Admin: [
      { name: 'Command Center', path: '/admin', icon: <ClipboardList size={20}/> },
      { name: 'Issue Insights', path: '/insights', icon: <Zap size={20}/> }, // Replacing Map Pulse
      { name: 'Analytics', path: '/analytics', icon: <Settings size={20}/> },
    ],
    SuperAdmin: [
      { name: 'Global Overview', path: '/admin', icon: <ShieldCheck size={20}/> },
      { name: 'System Logs', path: '/logs', icon: <ClipboardList size={20}/> },
      { name: 'Manage Teams', path: '/teams', icon: <Settings size={20}/> },
    ]
  };

  const currentNav = navItems[user?.role] || navItems.Student;

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-100 flex flex-col p-6 fixed left-0 top-0 z-50">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
          S
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none">SpotFix</h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">The Architects</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {currentNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-100' 
                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}
            `}
          >
            <span className="transition-transform group-hover:scale-110">{item.icon}</span>
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Mini-Profile & Logout */}
      <div className="pt-6 border-t border-gray-100 space-y-4">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center font-bold text-blue-600 text-xs">
            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-800 truncate">{user?.name || 'Architect'}</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter truncate">{user?.role || 'Student'}</p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;