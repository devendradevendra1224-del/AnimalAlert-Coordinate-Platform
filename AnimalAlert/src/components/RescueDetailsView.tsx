import React, { useState, useEffect } from 'react';
import { RescueCase, UserProfile, VetHospital, Shelter } from '../types';
import { updateCaseStatus, escalateCaseIfNeeded, acceptRescueCase } from '../services/rescueService';
import { fetchNearbyVetHospitals } from '../services/vetHospitalService';
import { fetchShelters } from '../services/shelterService';
import { CaseObservationsView } from './CaseObservationsView';
import { VolunteerTaskModal } from './VolunteerTaskModal';
import { RescueChat } from './RescueChat';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  HeartPulse, 
  Building2, 
  ArrowLeft, 
  Share2, 
  CheckCircle2, 
  HandHeart, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface RescueDetailsViewProps {
  caseId: string;
  currentUser: UserProfile;
  rescueCase: RescueCase;
  onBack: () => void;
  onOpenPublicLink: (caseId: string) => void;
  onCaseUpdated: () => void;
}

export const RescueDetailsView: React.FC<RescueDetailsViewProps> = ({
  caseId,
  currentUser,
  rescueCase,
  onBack,
  onOpenPublicLink,
  onCaseUpdated,
}) => {
  const [vets, setVets] = useState<VetHospital[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedVetId, setSelectedVetId] = useState(rescueCase.hospital_id || '');
  const [selectedShelterId, setSelectedShelterId] = useState(rescueCase.shelter_id || '');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    loadOptions();
  }, [rescueCase]);

  const loadOptions = async () => {
    const vetList = await fetchNearbyVetHospitals(rescueCase.latitude, rescueCase.longitude);
    const shelterList = await fetchShelters();
    setVets(vetList);
    setShelters(shelterList);
  };

  const handleStatusChange = async (newStatus: RescueCase['status']) => {
    setClaimError(null);
    if ((newStatus === 'in_progress' || newStatus === 'assigned') && (currentUser.role === 'rescuer' || currentUser.role === 'volunteer')) {
      const claimResult = await acceptRescueCase(caseId, currentUser);
      if (!claimResult.success) {
        setClaimError(claimResult.message || 'Another rescuer has already accepted this case.');
        return;
      }
    } else {
      const selectedVet = vets.find((v) => v.id === selectedVetId);
      const selectedShelter = shelters.find((s) => s.id === selectedShelterId);

      await updateCaseStatus(caseId, newStatus, currentUser, {
        hospitalId: selectedVet?.id,
        hospitalName: selectedVet?.name,
        shelterId: selectedShelter?.id,
        shelterName: selectedShelter?.name,
      });
    }
    onCaseUpdated();
  };

  const handleEscalate = async () => {
    await escalateCaseIfNeeded(caseId);
    onCaseUpdated();
  };

  const levels = [
    { lvl: 1, label: 'Level 1: Nearby Rescuers' },
    { lvl: 2, label: 'Level 2: Expanded Radius' },
    { lvl: 3, label: 'Level 3: Community Volunteers' },
    { lvl: 4, label: 'Level 4: Verified Orgs' },
    { lvl: 5, label: 'Level 5: Admin Escalation' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* TASK MODAL */}
      {showTaskModal && (
        <VolunteerTaskModal
          caseId={caseId}
          currentUser={currentUser}
          onTaskCreated={() => {
            setShowTaskModal(false);
            onCaseUpdated();
          }}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {/* TOP NAVIGATION */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </button>

        <button
          onClick={() => onOpenPublicLink(caseId)}
          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
        >
          <Share2 className="w-4 h-4" />
          <span>SHARE PUBLIC LINK</span>
        </button>
      </div>

      {/* CASE SUMMARY BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-rose-300 bg-rose-900/60 px-2.5 py-0.5 rounded border border-rose-800">
                CASE #{rescueCase.id}
              </span>
              <span
                className={`text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-full ${
                  rescueCase.priority === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-slate-950'
                }`}
              >
                {rescueCase.priority === 'CRITICAL' && '🚨 '}
                {rescueCase.priority} PRIORITY
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {rescueCase.animal_type} Emergency Rescue
            </h1>
            <p className="text-sm text-slate-300 mt-1 font-medium">{rescueCase.description}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs space-y-1.5 shrink-0 w-full sm:w-auto">
            <div className="flex items-center space-x-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-bold text-white">{rescueCase.address}</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported {new Date(rescueCase.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* SMART ESCALATION TIMELINE */}
        <div className="pt-4 border-t border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold">SMART ESCALATION LEVEL:</span>
            <span className="text-rose-300 font-extrabold">LEVEL {rescueCase.escalation_level} / 5</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {levels.map((l) => (
              <div
                key={l.lvl}
                className={`h-2 rounded-full transition-all ${
                  rescueCase.escalation_level >= l.lvl ? 'bg-rose-500 shadow-xs' : 'bg-slate-700'
                }`}
                title={l.label}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-1">
            <p className="text-[11px] text-slate-400 font-mono">
              Auto-escalates radius & volunteers if unassigned within timeout window.
            </p>
            {rescueCase.escalation_level < 5 && (
              <button
                onClick={handleEscalate}
                className="text-xs font-extrabold text-amber-300 hover:text-amber-200 underline"
              >
                MANUALLY ESCALATE LEVEL
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STATUS & DESTINATION CONTROLS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          Rescue Operational Pipeline & Intake
        </h3>

        {claimError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
            <span>{claimError}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(['reported', 'assigned', 'in_progress', 'transporting', 'completed'] as RescueCase['status'][]).map(
            (st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider transition-all uppercase ${
                  rescueCase.status === st
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>

        {/* HOSPITALS & SHELTERS SELECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase font-mono flex items-center space-x-1">
              <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
              <span>Assigned Veterinary Hospital</span>
            </label>
            <select
              value={selectedVetId}
              onChange={(e) => setSelectedVetId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="">-- None / In Field --</option>
              {vets.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.distance_km} km away {v.is_24h ? '• 24/7 ER' : ''})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase font-mono flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Assigned Shelter / Foster Facility</span>
            </label>
            <select
              value={selectedShelterId}
              onChange={(e) => setSelectedShelterId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="">-- None / Pending --</option>
              {shelters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.current_occupancy}/{s.capacity} occupied)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: OBSERVATIONS & CHAT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CaseObservationsView caseId={caseId} currentUser={currentUser} />
        <RescueChat caseId={caseId} currentUser={currentUser} />
      </div>

      {/* VOLUNTEER TASKS ACTION */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
            Community Assistance
          </span>
          <h3 className="text-lg font-extrabold text-emerald-950 mt-1">Non-Medical Volunteer Support Tasks</h3>
          <p className="text-xs text-emerald-800 font-medium mt-0.5">
            Assign observational checks, photo updates, hospital coordination, or transport help.
          </p>
        </div>

        <button
          onClick={() => setShowTaskModal(true)}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0"
        >
          <HandHeart className="w-4 h-4" />
          <span>CREATE VOLUNTEER TASK</span>
        </button>
      </div>
    </div>
  );
};
