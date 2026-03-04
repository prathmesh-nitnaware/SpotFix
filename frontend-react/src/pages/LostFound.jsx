import React, { useState, useEffect } from 'react';
import API from '../api/axios'; // Your production axios instance
import { Search, Plus, MapPin, Package, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LostFound = () => {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  // 1. Production Data Fetch
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // Direct mapping to your Lost & Found Service backend
        const res = await API.get('/community/lost-found');
        setIssues(res.data);
      } catch (err) {
        console.error("Community Feed Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Lost & Found</h1>
          <p className="text-slate-500 font-medium tracking-tight">Community-driven campus support.</p>
        </div>
        <button className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-100 flex items-center gap-2 font-bold hover:scale-105 transition-all">
          <Plus size={20} /> <span className="hidden md:inline">Post Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Lost', 'Found'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items Grid with Production Logic */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-bold uppercase tracking-widest text-xs">Syncing with Campus Records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {items
              .filter(i => activeTab === 'All' || i.type === activeTab)
              .map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item._id} // Using real DB _id
                className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group"
              >
                <div className="relative h-56">
                  <img 
                    src={item.imageUrl} // Real image path from DB
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className={`absolute top-5 left-5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                    item.type === 'Found' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {item.type}
                  </div>
                </div>
                
                <div className="p-7 space-y-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight">{item.title}</h3>
                    <div className="flex items-center gap-4 mt-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500" /> {item.location}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {item.createdAt}</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-95">
                    Contact Finder
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
           <Package className="mx-auto text-slate-300 mb-4" size={48} />
           <p className="text-slate-400 font-bold italic">No items currently listed. A clean campus!</p>
        </div>
      )}
    </div>
  );
};

export default LostFound;