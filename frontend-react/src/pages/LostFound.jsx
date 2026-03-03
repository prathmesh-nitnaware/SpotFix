import React, { useState } from 'react';
import { Search, Plus, MapPin, Package, Clock, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const LostFound = () => {
  const [activeTab, setActiveTab] = useState('All');

  // Mock data representing the community service module
  const items = [
    { id: 1, title: 'Black Wallet', location: 'Canteen', time: '1h ago', type: 'Found', image: 'https://images.unsplash.com/photo-1627123430985-63df56a6bf21?w=400' },
    { id: 2, title: 'Scientific Calculator', location: 'Room 402', time: '3h ago', type: 'Lost', image: 'https://images.unsplash.com/photo-1574607383476-f517f220d1c0?w=400' },
    { id: 3, title: 'Keys with Blue Keychain', location: 'Main Block Entrance', time: '5h ago', type: 'Found', image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Lost & Found</h1>
          <p className="text-slate-500 font-medium">Helping the VIT community stay connected.</p>
        </div>
        <button className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 font-bold hover:scale-105 transition-transform">
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
              activeTab === tab ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-slate-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.filter(i => activeTab === 'All' || i.type === activeTab).map((item) => (
          <motion.div 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={item.id} 
            className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group"
          >
            <div className="relative h-48">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                item.type === 'Found' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {item.type}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-800">{item.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {item.location}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {item.time}</span>
                </div>
              </div>
              
              <button className="w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-bold text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                Contact Finder
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LostFound;