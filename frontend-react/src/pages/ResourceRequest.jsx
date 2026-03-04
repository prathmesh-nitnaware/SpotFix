import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { PackagePlus, MapPin, ClipboardList, Send, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const ResourceRequest = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    resourceType: '',
    quantity: 1,
    urgency: 'Normal',
    location: { building: '', floor: '', room: '' },
    notes: '',
    requestedBy: user?.id // Maps directly to User History
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Direct call to your Secure Backend
      await API.post('/resources/request', formData);
      alert("Resource request logged in the system.");
    } catch (err) {
      console.error("Backend Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <PackagePlus className="text-blue-600" size={32} />
          Resource Tracking
        </h1>
        <p className="text-slate-500 font-medium">Request campus needs instead of reporting faults.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          
          {/* Resource Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">What is needed?</label>
              <input 
                name="resourceType"
                placeholder="e.g. Extra Chairs, Water Dispenser"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Quantity</label>
              <input 
                name="quantity"
                type="number"
                min="1"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Location Logic */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Delivery Location</label>
            <div className="grid grid-cols-3 gap-3">
              <select name="location.building" className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" onChange={handleInputChange}>
                <option value="">Building</option>
                <option value="Main Block">Main Block</option>
                <option value="M-Block">M-Block</option>
              </select>
              <input name="location.floor" placeholder="Floor" className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" onChange={handleInputChange} />
              <input name="location.room" placeholder="Room/Area" className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Additional Notes</label>
            <textarea 
              name="notes"
              placeholder="Provide context for the request..."
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px]"
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-3xl flex items-start gap-4">
          <Info className="text-blue-600 mt-1" size={20} />
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            This request will be sent to the **Admin Dashboard** for logistics planning. Successful delivery contributes to the campus **Impact Points** ecosystem.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-black text-white p-5 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Submit Resource Request"} <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ResourceRequest;