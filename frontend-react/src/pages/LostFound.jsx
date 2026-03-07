import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Search, Plus, MapPin, Package, Clock, Loader2, ArrowRight, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const LostFound = () => {
  const { user } = React.useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Lost',
    location: '',
    imageUrl: null
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, imageUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Log in to report items");
    if (!formData.imageUrl) return alert("Please upload an image of the item.");

    setIsSubmitting(true);
    try {
      const res = await API.post('/community/lost-found', formData);
      setItems([res.data, ...items]);
      setShowModal(false);
      setFormData({ title: '', type: 'Lost', location: '', imageUrl: null });
    } catch (err) {
      alert("Failed to submit. " + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // Direct mapping to your Lost & Found Service backend
        const res = await API.get('/community/lost-found');
        setItems(res.data);
      } catch (err) {
        console.error("Community Feed Error:", err);
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

          <button
            onClick={() => setShowModal(true)}
            className="relative z-10 bg-slate-900 hover:bg-black text-white px-8 py-4 w-full md:w-auto rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-2 font-bold transition-all group"
          >
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

        {/* Modal for adding Lost/Found Items */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Package className="text-orange-500" /> Report Item
                  </h2>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto w-full custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Item Type Toggle */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                      {['Lost', 'Found'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: t })}
                          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formData.type === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                          I {t} something
                        </button>
                      ))}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Item Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Titan Watch, Blue Water Bottle"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all"
                        required
                      />
                    </div>

                    {/* Location (Only if Found) */}
                    {formData.type === 'Found' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Location Found</label>
                        <input
                          type="text"
                          placeholder="e.g. Library 2nd Floor, Room 402"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-medium transition-all"
                          required={formData.type === 'Found'}
                        />
                      </motion.div>
                    )}

                    {/* Image Upload */}
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Photo Evidence</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-[2rem] p-8 flex flex-col items-center justify-center bg-slate-50 relative group hover:border-orange-400 transition-colors">
                        {!formData.imageUrl ? (
                          <>
                            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <ImageIcon size={28} />
                            </div>
                            <p className="font-bold text-slate-700">Tap to upload a photo</p>
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                          </>
                        ) : (
                          <div className="relative w-full">
                            <img src={formData.imageUrl} className="w-full h-48 object-cover rounded-2xl border border-slate-200 shadow-sm" alt="Preview" />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, imageUrl: null })}
                              className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-md"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                      {isSubmitting ? 'Publishing...' : 'Publish to Community feed'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                          <p className="text-slate-500 text-xs font-bold bg-slate-50 p-2 rounded-lg break-words">
                            Reported by: <span className="text-slate-800">{item.reporter?.name || 'Unknown User'}</span>
                            {item.reporter?.department && <span className="text-orange-500 ml-1">({item.reporter.department})</span>}
                          </p>
                          {item.location && (
                            <p className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide px-2 pt-2">
                              <MapPin size={14} className="text-orange-500" /> {item.location}
                            </p>
                          )}
                          <p className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest px-2 pb-2">
                            <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
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