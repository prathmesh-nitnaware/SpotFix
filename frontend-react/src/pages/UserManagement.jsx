import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { UserCog, Building2, Shield, Search, User, ChevronDown, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const departments = ['CMPN', 'INFT', 'EXCS', 'EXTC', 'BIOM'];
  const staffCategories = ['Electrical', 'Plumbing', 'Furniture', 'IT Support', 'Cleaning', 'Other'];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/superadmin/all-records');
        setUsers(res.data);
      } catch (err) { console.error(err); }
    };
    fetchUsers();
  }, []);

  const handleUpdate = async (userId, field, value) => {
    try {
      const userToUpdate = users.find(u => u._id === userId);

      let payload = {
        userId,
        department: field === 'department' ? value : userToUpdate.department,
        role: field === 'role' ? value : userToUpdate.role,
        staffCategory: field === 'staffCategory' ? value : userToUpdate.staffCategory
      };

      // Auto-nullify logic
      if (payload.role === 'Admin') {
        payload.department = null;
        payload.staffCategory = null;
      } else if (payload.role !== 'Staff') {
        payload.staffCategory = null; // Only staff have categories
      }

      await API.put('/superadmin/assign-position', payload);
      setUsers(users.map(u => u._id === userId ? { ...u, ...payload } : u));
    } catch (err) { alert("Update failed"); }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans">

      {/* 1. TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
              <UserCog size={18} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-800">Directory</span>
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-slate-900">User Records & Department Assignment</h1>
          <Link to="/super-dashboard" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Department / Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdate(user._id, 'role', e.target.value)}
                      className="bg-gray-50 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Student">Student</option>
                      <option value="Admin">Admin</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'Admin' ? (
                      <span className="text-sm font-bold text-slate-400 italic bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 block text-center">Global Admin (N/A)</span>
                    ) : user.role === 'Staff' ? (
                      <select
                        value={user.staffCategory || ""}
                        onChange={(e) => handleUpdate(user._id, 'staffCategory', e.target.value)}
                        className="bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 rounded-lg text-sm p-2 w-full focus:ring-2 focus:ring-indigo-500 transition-colors"
                      >
                        <option value="" disabled>Select Tech Trade</option>
                        {staffCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <select
                        value={user.department || ""}
                        onChange={(e) => handleUpdate(user._id, 'department', e.target.value)}
                        className="bg-gray-50 border-none rounded-lg text-sm p-2 w-full focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        <option value="" disabled>Select Dept</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default UserManagement;