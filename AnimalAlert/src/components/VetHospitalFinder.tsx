import React, { useState, useEffect } from 'react';
import { VetHospital } from '../types';
import { fetchNearbyVetHospitals } from '../services/vetHospitalService';
import { HeartPulse, Phone, MapPin, Navigation, Clock, Search } from 'lucide-react';

export const VetHospitalFinder: React.FC = () => {
  const [hospitals, setHospitals] = useState<VetHospital[]>([]);
  const [filter24h, setFilter24h] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    const data = await fetchNearbyVetHospitals(37.7749, -122.4194);
    setHospitals(data);
  };

  const filtered = hospitals.filter((h) => {
    if (filter24h && !h.is_24h) return false;
    if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-200 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <HeartPulse className="w-4 h-4" />
          <span>Emergency Veterinary Hospital Finder</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          24/7 Veterinary Emergency Clinics
        </h1>
        <p className="text-sm text-amber-100 mt-1 font-medium">
          Instant navigation, direct emergency phone dialing, and real-time distance sorting.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clinic name or address..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          onClick={() => setFilter24h(!filter24h)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            filter24h
              ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          {filter24h ? '✓ 24/7 ER Hospitals Only' : 'Show All Clinics'}
        </button>
      </div>

      {/* CLINIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((h) => (
          <div
            key={h.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-amber-300 transition-colors space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-slate-900">{h.name}</span>
                {h.is_24h && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 uppercase font-mono">
                    24/7 EMERGENCY
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 flex items-center space-x-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{h.address}</span>
              </p>

              <div className="flex items-center space-x-3 text-xs font-mono text-slate-500 pt-1">
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                  {h.distance_km} km away
                </span>
                <span>{h.phone}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
              <a
                href={`tel:${h.phone}`}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>CALL CLINIC</span>
              </a>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(h.name + ' ' + h.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
              >
                <Navigation className="w-4 h-4" />
                <span>NAVIGATE GPS</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
