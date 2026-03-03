import React, { useState } from 'react';
import { MoreVertical, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const AdminBoard = () => {
  // Mock data for UI building
  const [issues, setIssues] = useState([
    { _id: '1', title: 'AC Leakage', room: 'Lab 101', priority: 'High', status: 'Pending' },
    { _id: '2', title: 'Projector Not Working', room: 'Room 302', priority: 'Medium', status: 'Processing' },
    { _id: '3', title: 'Broken Window', room: 'Canteen', priority: 'Low', status: 'Pending' },
  ]);

  const columns = ['Pending', 'Processing', 'Working', 'Completed'];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Command Center</h1>
        <div className="flex gap-4">
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">1 High Priority</span>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">12 Total Open</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map(col => (
          <div key={col} className="bg-gray-100 p-4 rounded-2xl min-h-[500px]">
            <h3 className="font-bold text-gray-600 mb-4 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${col === 'Pending' ? 'bg-red-500' : 'bg-blue-500'}`} />
              {col}
            </h3>
            
            <div className="space-y-4">
              {issues.filter(i => i.status === col).map(issue => (
                <div key={issue._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 transition cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      issue.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {issue.priority}
                    </span>
                    <MoreVertical size={14} className="text-gray-400" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm">{issue.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{issue.room}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBoard;