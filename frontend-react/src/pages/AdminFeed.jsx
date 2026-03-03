import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, MapPin } from 'lucide-react';

const AdminFeed = () => {
  const [issues, setIssues] = useState([
    { id: 1, title: 'Projector Sparking', location: 'M-Block, Floor 4, 402', priority: 'High', time: '2m ago' },
    { id: 2, title: 'Water Leak', location: 'Main Block, Floor 1, Washroom', priority: 'Medium', time: '15m ago' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Admin Feed</h1>
          <p className="text-gray-500">Sorted by AI Urgency</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold">3 Urgent</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {issues.map(issue => (
          <div key={issue.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              issue.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'
            }`}>
              <AlertCircle size={24} />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">{issue.title}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1"><MapPin size={14}/> {issue.location}</span>
                <span className="flex items-center gap-1"><Clock size={14}/> {issue.time}</span>
              </div>
            </div>

            <button className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition">
              Dispatch Team
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeed;