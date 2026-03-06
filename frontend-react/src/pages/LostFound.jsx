import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Search, Plus, MapPin, Package, Clock, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LostFound = () => {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // Direct mapping to your Lost & Found Service backend
        const res = await API.get('/community/lost-found');
        setItems(res.data);
      } catch (err) {
        console.error("Community Feed Error:", err);
        // Mock data fallback if DB isn't seeded yet
        setItems([
          { _id: 1, title: 'Black Dell Laptop Charger', type: 'Lost', location: 'Library 2nd Floor', createdAt: '2 hours ago', imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60' },
          { _id: 2, title: 'Blue Water Bottle', type: 'Found', location: 'M-Block Room 104', createdAt: '5 mins ago', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60' },
          { _id: 3, title: 'Titan Watch', type: 'Lost', location: 'Cafeteria', createdAt: '1 day ago', imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=60' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="bg-[#F8FAFC] min-h-screen px-4 md:px-8 py-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Package className="text-orange-500" size={36} /> Lost & Found
            </h1>
            <p className="text-slate-500 font-medium mt-2 max-w-lg">
              Did you lose something important or find something that belongs to a fellow Architect? Let's reunite items with their owners.
            </p>
          </div>

          <button className="relative z-10 bg-slate-900 hover:bg-black text-white px-8 py-4 w-full md:w-auto rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-2 font-bold transition-all group">
            <Plus size={20} className="group-hover:scale-125 transition-transform" />
            <span>Report Item</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar bg-white p-2 rounded-2xl border border-slate-200 shadow-sm inline-flex">
            {['All', 'Lost', 'Found'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab
                  ? tab === 'Lost' ? 'bg-red-500 text-white shadow-md shadow-red-200'
                    : tab === 'Found' ? 'bg-green-500 text-white shadow-md shadow-green-200'
                      : 'bg-slate-900 text-white shadow-md'
                  : 'bg-transparent text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {tab} Items
              </button>
            ))}
          </div>


        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-[3rem] border border-slate-200 border-dashed">
            <Loader2 className="animate-spin mb-4 text-orange-500" size={48} />
            <p className="font-black uppercase tracking-widest text-sm">Syncing with Campus Records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {items
                .filter(i => activeTab === 'All' || i.type === activeTab)
                .map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item._id}
                    className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex justify-center items-center text-slate-300">
                          <Package size={64} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${item.type === 'Found' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        {item.type}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="text-lg font-black text-slate-800 leading-tight line-clamp-2 mb-4 group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </h3>
                        <div className="space-y-2">
                          <p className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide bg-slate-50 p-2 rounded-lg">
                            <MapPin size={14} className="text-orange-500" /> {item.location}
                          </p>
                          <p className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 pb-2">
                            <Clock size={12} /> Reported {item.createdAt}
                          </p>
                        </div>
                      </div>

                      <button className="mt-6 w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-[0.1em] hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:shadow-lg hover:shadow-orange-200 transition-all flex justify-center items-center gap-2">
                        Contact Finder <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-200 border-dashed">
            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={48} />
            </div>
            <p className="text-slate-800 font-black text-xl mb-2">Nothing to see here</p>
            <p className="text-slate-500 font-medium">No items currently match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LostFound;