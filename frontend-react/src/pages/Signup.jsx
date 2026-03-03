import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Building, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student', // Default role based on requirements
    department: ''
  });
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/signup', formData);
      login(res.data.user, res.data.token);
      navigate(formData.role === 'Admin' ? '/admin' : '/dashboard');
    } catch (err) {
      alert("Registration failed. Use your VIT email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900">Join SpotFix</h2>
            <p className="text-slate-500 text-sm mt-1">Create your Architect profile to start reporting.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Role Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              {['Student', 'Admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    formData.role === role ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Name */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" 
                  placeholder="name@vit.edu.in" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <div className="relative">
                <Building className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Department (e.g. CMPN)" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Create Password" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
            >
              Get Started <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account? <Link to="/" className="text-blue-600 font-bold hover:underline">Login here</Link>
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-8 text-slate-400">
          <Shield size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Architects Security Protocol</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;