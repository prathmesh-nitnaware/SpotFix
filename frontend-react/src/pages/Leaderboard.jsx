import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Trophy, Medal, Star, UserCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                // Using the admin users endpoint which returns them sorted by impactPoints
                const res = await API.get('/admin/users');
                const sortedUsers = res.data.sort((a, b) => b.impactPoints - a.impactPoints);
                setUsers(sortedUsers.slice(0, 10)); // Top 10 for the Hall of Fame
            } catch (err) {
                console.error("Leaderboard Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-400" size={24} />;
            case 1: return <Medal className="text-slate-400" size={24} />;
            case 2: return <Medal className="text-amber-600" size={24} />;
            default: return <span className="text-slate-500 font-bold px-2">{index + 1}</span>;
        }
    };

    const getLevelBorder = (points) => {
        if (points >= 500) return 'border-yellow-400 shadow-yellow-100';
        if (points >= 200) return 'border-slate-300 shadow-slate-100';
        if (points >= 100) return 'border-amber-600 shadow-amber-100';
        return 'border-blue-100 shadow-blue-50';
    };

    return (
        <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block bg-yellow-50 text-yellow-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-yellow-200 shadow-sm mb-4 flex items-center gap-2 justify-center mx-auto w-max"
                    >
                        <Star size={14} className="fill-yellow-500" /> Platform Gamification
                    </motion.div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Architects Hall of Fame</h1>
                    <p className="text-slate-500 font-medium mt-2">Top student contributors resolving campus issues.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p className="font-bold text-xs uppercase tracking-[0.2em]">Calculating Impact...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
                        <div className="space-y-4">
                            {users.map((user, index) => (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={user._id}
                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all hover:scale-[1.01] ${getLevelBorder(user.impactPoints)}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 flex justify-center">
                                            {getRankIcon(index)}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-100 p-2 rounded-full">
                                                <UserCircle className="text-slate-600" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">{user.name}</h3>
                                                <p className="text-xs text-slate-400 uppercase font-black tracking-wider flex items-center gap-1">
                                                    {user.department} • {user.role}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-blue-600">
                                            {user.impactPoints || 0}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            Impact Points
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {users.length === 0 && (
                                <div className="text-center p-8 text-slate-500 bg-slate-50 rounded-2xl">
                                    No users found. Start resolving issues to appear here!
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
