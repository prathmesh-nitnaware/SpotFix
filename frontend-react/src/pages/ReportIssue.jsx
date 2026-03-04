import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Camera, MapPin, Send, X, ChevronRight, Info, Building, Map, Lightbulb, Droplets, Grid, MonitorSmartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';

const CAT_ICONS = {
  'Electrical': <Lightbulb size={24} />,
  'Plumbing': <Droplets size={24} />,
  'Furniture': <Grid size={24} />,
  'IT Support': <MonitorSmartphone size={24} />,
  'Cleaning': <Info size={24} /> // fallback icon
};

const ReportIssue = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electrical',
    description: '',
    location: { building: '', floor: '', room: '' }
  });

  const categories = ['Electrical', 'Plumbing', 'Furniture', 'IT Support', 'Cleaning'];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to report an issue.");
    setIsSubmitting(true);

    try {
      const res = await API.post('/issues/report', {
        ...formData,
        reporterId: user.id,
        imageUrl: image
      });

      console.log("SpotFix Engine Response:", res.data);
      if (res.data.duplicate) {
        alert("Duplicate detected: A similar issue was already reported here! Your upvote has been added instead.");
      } else {
        alert("Report captured! AI has classified priority and notified the maintenance team.");
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to submit report. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto">

        {/* Header section with stepper indicator */}
        <div className="mb-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Report an Issue
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 font-medium mt-2"
          >
            Help us maintain a world-class campus.
          </motion.p>

          <div className="flex justify-center items-center mt-8 gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' :
                    step > s ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'
                  }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-1 rounded-full ${step > s ? 'bg-blue-100' : 'bg-slate-200'}`}></div>}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          layout
          className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: CATEGORY & TITLE */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Grid className="text-blue-500" /> Select Category
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 ${formData.category === cat
                              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                          <div className={formData.category === cat ? 'text-blue-600' : 'text-slate-400'}>
                            {CAT_ICONS[cat] || <Info size={24} />}
                          </div>
                          <span className="font-bold text-sm">{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Give it a Title</h2>
                    <input
                      type="text"
                      placeholder="e.g. Blinking Tube Light in Room 402"
                      value={formData.title}
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-lg placeholder-slate-400 hover:border-slate-300"
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={!formData.title.trim()}
                      onClick={() => setStep(2)}
                      className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Step <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: LOCATION & DESCRIPTION */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <MapPin className="text-blue-500" /> Where is it located?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                          value={formData.location.building}
                          className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-all font-medium appearance-none"
                          onChange={(e) => setFormData({ ...formData, location: { ...formData.location, building: e.target.value } })}
                        >
                          <option value="">Block / Building</option>
                          <option value="Main Block">Main Block</option>
                          <option value="M-Block">M-Block</option>
                          <option value="Hostel A">Hostel A</option>
                          <option value="Hostel B">Hostel B</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Floor (e.g. 2nd)"
                        value={formData.location.floor}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-all font-medium"
                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location, floor: e.target.value } })}
                      />
                      <input
                        type="text"
                        placeholder="Room No (e.g. 204)"
                        value={formData.location.room}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-all font-medium"
                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location, room: e.target.value } })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800">Describe the issue</h2>
                    <textarea
                      rows="5"
                      value={formData.description}
                      placeholder="Please provide any details. Our AI will analyze this to determine the priority level..."
                      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white hover:border-slate-300 transition-all font-medium resize-none shadow-inner"
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!formData.location.building || !formData.description.trim()}
                      onClick={() => setStep(3)}
                      className="flex-1 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Step <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PHOTO EVIDENCE */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Camera className="text-blue-500" /> Photo Evidence
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Clear photos help our AI assess the problem faster.</p>

                    <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center bg-slate-50 transition-all relative overflow-hidden group">
                      {!image ? (
                        <div className="text-center z-10">
                          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm">
                            <Camera size={36} />
                          </div>
                          <p className="font-bold text-slate-700 text-lg">Tap to upload a photo</p>
                          <p className="text-xs text-slate-400 mt-2 uppercase font-bold tracking-widest">JPG, PNG up to 5MB</p>
                          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageUpload} />
                        </div>
                      ) : (
                        <div className="relative w-full z-10">
                          <img src={image} alt="Preview" className="w-full h-72 object-cover rounded-3xl shadow-md border border-slate-200" />
                          <button
                            type="button"
                            onClick={() => setImage(null)}
                            className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl flex items-start gap-4 border border-blue-100/50">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <Lightbulb className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Smart AI Analysis</h4>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium mt-1">
                        Upon submission, SpotFix AI will instantly analyze your description and photo to determine urgency and assign the right team.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all disabled:opacity-70 text-lg"
                    >
                      {isSubmitting ? 'Processing via AI...' : 'Submit to Architects'}
                      {!isSubmitting && <Send size={20} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportIssue;