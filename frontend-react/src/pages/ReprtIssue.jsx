import React, { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  Send, 
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';

const ReportIssue = () => {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
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
    // This will trigger the Secure Backend & ML Priority logic
    console.log("Submitting to SpotFix Engine:", formData);
    alert("Report sent! AI is classifying priority...");
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">New Report</h1>
        <p className="text-slate-500 font-medium">Step {step} of 3: Provide details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: CATEGORY & TITLE */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                    formData.category === cat ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Short title (e.g. Broken Fan)" 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <button type="button" onClick={() => setStep(2)} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold flex justify-center items-center gap-2">
              Next Step <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {/* STEP 2: LOCATION & DESCRIPTION */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                <MapPin size={18} /> <span>Location Details</span>
              </div>
              <select 
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
                onChange={(e) => setFormData({...formData, location: {...formData.location, building: e.target.value}})}
              >
                <option value="">Select Building</option>
                <option value="Main Block">Main Block</option>
                <option value="M-Block">M-Block</option>
              </select>
              <input 
                type="text" 
                placeholder="Room No (e.g. 402)" 
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
                onChange={(e) => setFormData({...formData, location: {...formData.location, room: e.target.value}})}
              />
            </div>
            <textarea 
              rows="4" 
              placeholder="Describe the issue... (ML will use this to set priority)" 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-100 p-4 rounded-2xl font-bold">Back</button>
              <button type="button" onClick={() => setStep(3)} className="flex-[2] bg-slate-900 text-white p-4 rounded-2xl font-bold flex justify-center items-center gap-2">Next Step</button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PHOTO EVIDENCE */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center bg-white">
              {!image ? (
                <>
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Camera size={32} />
                  </div>
                  <p className="font-bold text-slate-700">Add Photo Evidence</p>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Optional but helpful</p>
                  <input type="file" className="hidden" id="photo-upload" accept="image/*" onChange={handleImageUpload} />
                  <label htmlFor="photo-upload" className="mt-6 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">Choose File</label>
                </>
              ) : (
                <div className="relative w-full">
                  <img src={image} alt="Preview" className="w-full h-64 object-cover rounded-3xl" />
                  <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"><X size={18}/></button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
              <Info className="text-blue-600 mt-1" size={18} />
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                Our **Multi-modal ML** will scan your text and photo to verify the severity and notify the maintenance team immediately.
              </p>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
              Submit to Architects <Send size={20} />
            </button>
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default ReportIssue;