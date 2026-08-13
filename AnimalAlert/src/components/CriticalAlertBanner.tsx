import React from 'react';
import { RescueCase } from '../types';
import { AlertTriangle, ArrowRight, MapPin, Clock, ShieldAlert } from 'lucide-react';

interface CriticalAlertBannerProps {
  criticalCase: RescueCase | null;
  onViewCase: (caseId: string) => void;
  onHelpCase?: (caseId: string) => void;
}

export const CriticalAlertBanner: React.FC<CriticalAlertBannerProps> = ({
  criticalCase,
  onViewCase,
  onHelpCase,
}) => {
  if (!criticalCase || criticalCase.priority !== 'CRITICAL' || criticalCase.status === 'completed' || criticalCase.status === 'cancelled') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white shadow-lg border-b-2 border-rose-800 animate-pulse-subtle">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-sm uppercase font-mono bg-white text-rose-800 px-2 py-0.5 rounded-md shadow-xs">
                  🚨 CRITICAL ANIMAL RESCUE
                </span>
                <span className="text-xs bg-black/20 text-white px-2 py-0.5 rounded-full font-mono">
                  Escalation Level {criticalCase.escalation_level}
                </span>
              </div>
              <h4 className="text-base font-bold mt-1 leading-snug">
                {criticalCase.animal_type}: {criticalCase.description}
              </h4>
              <div className="flex items-center space-x-4 text-xs text-rose-100 font-medium mt-1 flex-wrap">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-200" />
                  <span>{criticalCase.address}</span>
                </span>
                <span className="flex items-center space-x-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-rose-200" />
                  <span>Reported {new Date(criticalCase.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/20">
            {onHelpCase && (
              <button
                onClick={() => onHelpCase(criticalCase.id)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1"
              >
                <span>HELP</span>
              </button>
            )}
            <button
              onClick={() => onViewCase(criticalCase.id)}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-rose-700 font-extrabold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1"
            >
              <span>VIEW CASE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
