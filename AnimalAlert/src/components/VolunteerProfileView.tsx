import React, { useState } from 'react';
import { UserProfile } from '../types';
import { updateVolunteerProfile, toggleUserAvailability } from '../services/authService';
import { HandHeart, MapPin, Phone, Mail, ShieldAlert, CheckCircle2, Save, User } from 'lucide-react';

interface VolunteerProfileViewProps {
  currentUser: UserProfile;
  onProfileUpdated: (updatedUser: UserProfile) => void;
}

export const VolunteerProfileView: React.FC<VolunteerProfileViewProps> = ({
  currentUser,
  onProfileUpdated,
}) => {
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [locationName, setLocationName] = useState(currentUser.location_name || 'SoMa, San Francisco');
  const [isAvailable, setIsAvailable] = useState(currentUser.is_available ?? true);
  const [preferredRadius, setPreferredRadius] = useState(currentUser.preferred_radius_km || 10);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleToggleAvailability = async (newVal: boolean) => {
    setIsAvailable(newVal);

    if (newVal) {
      // Request location sharing ONLY when volunteer chooses to be available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await toggleUserAvailability(
              currentUser.id,
              true,
              pos.coords.latitude,
              pos.coords.longitude
            );
          },
          async () => {
            await toggleUserAvailability(currentUser.id, true);
          }
        );
      } else {
        await toggleUserAvailability(currentUser.id, true);
      }
    } else {
      await toggleUserAvailability(currentUser.id, false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const updated = await updateVolunteerProfile(currentUser.id, {
      full_name: fullName,
      phone,
      email,
      location_name: locationName,
      is_available: isAvailable,
      preferred_radius_km: preferredRadius,
      role: 'volunteer',
    });

    setSaving(false);
    setMessage('Volunteer profile successfully saved!');
    onProfileUpdated(updated);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-2 text-emerald-200 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <HandHeart className="w-4 h-4" />
          <span>Community Volunteer Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Volunteer Profile Settings
        </h1>
        <p className="text-sm text-emerald-100 mt-1 font-medium">
          Manage your availability, non-medical support radius, and contact preferences.
        </p>

        <div className="mt-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs text-emerald-50 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-emerald-300" />
          <span>
            <strong>Role Designation:</strong> Registered as a <strong className="text-white">Community Volunteer</strong>. Non-medical task assistance only.
          </span>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* PROFILE FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        {/* AVAILABILITY TOGGLE */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 block">
              Rescue Duty Availability Status
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              {isAvailable ? '🟢 Available for Nearby Alerts' : '🔴 Currently Off-Duty'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Location access is only active while turned ON.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggleAvailability(!isAvailable)}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider transition-all shadow-xs ${
              isAvailable
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-900'
            }`}
          >
            {isAvailable ? 'SET TO NOT AVAILABLE' : 'SET TO AVAILABLE'}
          </button>
        </div>

        {/* INPUT FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Phone Number</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Home / Patrol Area</span>
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* PREFERRED RADIUS */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Preferred Response Radius
            </label>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-mono">
              {preferredRadius} km
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={preferredRadius}
            onChange={(e) => setPreferredRadius(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>1 km</span>
            <span>25 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>SAVE VOLUNTEER PROFILE</span>
        </button>
      </form>
    </div>
  );
};
