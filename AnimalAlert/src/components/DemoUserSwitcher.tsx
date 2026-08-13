import React from 'react';
import { UserProfile } from '../types';
import { 
  DEMO_REPORTER, 
  DEMO_VOLUNTEER, 
  DEMO_RESCUER, 
  DEMO_ORG_MANAGER, 
  DEMO_ADMIN, 
  setDemoActiveUser 
} from '../services/authService';
import { ShieldCheck, User, HandHeart, CheckCircle2, Building2, ShieldAlert } from 'lucide-react';

interface DemoUserSwitcherProps {
  currentUser: UserProfile | null;
  onUserChanged: (user: UserProfile) => void;
}

export const DemoUserSwitcher: React.FC<DemoUserSwitcherProps> = ({
  currentUser,
  onUserChanged,
}) => {
  const handleSwitch = async (user: UserProfile) => {
    await setDemoActiveUser(user);
    onUserChanged(user);
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center space-x-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
          Demo Switcher:
        </span>
        <span className="text-slate-100 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center space-x-1">
          <span>{currentUser?.full_name || 'Guest'}</span>
          <span className="text-slate-400 font-normal">({currentUser?.role || 'none'})</span>
        </span>
      </div>

      <div className="flex items-center space-x-1.5 flex-wrap justify-center">
        <button
          onClick={() => handleSwitch(DEMO_REPORTER)}
          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center space-x-1 ${
            currentUser?.id === DEMO_REPORTER.id
              ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <User className="w-3 h-3" />
          <span>Reporter</span>
        </button>

        <button
          onClick={() => handleSwitch(DEMO_VOLUNTEER)}
          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center space-x-1 ${
            currentUser?.id === DEMO_VOLUNTEER.id
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <HandHeart className="w-3 h-3" />
          <span>Volunteer</span>
        </button>

        <button
          onClick={() => handleSwitch(DEMO_RESCUER)}
          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center space-x-1 ${
            currentUser?.id === DEMO_RESCUER.id
              ? 'bg-sky-500 text-slate-950 font-extrabold shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Rescuer</span>
        </button>

        <button
          onClick={() => handleSwitch(DEMO_ORG_MANAGER)}
          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center space-x-1 ${
            currentUser?.id === DEMO_ORG_MANAGER.id
              ? 'bg-indigo-500 text-white font-extrabold shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-3 h-3" />
          <span>Org Mgr</span>
        </button>

        <button
          onClick={() => handleSwitch(DEMO_ADMIN)}
          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center space-x-1 ${
            currentUser?.id === DEMO_ADMIN.id
              ? 'bg-purple-600 text-white font-extrabold shadow-xs'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <ShieldAlert className="w-3 h-3" />
          <span>Admin</span>
        </button>
      </div>
    </div>
  );
};
