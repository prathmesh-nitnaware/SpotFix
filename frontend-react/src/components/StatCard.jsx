import React from 'react';

/**
 * StatCard Component
 * Used by SuperAdmin and Admin dashboards to display key metrics.
 * * @param {string} title - The label for the metric (e.g., "Total Issues")
 * @param {number|string} value - The numerical data to display
 * @param {ReactNode} icon - A Lucide-react icon component
 * @param {string} trend - Optional trend text (e.g., "+12% this week")
 */
const StatCard = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md hover:border-blue-100 group">
      {/* Icon Container */}
      <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
        {React.cloneElement(icon, { 
          size: 24, 
          className: "text-blue-600 transition-transform group-hover:scale-110" 
        })}
      </div>

      {/* Text Content */}
      <div className="flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">
            {value || 0}
          </h3>
          {trend && (
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;