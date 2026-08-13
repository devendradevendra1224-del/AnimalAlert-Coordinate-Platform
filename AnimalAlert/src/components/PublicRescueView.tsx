import React from 'react';
import { RescueCase } from '../types';
import { ShieldCheck, MapPin, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface PublicRescueViewProps {
  rescueCase: RescueCase;
  onBack: () => void;
}

export const PublicRescueView: React.FC<PublicRescueViewProps> = ({ rescueCase, onBack }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO APP</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6">
        {/* PUBLIC HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-800">
              PUBLIC RESCUE STATUS
            </span>
            <span className="font-mono text-xs text-slate-400">
              CASE #{rescueCase.id}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {rescueCase.animal_type} Rescue Operation
          </h1>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-400 text-slate-950 uppercase">
              STATUS: {rescueCase.status.replace(/_/g, ' ')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-600 text-white uppercase">
              PRIORITY: {rescueCase.priority}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 sm:p-8 space-y-5">
          {rescueCase.photo_url && (
            <img
              src={rescueCase.photo_url}
              alt={rescueCase.animal_type}
              className="w-full h-64 object-cover rounded-2xl border border-slate-200"
            />
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase font-mono text-slate-400">Public Description</h3>
            <p className="text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {rescueCase.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-medium border-t border-slate-100 pt-4">
            <div>
              <span className="text-slate-400 block font-mono">General Vicinity</span>
              <strong className="text-slate-900">{rescueCase.address.split(',')[0]} (General Area)</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-mono">Reported Time</span>
              <strong className="text-slate-900">{new Date(rescueCase.created_at).toLocaleString()}</strong>
            </div>
          </div>

          <div className="p-4 bg-sky-50 border border-sky-200 text-sky-950 rounded-2xl text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Location Privacy Protection Active</span>
            </div>
            <p className="text-sky-800 text-[11px] leading-snug">
              To ensure animal safety and team privacy, exact street coordinates and personal contact details are restricted to verified responders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
