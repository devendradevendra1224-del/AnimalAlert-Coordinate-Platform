import React from 'react';
import { Phone, ShieldAlert, HeartPulse, Building2, X } from 'lucide-react';

interface EmergencyHotlinesModalProps {
  onClose: () => void;
}

export const EmergencyHotlinesModal: React.FC<EmergencyHotlinesModalProps> = ({ onClose }) => {
  const hotlines = [
    { title: 'SF Animal Care & Control Dispatch', phone: '+1 (415) 554-6364', hours: '24/7 Emergency' },
    { title: 'Bay Area Wildlife Emergency Hotline', phone: '+1 (415) 999-7372', hours: '24/7 Wildlife' },
    { title: 'SPCA Emergency Veterinary ER', phone: '+1 (415) 554-3000', hours: '24/7 Medical' },
    { title: 'Animal Poison Control Center', phone: '+1 (888) 426-4435', hours: '24/7 Poison Helpline' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-fade-in space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">24/7 Emergency Hotlines</h3>
              <p className="text-xs text-slate-500 font-medium">Direct phone dispatch for immediate assistance</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {hotlines.map((h, i) => (
            <div key={i} className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">{h.title}</h4>
                <p className="text-[10px] font-mono text-rose-700 font-bold">{h.hours}</p>
              </div>

              <a
                href={`tel:${h.phone}`}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>CALL</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
