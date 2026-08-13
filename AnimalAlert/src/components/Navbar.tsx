import React, { useState } from 'react';
import { UserProfile, AppView } from '../types';
import { 
  ShieldAlert, 
  MapPin, 
  HeartPulse, 
  Camera, 
  FileText, 
  Building2, 
  Users, 
  History, 
  Settings, 
  Phone, 
  Bell, 
  User, 
  CheckCircle2, 
  HandHeart,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenHotlines: () => void;
  onOpenNotificationsModal?: () => void;
  onOpenHealthCheck?: () => void;
  onOpenPrivacy?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenHotlines,
  onOpenNotificationsModal,
  onOpenHealthCheck,
  onOpenPrivacy,
  unreadCount = 2,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'volunteer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <HandHeart className="w-3 h-3 text-emerald-600" /> Community Volunteer
          </span>
        );
      case 'rescuer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <CheckCircle2 className="w-3 h-3 text-sky-600" /> Verified Rescuer
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3 h-3 text-purple-600" /> System Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <User className="w-3 h-3 text-amber-600" /> Reporter
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  Animal<span className="text-rose-600">Alert</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md">
                  Phase 6
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">AI Rescue & Smart Escalation</p>
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium">
            <button
              onClick={() => onNavigate('report')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentView === 'report'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Report Emergency</span>
            </button>

            <button
              onClick={() => onNavigate('live-map')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentView === 'live-map'
                  ? 'bg-rose-50 text-rose-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Live Rescue Map</span>
            </button>

            {/* VOLUNTEER LINK */}
            <button
              onClick={() => onNavigate('volunteer-dashboard')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentView.startsWith('volunteer')
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <HandHeart className="w-4 h-4 text-emerald-600" />
              <span>Volunteer</span>
            </button>

            {/* RESCUER LINK */}
            <button
              onClick={() => onNavigate('rescuer-dashboard')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentView === 'rescuer-dashboard'
                  ? 'bg-sky-50 text-sky-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>Rescuer</span>
            </button>

            {/* ORGANIZATION LINK */}
            <button
              onClick={() => onNavigate('organization-dashboard')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentView === 'organization-dashboard'
                  ? 'bg-indigo-50 text-indigo-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Organizations</span>
            </button>

            {/* VET FINDER */}
            <button
              onClick={() => onNavigate('vet-finder')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentView === 'vet-finder'
                  ? 'bg-amber-50 text-amber-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-amber-600" />
              <span>24/7 Vet Clinics</span>
            </button>

            {/* SHELTERS */}
            <button
              onClick={() => onNavigate('shelters')}
              className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentView === 'shelters'
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Shelters</span>
            </button>

            {/* ADMIN PANEL */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                  currentView.startsWith('admin')
                    ? 'bg-purple-600 text-white font-semibold shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* ACTION BUTTONS & ROLE BADGE */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:flex items-center">{getRoleBadge()}</div>

            {onOpenHealthCheck && (
              <button
                onClick={onOpenHealthCheck}
                className="hidden sm:flex items-center p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors font-bold text-xs"
                title="System Diagnostics & Health Check"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </button>
            )}

            {onOpenNotificationsModal && (
              <button
                onClick={onOpenNotificationsModal}
                className="relative p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Notification & Push Settings"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 rounded-full ring-2 ring-white animate-pulse" />
              </button>
            )}

            <button
              onClick={onOpenHotlines}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-colors"
              title="Emergency Hotlines"
            >
              <Phone className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span className="hidden sm:inline">Emergency Hotlines</span>
            </button>

            {/* MOBILE HAMBURGER */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 animate-fade-in shadow-lg">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Current Role</span>
            {getRoleBadge()}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-1">
            <button
              onClick={() => { onNavigate('report'); setMobileMenuOpen(false); }}
              className="p-2.5 bg-rose-600 text-white rounded-lg flex items-center space-x-2 font-bold"
            >
              <Camera className="w-4 h-4" />
              <span>Report Emergency</span>
            </button>
            <button
              onClick={() => { onNavigate('live-map'); setMobileMenuOpen(false); }}
              className="p-2.5 bg-slate-100 rounded-lg flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Live Map</span>
            </button>
            <button
              onClick={() => { onNavigate('volunteer-dashboard'); setMobileMenuOpen(false); }}
              className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg flex items-center space-x-2"
            >
              <HandHeart className="w-4 h-4 text-emerald-600" />
              <span>Volunteer</span>
            </button>
            <button
              onClick={() => { onNavigate('rescuer-dashboard'); setMobileMenuOpen(false); }}
              className="p-2.5 bg-sky-50 text-sky-800 rounded-lg flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>Rescuer</span>
            </button>
            <button
              onClick={() => { onNavigate('organization-dashboard'); setMobileMenuOpen(false); }}
              className="p-2.5 bg-indigo-50 text-indigo-800 rounded-lg flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Organizations</span>
            </button>
            <button
              onClick={() => { onNavigate('vet-finder'); setMobileMenuOpen(false); }}
              className="p-2.5 bg-amber-50 text-amber-800 rounded-lg flex items-center space-x-2"
            >
              <HeartPulse className="w-4 h-4 text-amber-600" />
              <span>24/7 Vets</span>
            </button>
            <button
              onClick={() => { onNavigate('shelters'); setMobileMenuOpen(false); }}
              className="p-2.5 bg-teal-50 text-teal-800 rounded-lg flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Shelters</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }}
                className="p-2.5 bg-purple-600 text-white rounded-lg flex items-center space-x-2 font-bold col-span-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Command Center</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
