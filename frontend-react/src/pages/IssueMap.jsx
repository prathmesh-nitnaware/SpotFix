import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, AlertCircle, Droplets, Lightbulb, Grid, Package, ChevronLeft, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom HTML Markers using Tailwind classes
const createCustomMarker = (priority) => {
    const colorClass = priority === 'High' ? 'bg-red-500 shadow-red-500/50' :
        priority === 'Medium' ? 'bg-orange-500 shadow-orange-500/50' :
            'bg-blue-500 shadow-blue-500/50';

    return L.divIcon({
        className: 'custom-icon',
        html: `<div class="w-6 h-6 ${colorClass} rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce-slow">
             <div class="w-2 h-2 bg-white rounded-full"></div>
           </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

const IssueMap = () => {
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    // Default VIT Pune generalized coordinates
    const campusCenter = [18.4636, 73.8681];

    // Dummy coordinates for various campus buildings (since actual coordinates aren't provided)
    const DUMMY_LOCATIONS = {
        'Main Block': [18.4638, 73.8683],
        'M-Block': [18.4633, 73.8679],
        'Hostel A': [18.4642, 73.8675],
        'Hostel B': [18.4630, 73.8685],
        'Library': [18.4636, 73.8690],
        'Cafeteria': [18.4639, 73.8688]
    };

    useEffect(() => {
        const fetchActiveIssues = async () => {
            try {
                const res = await API.get('/admin/all-issues');
                // Filter out completed issues for the map
                const activeIssues = res.data.filter(i => i.status !== 'Completed');

                // Attach dummy coordinates since your DB only holds building string names
                const mappableIssues = activeIssues.map(issue => {
                    // Add some slight randomness so pins in the same building don't perfectly overlap
                    const baseLat = DUMMY_LOCATIONS[issue.location?.building] ? DUMMY_LOCATIONS[issue.location.building][0] : campusCenter[0];
                    const baseLng = DUMMY_LOCATIONS[issue.location?.building] ? DUMMY_LOCATIONS[issue.location.building][1] : campusCenter[1];
                    const randomOffsetLat = (Math.random() - 0.5) * 0.0003;
                    const randomOffsetLng = (Math.random() - 0.5) * 0.0003;

                    return {
                        ...issue,
                        position: [baseLat + randomOffsetLat, baseLng + randomOffsetLng]
                    }
                });

                setIssues(mappableIssues);
            } catch (err) {
                console.error("Map Data Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActiveIssues();
    }, []);

    return (
        <div className="bg-[#F8FAFC] min-h-screen p-4 md:p-8 font-sans flex flex-col h-screen">

            {/* Header */}
            <div className="bg-slate-900 rounded-[2rem] p-6 mb-6 text-white shadow-xl flex justify-between items-center z-10 relative">
                <div className="flex gap-4 items-center">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black flex items-center gap-3">
                            <Map className="text-blue-400" /> Campus Live Heatmap
                        </h1>
                        <p className="text-sm text-slate-400 font-medium">Real-time geographical tracking of active issues</p>
                    </div>
                </div>

                <div className="hidden md:flex gap-6 bg-white/10 p-3 px-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-xs font-bold text-slate-300">High Priority</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span className="text-xs font-bold text-slate-300">Medium</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-xs font-bold text-slate-300">Low/Standard</span></div>
                </div>
            </div>

            {/* Map Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 rounded-[2rem] overflow-hidden border-2 border-slate-200 shadow-xl relative z-0"
            >
                {!loading && (
                    <MapContainer center={campusCenter} zoom={18} className="w-full h-full">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">Carto</a>'
                        />

                        {issues.map(issue => (
                            <Marker
                                key={issue._id}
                                position={issue.position}
                                icon={createCustomMarker(issue.priority)}
                            >
                                <Popup className="custom-popup rounded-[2rem]">
                                    <div className="p-1 min-w-[200px]">
                                        <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest inline-block rounded-full mb-2 ${issue.priority === 'High' ? 'bg-red-100 text-red-600' :
                                            issue.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {issue.priority} Priority
                                        </div>

                                        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">{issue.title}</h3>

                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 space-y-1">
                                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><MapPin size={12} /> {issue.location?.building} • {issue.location?.room || 'General'}</p>
                                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Grid size={12} /> Category: {issue.category}</p>
                                        </div>

                                        <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{issue.status}</span>
                                            <span className="text-[10px] text-blue-600 font-bold uppercase bg-blue-50 px-2 py-1 rounded-md">{issue.upvotes?.length || 0} Upvotes</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </motion.div>
        </div>
    );
};

export default IssueMap;
