import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, Trophy, LogOut, ClipboardList, ShieldCheck, Users, BarChart3 } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const navItems = {
    Student: [
      { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'Report Issue', path: '/report', icon: <PlusCircle size={20} /> },
      { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    ],
    Admin: [
      { name: 'Command Center', path: '/admin', icon: <ClipboardList size={20} /> },
      { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    ],
    SuperAdmin: [
      { name: 'Global Overview', path: '/super-dashboard', icon: <ShieldCheck size={20} /> },
      { name: 'User Records', path: '/manage-users', icon: <Users size={20} /> },
      { name: 'School Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    ]
  };

  const currentNav = navItems[user.role] || navItems.Student;

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-100 flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-xl font-black text-gray-800">SpotFix</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {currentNav.map((item) => (
          <NavLink key={item.name} to={item.path} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl ${isActive ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-blue-50'}`}>
            {item.icon} <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-gray-100">
        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={20} /> <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </div>
  );
};
export default Sidebar;