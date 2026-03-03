import React from 'react';
import { Building2, Layers, DoorOpen } from 'lucide-react';

const LocationPicker = ({ value, onChange }) => {
  const campusData = {
    "Main Block": ["Floor 1", "Floor 2", "Floor 3", "Floor 4"],
    "M-Block": ["Ground", "Floor 1", "Floor 2"],
    "Library": ["Reading Hall", "Stack Area"],
    "Canteen": ["Dining Area", "Kitchen"]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Building */}
      <div className="relative">
        <Building2 className="absolute left-3 top-3 text-gray-400" size={18} />
        <select 
          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500"
          value={value.building}
          onChange={(e) => onChange({...value, building: e.target.value})}
        >
          <option value="">Select Building</option>
          {Object.keys(campusData).map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Floor */}
      <div className="relative">
        <Layers className="absolute left-3 top-3 text-gray-400" size={18} />
        <select 
          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!value.building}
          value={value.floor}
          onChange={(e) => onChange({...value, floor: e.target.value})}
        >
          <option value="">Select Floor</option>
          {value.building && campusData[value.building].map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Room/Room No */}
      <div className="relative">
        <DoorOpen className="absolute left-3 top-3 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Room No (e.g. 402)"
          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          value={value.room}
          onChange={(e) => onChange({...value, room: e.target.value})}
        />
      </div>
    </div>
  );
};

export default LocationPicker;