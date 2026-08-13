import React, { useState, useEffect } from 'react';
import { UserProfile, AIAnalysisResult, PriorityLevel, RescueCase } from '../types';
import { AnimalScanner } from './AnimalScanner';
import { DuplicateReportModal } from './DuplicateReportModal';
import { checkForDuplicateReport, createRescueCase } from '../services/rescueService';
import { saveOfflineDraft, subscribeNetworkStatus } from '../services/offlineService';
import { MapPin, AlertTriangle, ShieldAlert, CheckCircle2, Sparkles, Send, Loader2, WifiOff, Check } from 'lucide-react';

interface RescueReportFormProps {
  currentUser: UserProfile | null;
  onReportCreated: (newCase: RescueCase) => void;
  onViewCase: (caseId: string) => void;
}

export const RescueReportForm: React.FC<RescueReportFormProps> = ({
  currentUser,
  onReportCreated,
  onViewCase,
}) => {
  const [animalType, setAnimalType] = useState('Dog');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Market St & 10th St, San Francisco, CA');
  const [lat, setLat] = useState(37.7760);
  const [lng, setLng] = useState(-122.4180);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<PriorityLevel>('HIGH');
  const [urgencyReason, setUrgencyReason] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [offlineDraftSaved, setOfflineDraftSaved] = useState(false);

  const [duplicateCase, setDuplicateCase] = useState<RescueCase | null>(null);
  const [duplicateDistance, setDuplicateDistance] = useState<number>(0);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeNetworkStatus((online) => {
      setIsOnline(online);
    });
    return () => unsubscribe();
  }, []);

  const handleScanComplete = (result: AIAnalysisResult, imageBase64: string) => {
    setAiResult(result);
    setPhotoUrl(imageBase64);
    if (result.animal_type) setAnimalType(result.animal_type);
    if (result.recommended_priority) setPriority(result.recommended_priority);
    if (result.urgency_reason) setUrgencyReason(result.urgency_reason);
    if (result.injuries_detected.length > 0) {
      setDescription(
        `Animal appears injured: ${result.injuries_detected.join(', ')}. Environmental factors: ${result.environmental_dangers.join(', ')}.`
      );
    }
  };

  const handleFetchCurrentLocation = () => {
    setGpsStatus('Acquiring high-precision GPS...');
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy);

          setLat(latitude);
          setLng(longitude);
          setGpsAccuracy(accuracy);
          setAddress(`GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) San Francisco Area`);
          setGpsStatus(`Location captured ✓ Accuracy: ~${accuracy} meters`);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setGpsStatus('Unable to acquire exact GPS. Please type street address or landmark manually.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    } else {
      setGpsStatus('Geolocation not supported on this device.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // OFFLINE HANDLING
    if (!isOnline) {
      saveOfflineDraft({
        animal_type: animalType,
        description,
        photo_url: photoUrl,
        latitude: lat,
        longitude: lng,
        address,
        priority,
        urgency_reason: urgencyReason || 'Offline user report draft',
        ai_result: aiResult || undefined,
      });

      setOfflineDraftSaved(true);
      return;
    }

    setSubmitting(true);

    // 1. Check for possible duplicate report (500m radius, 30 min window)
    const dupCheck = await checkForDuplicateReport(lat, lng, animalType);
    if (dupCheck.isPossibleDuplicate && dupCheck.existingCase) {
      setDuplicateCase(dupCheck.existingCase);
      setDuplicateDistance(dupCheck.distanceMeters || 100);
      setShowDuplicateModal(true);
      setSubmitting(false);
      return;
    }

    await executeReportSubmission();
  };

  const executeReportSubmission = async () => {
    setSubmitting(true);
    const newCase = await createRescueCase(
      {
        reporter_id: currentUser?.id || 'usr-anon',
        reporter_name: currentUser?.full_name || 'Anonymous Reporter',
        reporter_phone: currentUser?.phone,
        animal_type: animalType,
        description,
        photo_url: photoUrl,
        latitude: lat,
        longitude: lng,
        address,
        priority,
        urgency_reason: urgencyReason || 'Manual user report submitted',
      },
      currentUser
    );

    setSubmitting(false);
    onReportCreated(newCase);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* DUPLICATE REPORT MODAL */}
      {showDuplicateModal && duplicateCase && (
        <DuplicateReportModal
          existingCase={duplicateCase}
          distanceMeters={duplicateDistance}
          onViewExisting={(caseId) => {
            setShowDuplicateModal(false);
            onViewCase(caseId);
          }}
          onContinueNew={async () => {
            setShowDuplicateModal(false);
            await executeReportSubmission();
          }}
          onCancel={() => setShowDuplicateModal(false)}
        />
      )}

      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3 text-rose-200 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Emergency Dispatch System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Report an Animal in Distress
        </h1>
        <p className="text-sm text-rose-100 mt-1 font-medium">
          Instant AI triage matches nearby verified rescuers, community volunteers & organizations.
        </p>
      </div>

      {/* AI SCANNER STEP */}
      <AnimalScanner onScanComplete={handleScanComplete} />

      {/* AI ANALYSIS SUMMARY CARD */}
      {aiResult && (
        <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200 rounded-2xl p-5 space-y-3 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-600 text-white font-extrabold text-xs rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Triage Analysis</span>
            </span>
            <span className="text-xs font-mono text-slate-600 font-bold">
              Confidence: {Math.round(aiResult.confidence * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
              <span className="text-slate-400 font-medium block">Identified Animal:</span>
              <strong className="text-slate-900 text-sm font-bold">{aiResult.animal_type}</strong>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
              <span className="text-slate-400 font-medium block">Operational Priority:</span>
              <strong className={`text-sm font-extrabold ${
                aiResult.recommended_priority === 'CRITICAL' ? 'text-rose-700' : 'text-amber-700'
              }`}>
                {aiResult.recommended_priority === 'CRITICAL' && '🚨 '}
                {aiResult.recommended_priority}
              </strong>
            </div>
          </div>

          {aiResult.injuries_detected.length > 0 && (
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-800">Detected Injury Indicators:</span>
              <ul className="list-disc list-inside text-slate-700 font-medium space-y-0.5">
                {aiResult.injuries_detected.map((inj, idx) => (
                  <li key={idx}>{inj}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[11px] text-slate-500 italic pt-1 border-t border-rose-200/60">
            Note: Priority level is an operational triage metric for rapid rescue dispatch, not a veterinary medical diagnosis.
          </p>
        </div>
      )}

      {/* FORM INPUTS */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Rescue Location & Operational Details
        </h3>

        {/* ANIMAL TYPE SELECTOR */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            Animal Species / Type
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-bold">
            {['Dog', 'Cat', 'Bird', 'Wildlife', 'Cow/Goat', 'Other'].map((type) => (
              <button
                type="button"
                key={type}
                onClick={() => setAnimalType(type)}
                className={`py-2 px-3 rounded-xl border transition-all ${
                  animalType.toLowerCase() === type.toLowerCase()
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* OPERATIONAL PRIORITY */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            Operational Priority
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as PriorityLevel[]).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={`py-2 px-3 rounded-xl border transition-all ${
                  priority === p
                    ? p === 'CRITICAL'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                      : p === 'HIGH'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : p === 'MEDIUM'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p === 'CRITICAL' && '🚨 '}
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* OFFLINE DRAFT CONFIRMATION */}
        {offlineDraftSaved && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center space-x-2 font-extrabold text-amber-700">
              <WifiOff className="w-4 h-4" />
              <span>Rescue Report Saved Locally (Offline Mode)</span>
            </div>
            <p className="text-slate-700 font-medium">
              Saved locally. It will be submitted automatically or ready to send when internet connection returns.
            </p>
          </div>
        )}

        {/* LOCATION FIELD */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Location / Landmarks</span>
            </label>
            <button
              type="button"
              onClick={handleFetchCurrentLocation}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              Use GPS Location
            </button>
          </div>

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="e.g. 10th & Market St, behind coffee shop"
          />

          {gpsStatus && (
            <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{gpsStatus}</span>
            </div>
          )}
        </div>

        {/* DESCRIPTION TEXTAREA */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            Distress Description & Specific Hazards
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Describe animal condition, behavior, whether near traffic or trapped, and any special access instructions..."
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Dispatching Alert & Checking Duplicates...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>SUBMIT RESCUE REPORT</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
