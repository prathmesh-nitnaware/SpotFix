import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Target, Zap, Trophy, MessageSquare, 
  CheckCircle2, ArrowRight, Users, BarChart, 
  Menu, X, ArrowUpRight, Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Target className="text-blue-500" size={24} />,
      title: "Smart Issue Reporting",
      description: "Report campus issues with photos, location, and priority levels in seconds."
    },
    {
      icon: <MessageSquare className="text-green-500" size={24} />,
      title: "Real-Time Tracking",
      description: "Track your reports from submission to resolution with live status updates."
    },
    {
      icon: <Trophy className="text-yellow-500" size={24} />,
      title: "Earn Impact Points",
      description: "Level up your campus citizenship by reporting issues and helping others."
    },
    {
      icon: <BarChart className="text-purple-500" size={24} />,
      title: "Analytics Dashboard",
      description: "Comprehensive insights for administrators to optimize maintenance operations."
    },
    {
      icon: <Users className="text-indigo-500" size={24} />,
      title: "Role-Based Access",
      description: "Tailored experiences for students, staff, and administrators."
    },
    {
      icon: <MessageSquare className="text-orange-500" size={24} />,
      title: "Community Engagement",
      description: "Vote on issues, comment, and collaborate with the campus community."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Target size={18} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-800">SpotFix</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Features</a>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold">Sign In</Link>
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-blue-200">
              Get Started
            </Link>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-200"
            >
              <div className="px-6 py-4 space-y-4">
                <a href="#features" className="block text-slate-600 hover:text-blue-600 font-medium">Features</a>
                <Link to="/login" className="block text-blue-600 hover:text-blue-700 font-bold">Sign In</Link>
                <Link to="/signup" className="block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl text-center">
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles size={16} />
              Campus Maintenance, Reimagined
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
              Transform Your Campus
              <span className="text-blue-600"> Together</span>
            </h1>
            
            <p className="text-xl text-slate-600 font-medium mb-8 max-w-2xl mx-auto">
              Report issues, track progress, and earn rewards while making your campus better. 
              Join thousands of students creating positive change.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                to="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
              >
                Start Reporting <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Sign In <ArrowUpRight size={20} />
              </Link>
            </div>

            <div className="flex justify-center gap-8 text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-500" />
                <span className="font-medium">No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-500" />
                <span className="font-medium">Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-yellow-500" />
                <span className="font-medium">Quick Setup</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Everything You Need for
              <span className="text-blue-600"> Campus Excellence</span>
            </h2>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
              Powerful features designed to streamline maintenance and boost community engagement
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-medium">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-black mb-4">
              Ready to Transform Your Campus?
            </h2>
            <p className="text-xl font-medium mb-8 opacity-90">
              Join thousands of students making a difference, one issue at a time.
            </p>
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 hover:bg-slate-50 font-bold px-8 py-4 rounded-xl transition-all shadow-xl inline-flex items-center gap-2 group"
            >
              Get Started Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target size={18} className="text-white" />
                </div>
                <span className="font-black text-xl tracking-tight">SpotFix</span>
              </div>
              <p className="text-slate-400 font-medium">
                Campus Maintenance, Reimagined.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 font-medium">
            <p>© 2024 SpotFix. Built by The Architects. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;