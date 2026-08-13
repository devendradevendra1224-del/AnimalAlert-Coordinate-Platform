import React, { useState, useEffect } from 'react';
import { RescueCase, VetHospital, Shelter, RescueOrganization, UserProfile } from '../types';
import { fetchRescueCases } from '../services/rescueService';
import { fetchNearbyVetHospitals } from '../services/vetHospitalService';
import { fetchShelters } from '../services/shelterService';
import { fetchOrganizations } from '../services/organizationService';
import { 
  MapPin, 
  ShieldAlert, 
  HeartPulse, 
  Building2, 
  HandHeart, 
  CheckCircle2, 
  Filter, 
  Eye, 
  Layers,
  Lock
} from 'lucide-react';

interface InteractiveRescueMapProps {
  currentUser: UserProfile;
  onViewCase: (caseId: string) => void;
}

export const InteractiveRescueMap: React.FC<InteractiveRescueMapProps> = ({
  currentUser,
  onViewCase,
}) => {
  const [cases, setCases] = useState<RescueCase[]>([]);
  const [vets, setVets] = useState<VetHospital[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [orgs, setOrgs] = useState<RescueOrganization[]>([]);
  const [selectedPin, setSelectedPin] = useState<{ type: string; item: any } | null>(null);

  const [filterLayer, setFilterLayer] = useState<'all' | 'cases' | 'vets' | 'shelters' | 'orgs'>('all');

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    const caseData = await fetchRescueCases();
    const vetData = await fetchNearbyVetHospitals();
    const shelterData = await fetchShelters();
    const orgData = await fetchOrganizations();

    setCases(caseData);
    setVets(vetData);
    setShelters(shelterData);
    setOrgs(orgData);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* HEADER & FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Live Animal Rescue Radar</h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time map layer with smart escalation priority & privacy protection
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterLayer('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterLayer === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setFilterLayer('cases')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterLayer === 'cases' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Rescues ({cases.length})
          </button>
          <button
            onClick={() => setFilterLayer('vets')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterLayer === 'vets' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            24/7 Vets ({vets.length})
          </button>
          <button
            onClick={() => setFilterLayer('shelters')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterLayer === 'shelters' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Shelters ({shelters.length})
          </button>
        </div>
      </div>

      {/* PRIVACY NOTICE */}
      <div className="p-3 bg-sky-50 border border-sky-200 text-sky-900 rounded-xl text-xs flex items-center justify-between font-medium">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <strong>Location Privacy Active:</strong> Volunteer and Rescuer position pins utilize generalized approximate coordinates to prevent harassment.
          </span>
        </div>
        <span className="font-mono text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded font-bold">
          PRIVACY PROTECTED
        </span>
      </div>

      {/* CANVAS / MAP CONTAINER (EMBEDDED RADAR INTERACTIVE GRID) */}
      <div className="relative w-full h-[520px] bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {/* MAP BACKGROUND IMAGE PATTERN */}
        <div 
          className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"
        />

        {/* RADAR SWEEP VISUAL EFFECT */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-sky-500/20 pointer-events-none animate-ping-slow" />

        {/* MAP PINS RENDERING */}
        {(filterLayer === 'all' || filterLayer === 'cases') &&
          cases.map((c, i) => {
            // Calculate map offsets for demo positioning
            const leftPct = 25 + ((c.longitude + 122.42) * 800) % 65;
            const topPct = 20 + ((37.78 - c.latitude) * 800) % 60;
            const isCritical = c.priority === 'CRITICAL';

            return (
              <div
                key={c.id}
                onClick={() => setSelectedPin({ type: 'case', item: c })}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group z-20"
              >
                <div className={`relative flex items-center justify-center p-2 rounded-full transition-transform group-hover:scale-125 ${
                  isCritical
                    ? 'bg-rose-600 text-white animate-bounce ring-4 ring-rose-500/40 shadow-lg shadow-rose-600/50'
                    : 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-950 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.animal_type} ({c.priority})
                </div>
              </div>
            );
          })}

        {(filterLayer === 'all' || filterLayer === 'vets') &&
          vets.map((v) => {
            const leftPct = 15 + ((v.longitude + 122.42) * 750) % 70;
            const topPct = 15 + ((37.78 - v.latitude) * 750) % 70;

            return (
              <div
                key={v.id}
                onClick={() => setSelectedPin({ type: 'vet', item: v })}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group z-10"
              >
                <div className="p-2 bg-amber-400 text-slate-950 rounded-full shadow-md hover:scale-125 transition-transform">
                  <HeartPulse className="w-4 h-4" />
                </div>
              </div>
            );
          })}

        {(filterLayer === 'all' || filterLayer === 'shelters') &&
          shelters.map((s) => {
            const leftPct = 30 + ((s.longitude + 122.42) * 700) % 60;
            const topPct = 35 + ((37.78 - s.latitude) * 700) % 55;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedPin({ type: 'shelter', item: s })}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 group z-10"
              >
                <div className="p-2 bg-teal-500 text-white rounded-full shadow-md hover:scale-125 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
            );
          })}

        {/* POPUP PREVIEW CARD WHEN PIN CLICKED */}
        {selectedPin && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 bg-slate-900/95 text-white p-5 rounded-2xl border border-slate-700 backdrop-blur-md shadow-2xl animate-fade-in z-30 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {selectedPin.type.toUpperCase()} PIN
              </span>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ CLOSE
              </button>
            </div>

            {selectedPin.type === 'case' && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-lg text-white">
                  {selectedPin.item.animal_type}
                </h4>
                <p className="text-xs text-slate-300">{selectedPin.item.description}</p>
                <p className="text-xs font-mono text-slate-400">Address: {selectedPin.item.address}</p>

                <button
                  onClick={() => onViewCase(selectedPin.item.id)}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>OPEN CASE DETAILS</span>
                </button>
              </div>
            )}

            {selectedPin.type === 'vet' && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-base text-amber-300">{selectedPin.item.name}</h4>
                <p className="text-xs text-slate-300">{selectedPin.item.address}</p>
                <p className="text-xs font-mono text-amber-400">Phone: {selectedPin.item.phone}</p>
              </div>
            )}

            {selectedPin.type === 'shelter' && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-base text-teal-300">{selectedPin.item.name}</h4>
                <p className="text-xs text-slate-300">{selectedPin.item.address}</p>
                <p className="text-xs font-mono text-teal-400">
                  Capacity: {selectedPin.item.current_occupancy}/{selectedPin.item.capacity}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
