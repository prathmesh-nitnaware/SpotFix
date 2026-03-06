import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, AlertCircle, CheckCircle2, Clock, MapPin,
    ChevronRight, Camera, UploadCloud, MessageSquare, Flag, Loader2, Search
} from 'lucide-react';

const StaffDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [workload, setWorkload] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All'); // All, Urgent, In Progress
    const [expandedIssue, setExpandedIssue] = useState(null);

    // Form states for the action menu
    const [proofImage, setProofImage] = useState("");
    const [fieldNote, setFieldNote] = useState("");
    const [escalationNote, setEscalationNote] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchWorkload();
        // eslint-disable-next-line
    }, []);

    const fetchWorkload = async () => {
        try {
            const res = await API.get('/staff/my-workload');
            setWorkload(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (issueId, payload, actionName) => {
        setActionLoading(issueId + actionName);
        try {
            const res = await API.put('/staff/update-progress', { issueId, ...payload });
            // Remove issue from list if it's completed or escalated since it's no longer 'active workload'
            if (payload.status === 'Completed' || payload.escalationFlag) {
                setWorkload(prev => prev.filter(i => i._id !== issueId));
                setExpandedIssue(null);
            } else {
                setWorkload(prev => prev.map(i => i._id === issueId ? res.data : i));
            }
            // reset form state
            setProofImage("");
            setFieldNote("");
            setEscalationNote("");
        } catch (err) {
            alert("Failed to update issue.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("Image file must be under 5MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // KPIs
    const assignedCount = workload.filter(i => i.status !== 'Completed' && i.status !== 'Resolved').length;
    const urgentCount = workload.filter(i => i.priority === 'High' || i.priority === 'Critical').length;
    const resolvedThisWeek = workload.filter(i => i.status === 'Completed' || i.status === 'Resolved').length; // Ideally fetched from a specific stat endpoint

    const filteredWorkload = workload.filter(i => {
        if (activeFilter === 'Urgent') return i.priority === 'High' || i.priority === 'Critical';
        if (activeFilter === 'In Progress') return i.status === 'Processing' || i.status === 'Working' || i.status === 'In Progress';
        return true; // All
    });

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans">

            {/* 1. TOP NAVIGATION BAR */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 font-black bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md">
                            {user?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <h1 className="font-black text-slate-800 leading-tight">{user?.name || 'Staff Member'}</h1>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{user?.department || 'Operations'} Tech</p>
                        </div>
                    </div>
                </div>



                <div className="flex items-center gap-6 relative">
                    <button onClick={logout} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors px-4 py-2 rounded-full">Secure Logout</button>
                </div>
            </nav>

            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">

                {/* 3. PRIORITY ALERT BANNER */}
                {urgentCount > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm mb-6">
                        <AlertCircle size={24} className="animate-pulse flex-shrink-0 text-red-500" />
                        <p className="font-bold text-sm">⚠️ <span className="font-black">{urgentCount} urgent issues</span> in your queue require immediate attention.</p>
                    </div>
                )}

                <div className="space-y-8">
                    {/* 2. STATS ROW */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-1 text-slate-500">
                                <ClipboardList size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Queue</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800">{assignedCount}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-red-50 rounded-bl-full"></div>
                            <div className="flex items-center gap-2 mb-1 text-red-500">
                                <AlertCircle size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Urgent</span>
                            </div>
                            <h3 className="text-3xl font-black text-red-600 relative z-10">{urgentCount}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-1 text-emerald-500">
                                <CheckCircle2 size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Done (7d)</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800">{resolvedThisWeek}</h3>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-1 text-purple-500">
                                <Clock size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Avg Fix</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800">2.1<span className="text-sm text-slate-400">h</span></h3>
                        </div>
                    </div>

                    {/* 4. MY WORK QUEUE */}
                    <div>
                        {/* Filters */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 hide-scrollbar">
                            {['All', 'Urgent', 'In Progress'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${activeFilter === filter ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {filteredWorkload.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 border-dashed">
                                    <CheckCircle2 size={32} className="mx-auto text-emerald-300 mb-2" />
                                    <p className="text-sm font-bold text-slate-500">Queue is empty. Great job!</p>
                                </div>
                            ) : filteredWorkload.map(issue => (
                                <div key={issue._id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                                    {/* Card Header (Always visible) */}
                                    <div
                                        className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => setExpandedIssue(expandedIssue === issue._id ? null : issue._id)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] font-bold text-slate-400">#{issue._id.slice(-4).toUpperCase()}</span>
                                            {issue.priority === 'High' || issue.priority === 'Critical' ? (
                                                <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">Priority</span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">Normal</span>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-slate-900 leading-tight mb-3 pr-4">{issue.title}</h3>

                                        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-600">
                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"><MapPin size={12} className="text-blue-500" /> {issue.location?.building}</span>
                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"><Clock size={12} className="text-amber-500" /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        {issue.status === 'Pending' && <span className="mt-3 inline-block text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Pending Acknowledgment</span>}
                                    </div>

                                    {/* Expanded Action Area */}
                                    <AnimatePresence>
                                        {expandedIssue === issue._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-slate-100 bg-slate-50"
                                            >
                                                <div className="p-5 space-y-4">
                                                    {/* Student Description */}
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reporter Details</p>
                                                        <p className="text-sm font-medium text-slate-700 leading-relaxed bg-white p-3 rounded-xl shadow-inner border border-slate-100">
                                                            "{issue.description}"
                                                        </p>
                                                        {issue.imageUrl && (
                                                            <img src={issue.imageUrl} alt="Issue" className="mt-2 rounded-xl h-24 object-cover border border-slate-200" />
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="pt-2 grid grid-cols-1 gap-2">

                                                        {/* 1. Start Working */}
                                                        {(issue.status === 'Pending' || (!issue.status.includes('Progress') && issue.status !== 'Working' && issue.status !== 'Processing')) && (
                                                            <button
                                                                onClick={() => handleUpdate(issue._id, { status: 'In Progress' }, 'start')}
                                                                disabled={actionLoading}
                                                                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
                                                            >
                                                                {actionLoading === issue._id + 'start' ? <Loader2 size={18} className="animate-spin" /> : '▶️ Start Working'}
                                                            </button>
                                                        )}

                                                        {/* 2. Upload Proof & Mark Resolved */}
                                                        {(issue.status === 'In Progress' || issue.status === 'Working' || issue.status === 'Processing') && (
                                                            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                                                                <p className="text-xs font-bold text-slate-800">Complete Task</p>

                                                                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors group">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleImageUpload}
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                    />
                                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                                        {proofImage ? (
                                                                            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                                                                                <img src={proofImage} alt="Fix Proof" className="w-full h-full object-cover" />
                                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <span className="text-white text-xs font-bold flex items-center gap-1"><UploadCloud size={14} /> Change Photo</span>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <div className="p-3 bg-indigo-50 text-indigo-500 rounded-full mb-1">
                                                                                    <Camera size={24} />
                                                                                </div>
                                                                                <p className="text-xs font-bold text-slate-600">Upload Photo Proof</p>
                                                                                <p className="text-[10px] text-slate-400">Tap to take photo or upload (Max 5MB)</p>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <textarea
                                                                    placeholder="Field notes (e.g. 'Replaced fuse 3B. Monitor for 48h')"
                                                                    className="w-full text-xs p-2.5 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:border-emerald-500 transition-colors resize-none h-16"
                                                                    value={fieldNote}
                                                                    onChange={(e) => setFieldNote(e.target.value)}
                                                                />

                                                                <button
                                                                    onClick={() => {
                                                                        if (!proofImage && !window.confirm("Resolve without photo proof?")) return;
                                                                        handleUpdate(issue._id, { status: 'Completed', proofImage, staffNote: fieldNote }, 'complete');
                                                                    }}
                                                                    disabled={actionLoading === issue._id + 'complete'}
                                                                    className="w-full flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-200"
                                                                >
                                                                    {actionLoading === issue._id + 'complete' ? <Loader2 size={18} className="animate-spin" /> : '✅ Mark Completed'}
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* 3. Escalate */}
                                                        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 mt-2">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Reason for escalation..."
                                                                    className="w-full text-xs p-2.5 bg-white rounded-lg outline-none border border-red-200 focus:border-red-400 transition-colors"
                                                                    value={escalationNote}
                                                                    onChange={(e) => setEscalationNote(e.target.value)}
                                                                />
                                                                <button
                                                                    onClick={() => handleUpdate(issue._id, { escalationFlag: true, escalationNote }, 'escalate')}
                                                                    disabled={actionLoading || !escalationNote}
                                                                    className="flex-shrink-0 flex justify-center items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold px-4 py-2.5 rounded-lg transition-all"
                                                                >
                                                                    {actionLoading === issue._id + 'escalate' ? <Loader2 size={18} className="animate-spin" /> : <><Flag size={14} /> Escalate</>}
                                                                </button>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
