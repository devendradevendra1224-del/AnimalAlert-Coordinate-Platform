import React, { useState, useEffect } from 'react';
import { CaseObservation, ObservationType, UserProfile } from '../types';
import { fetchCaseObservations, createCaseObservation } from '../services/rescueService';
import { Eye, Plus, Camera, MapPin, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CaseObservationsViewProps {
  caseId: string;
  currentUser: UserProfile;
}

export const CaseObservationsView: React.FC<CaseObservationsViewProps> = ({
  caseId,
  currentUser,
}) => {
  const [observations, setObservations] = useState<CaseObservation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [obsType, setObsType] = useState<ObservationType>('animal_seen');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadObs();
  }, [caseId]);

  const loadObs = async () => {
    const data = await fetchCaseObservations(caseId);
    setObservations(data);
  };

  const obsTypeLabels: Record<ObservationType, { label: string; color: string }> = {
    animal_seen: { label: 'Animal Seen', color: 'bg-emerald-100 text-emerald-800' },
    animal_moved: { label: 'Animal Moved', color: 'bg-amber-100 text-amber-800' },
    animal_missing: { label: 'Animal Missing', color: 'bg-rose-100 text-rose-800' },
    updated_location: { label: 'Updated Location', color: 'bg-sky-100 text-sky-800' },
    additional_photo: { label: 'Additional Photo', color: 'bg-indigo-100 text-indigo-800' },
    danger_changed: { label: 'Danger Level Changed', color: 'bg-purple-100 text-purple-800' },
    other: { label: 'General Note', color: 'bg-slate-100 text-slate-800' },
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    await createCaseObservation({
      rescue_case_id: caseId,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      observation_type: obsType,
      description,
      photo_url: photoUrl || undefined,
      latitude: currentUser.latitude,
      longitude: currentUser.longitude,
    });

    setSubmitting(false);
    setDescription('');
    setPhotoUrl('');
    setShowForm(false);
    await loadObs();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 text-base">Real-Time Case Observations</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ADD OBSERVATION</span>
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleAddObservation} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 animate-fade-in">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase font-mono">Observation Type</label>
            <select
              value={obsType}
              onChange={(e) => setObsType(e.target.value as ObservationType)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
            >
              <option value="animal_seen">Animal Seen / Position Confirmed</option>
              <option value="animal_moved">Animal Moved / Walking Away</option>
              <option value="animal_missing">Animal Missing / Cannot Find</option>
              <option value="updated_location">Updated GPS Location</option>
              <option value="additional_photo">Additional Fresh Photo</option>
              <option value="danger_changed">Danger Level Changed</option>
              <option value="other">General Note</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase font-mono">Details & Observations</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe current situation..."
              required
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-lg hover:bg-emerald-700"
          >
            SUBMIT CASE OBSERVATION
          </button>
        </form>
      )}

      {/* OBSERVATIONS TIMELINE */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {observations.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No observations recorded yet.</p>
        ) : (
          observations.map((obs) => {
            const badge = obsTypeLabels[obs.observation_type] || obsTypeLabels.other;
            return (
              <div key={obs.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(obs.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-800">{obs.description}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                  <span>By {obs.user_name} ({obs.user_role})</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
