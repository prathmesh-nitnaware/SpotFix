import React from 'react';
import { Award, Zap, ShieldCheck } from 'lucide-react';

const CampusPassport = ({ user }) => {
  // Simple calculation for progress bar (assuming 1000 XP per level)
  const progress = (user.xp % 1000) / 10; 

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm uppercase tracking-widest opacity-80">Campus Passport</h3>
          <h2 className="text-3xl font-bold mt-1">{user.name}</h2>
          <p className="text-blue-200 mt-1">{user.department}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
          <ShieldCheck size={32} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-white/10 p-4 rounded-2xl text-center">
          <Zap className="mx-auto mb-1 text-yellow-400" />
          <span className="block text-2xl font-bold">{user.xp}</span>
          <span className="text-xs opacity-70">Total XP</span>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl text-center">
          <Award className="mx-auto mb-1 text-orange-400" />
          <span className="block text-2xl font-bold">{user.level}</span>
          <span className="text-xs opacity-70">Rank</span>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl text-center">
          <div className="mx-auto mb-1 font-bold text-xl text-green-400">#{user.impactPoints}</div>
          <span className="text-xs opacity-70">Impact</span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs mb-2">
          <span>Level Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-white h-full transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CampusPassport;