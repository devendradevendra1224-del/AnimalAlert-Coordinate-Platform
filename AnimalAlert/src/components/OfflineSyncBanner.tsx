import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Send, Trash2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { subscribeNetworkStatus, getOfflineDrafts, deleteOfflineDraft, clearOfflineDrafts } from '../services/offlineService';
import { OfflineDraft } from '../types';
import { createRescueCase } from '../services/rescueService';

interface OfflineSyncBannerProps {
  onReportSubmitted: () => void;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({ onReportSubmitted }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionRestoredToast, setConnectionRestoredToast] = useState(false);
  const [drafts, setDrafts] = useState<OfflineDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkDrafts = () => {
      setDrafts(getOfflineDrafts());
    };

    checkDrafts();

    const unsubscribe = subscribeNetworkStatus((online) => {
      if (!isOnline && online) {
        setConnectionRestoredToast(true);
        setTimeout(() => setConnectionRestoredToast(false), 4000);
      }
      setIsOnline(online);
      checkDrafts();
    });

    const interval = setInterval(checkDrafts, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isOnline]);

  const handleSendDraft = async (draft: OfflineDraft) => {
    if (!isOnline) {
      alert('You are currently offline. Please wait until internet connection is restored.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(`Sending draft alert for ${draft.animal_type}...`);

    try {
      await createRescueCase({
        reporter_id: 'usr-offline-sync',
        reporter_name: 'Offline Synced Reporter',
        animal_type: draft.animal_type,
        description: draft.description,
        photo_url: draft.photo_url,
        latitude: draft.latitude,
        longitude: draft.longitude,
        address: draft.address,
        priority: draft.priority,
        urgency_reason: draft.urgency_reason,
      });

      deleteOfflineDraft(draft.id);
      setDrafts(getOfflineDrafts());
      setSubmitMessage('✓ Rescue alert successfully submitted!');
      onReportSubmitted();

      setTimeout(() => setSubmitMessage(null), 3000);
    } catch (err) {
      console.error('Failed to submit offline draft:', err);
      setSubmitMessage('Failed to send draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscardDraft = (id: string) => {
    deleteOfflineDraft(id);
    setDrafts(getOfflineDrafts());
  };

  return (
    <div className="space-y-2 my-2">
      {/* OFFLINE BANNER */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 p-3 rounded-2xl font-bold text-xs flex items-center justify-between shadow-md border border-amber-600 animate-pulse">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>⚠️ You're offline — Rescue reports created now will be saved locally.</span>
          </div>
          <span className="text-[10px] bg-slate-950 text-amber-300 font-mono px-2 py-0.5 rounded font-extrabold">
            OFFLINE MODE
          </span>
        </div>
      )}

      {/* CONNECTION RESTORED TOAST */}
      {connectionRestoredToast && (
        <div className="bg-emerald-600 text-white p-3 rounded-2xl font-bold text-xs flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 shrink-0" />
            <span>✅ Connection restored — AnimalAlert is back online.</span>
          </div>
        </div>
      )}

      {/* OFFLINE DRAFTS READY TO SEND */}
      {drafts.length > 0 && (
        <div className="bg-sky-900 text-white p-4 rounded-2xl border border-sky-700 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-sky-800 pb-2">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-sky-300" />
              <h4 className="font-extrabold text-xs">Offline Rescue Drafts Ready ({drafts.length})</h4>
            </div>
            <span className="text-[10px] font-mono font-bold bg-sky-800 text-sky-200 px-2 py-0.5 rounded">
              LOCAL STORAGE
            </span>
          </div>

          {submitMessage && (
            <p className="text-xs font-bold text-sky-200 bg-sky-950 p-2 rounded-xl font-mono">
              {submitMessage}
            </p>
          )}

          <div className="space-y-2">
            {drafts.map((d) => (
              <div key={d.id} className="p-3 bg-sky-950/70 rounded-xl border border-sky-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white">{d.animal_type}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold">
                      {d.priority}
                    </span>
                  </div>
                  <p className="text-sky-200 line-clamp-1">{d.description}</p>
                  <p className="text-[10px] text-sky-400 font-mono">
                    Created: {new Date(d.created_at).toLocaleTimeString()} • {d.address}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    disabled={!isOnline || isSubmitting}
                    onClick={() => handleSendDraft(d)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND RESCUE ALERT</span>
                  </button>

                  <button
                    onClick={() => handleDiscardDraft(d.id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                    title="Discard Draft"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
