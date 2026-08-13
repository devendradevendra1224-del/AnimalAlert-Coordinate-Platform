import React, { useState, useEffect } from 'react';
import { Shelter } from '../types';
import { fetchShelters, createShelter } from '../services/shelterService';
import { Building2, Phone, MapPin, Plus, CheckCircle2 } from 'lucide-react';

export const SheltersView: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState(50);

  useEffect(() => {
    loadShelters();
  }, []);

  const loadShelters = async () => {
    const data = await fetchShelters();
    setShelters(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createShelter({
      name,
      address,
      phone,
      capacity,
      current_occupancy: 0,
      latitude: 37.7749,
      longitude: -122.4194,
    });
    setName('');
    setAddress('');
    setPhone('');
    setShowAddModal(false);
    await loadShelters();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-200 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4" />
            <span>Shelter & Foster Network Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Shelter & Foster Capacity Tracker
          </h1>
          <p className="text-sm text-teal-100 mt-1 font-medium">
            Monitor open kennels, foster placement capacity, and shelter dispatch.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-white text-teal-950 font-extrabold text-xs rounded-xl shadow-md hover:bg-teal-50 transition-all flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW SHELTER</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((s) => {
          const occupancyPct = Math.round((s.current_occupancy / s.capacity) * 100);
          return (
            <div key={s.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900">{s.name}</h3>
                <span className="text-xs font-mono font-bold bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full">
                  {s.current_occupancy} / {s.capacity} Occupied
                </span>
              </div>

              <p className="text-xs text-slate-600 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{s.address}</span>
              </p>

              {/* CAPACITY PROGRESS BAR */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-slate-500">Kennel Capacity Usage</span>
                  <span className={occupancyPct > 90 ? 'text-rose-600' : 'text-teal-700'}>
                    {occupancyPct}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${occupancyPct}%` }}
                    className={`h-full transition-all ${
                      occupancyPct > 90 ? 'bg-rose-600' : 'bg-teal-600'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Phone: {s.phone}</span>
                <a
                  href={`tel:${s.phone}`}
                  className="px-3 py-1 bg-teal-50 text-teal-800 font-bold rounded-lg hover:bg-teal-100"
                >
                  Contact Shelter
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
