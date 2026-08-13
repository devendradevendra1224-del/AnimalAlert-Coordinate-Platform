import React from 'react';
import { ShieldCheck, AlertTriangle, X, Lock, Eye, MapPin, Camera, Bell, CheckCircle2 } from 'lucide-react';

interface PrivacyAndTermsModalProps {
  onClose: () => void;
}

export const PrivacyAndTermsModal: React.FC<PrivacyAndTermsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* HEADER */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Privacy Policy & Emergency Medical Disclaimer</h3>
              <p className="text-xs text-slate-400 font-medium">AnimalAlert Production Compliance & Safety Guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* MANDATORY VETERINARY DISCLAIMER */}
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 font-black text-amber-900 text-sm uppercase tracking-wide">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Veterinary Medical Disclaimer</span>
            </div>
            <p className="font-semibold text-amber-950">
              AnimalAlert provides AI-assisted visual assessment and rescue coordination. It is not a veterinary diagnostic service. AI results may be inaccurate. For serious emergencies, contact a qualified veterinarian or animal rescue organization immediately.
            </p>
          </div>

          {/* AI SAFETY LANGUAGE & ACCURACY */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Eye className="w-4 h-4 text-rose-600" />
              <span>AI Assessment & Safety Framework</span>
            </h4>
            <p className="text-slate-600">
              The platform utilizes Gemini Vision models solely to assist reporters in estimating operational priority and identifying possible environmental dangers or visible signs of distress. AI evaluations are designated strictly as <strong>AI-assisted visual assessments</strong> and do not represent confirmed medical diagnoses or guaranteed recovery outcomes.
            </p>
          </div>

          {/* GPS LOCATION & PRIVACY */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Location Privacy & Tracking</span>
            </h4>
            <p className="text-slate-600">
              <strong>Reporters:</strong> High-precision GPS is requested solely at the time of report submission to dispatch nearby emergency rescuers to the exact location of the distressed animal.
            </p>
            <p className="text-slate-600">
              <strong>Rescuers & Volunteers:</strong> Background location tracking operates exclusively when availability status is actively toggled ON. Rescuer locations are masked with approximate radius offsets to protect personal privacy until a rescue case is explicitly accepted. Tracking halts automatically upon logging out or toggling status OFF.
            </p>
          </div>

          {/* CAMERA & PHOTO PERMISSIONS */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Camera & Media Uploads</span>
            </h4>
            <p className="text-slate-600">
              Camera access is requested to capture real-time photos of distressed animals. Images are sanitized, compressed client-side, and stored securely for assigned rescuers and verified shelter partners. We strictly filter uploads for valid image formats (JPG, PNG, WEBP) under 10MB limits.
            </p>
          </div>

          {/* PUSH NOTIFICATIONS */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Push Notifications & Subscriptions</span>
            </h4>
            <p className="text-slate-600">
              Push notification tokens are stored confidentially to broadcast real-time dispatch alerts to nearby available rescuers. You may customize or revoke notification permissions at any time via the Notification Center or browser settings.
            </p>
          </div>

          {/* DATA SECURITY & RETENTION */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-800" />
              <span>Data Protection & Retention</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>All database operations are governed by Supabase Row-Level Security (RLS) policies.</li>
              <li>Authentication tokens and API credentials are kept securely in environment configurations.</li>
              <li>Completed rescue case records are archived for historical analytics and shelter placement tracking.</li>
            </ul>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Compliant with Production Security Standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};
