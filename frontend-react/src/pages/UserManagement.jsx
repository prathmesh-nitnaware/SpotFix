import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { UserCog, Building2, Shield } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const departments = ['Computer', 'Electrical', 'Office', 'Hostel', 'Canteen'];

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
      const payload = {
        userId,
        department: field === 'department' ? value : userToUpdate.department,
        role: field === 'role' ? value : userToUpdate.role
      };
      await API.put('/superadmin/assign-position', payload);
      setUsers(users.map(u => u._id === userId ? { ...u, [field]: value } : u));
    } catch (err) { alert("Update failed"); }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen ml-64">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <UserCog className="text-blue-600" /> User Records & Department Assignment
      </h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Current Role</th>
              <th className="px-6 py-4">Department</th>
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
                  <select
                    value={user.department}
                    onChange={(e) => handleUpdate(user._id, 'department', e.target.value)}
                    className="bg-gray-50 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default UserManagement;