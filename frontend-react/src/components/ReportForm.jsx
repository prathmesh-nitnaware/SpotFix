import React, { useState } from 'react';
import API from '../api/axios';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const ReportForm = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Electrical',
    location: { building: '', floor: '', room: '' }
  });
  const [duplicateId, setDuplicateId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/issues/report', { ...formData, reporterId: 'USER_ID_HERE' });
      
      if (res.data.duplicate) {
        setDuplicateId(res.data.issueId);
      } else {
        alert("Issue Reported! AI assigned priority: " + res.data.issue.priority);
      }
    } catch (err) { console.error(err); }
  };

  const handleUpvote = async () => {
    await API.post('/issues/upvote', { issueId: duplicateId, userId: 'USER_ID_HERE' });
    alert("You have upvoted this existing issue!");
    setDuplicateId(null);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">SpotFix: Report Issue</h2>
      
      {duplicateId ? (
        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 flex flex-col items-center">
          <AlertTriangle className="text-yellow-600 mb-2" />
          <p className="text-sm text-yellow-700 text-center">
            Someone already reported this! Join them to increase priority.
          </p>
          <button onClick={handleUpvote} className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded">
            Upvote Existing Issue
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full border p-2 rounded" placeholder="Issue Title" 
            onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <textarea className="w-full border p-2 rounded" placeholder="Describe the problem..." 
            onChange={(e) => setFormData({...formData, description: e.target.value})} />
          {/* Location fields... */}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Submit Report</button>
        </form>
      )}
    </div>
  );
};

export default ReportForm;