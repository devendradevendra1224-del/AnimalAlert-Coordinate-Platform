import React from 'react';
import { RescueCase } from '../types';
import { AlertTriangle, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

interface DuplicateReportModalProps {
  existingCase: RescueCase;
  distanceMeters: number;
  onViewExisting: (caseId: string) => void;
  onContinueNew: () => void;
  onCancel: () => void;
}

export const DuplicateReportModal: React.FC<DuplicateReportModalProps> = ({
  existingCase,
  distanceMeters,
  onViewExisting,
  onContinueNew,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-200 animate-fade-in space-y-4">
        <div className="flex items-start space-x-3 pb-3 border-b border-amber-100">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-amber-900">
              ⚠️ POSSIBLE DUPLICATE REPORT
            </h3>
            <p className="text-xs text-amber-800 font-medium mt-0.5">
              There may already be an active rescue case nearby for this animal.
            </p>
          </div>
        </div>

        {/* EXISTING CASE PREVIEW CARD */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-800 bg-amber-200/80 px-2 py-0.5 rounded">
              CASE #{existingCase.id}
            </span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 uppercase">
              {existingCase.status}
            </span>
          </div>

          <p className="text-sm font-bold text-slate-900">
            {existingCase.animal_type}: {existingCase.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium pt-1">
            <div>
              <span className="text-slate-400">Distance:</span>{' '}
              <strong className="text-slate-900">{distanceMeters} meters away</strong>
            </div>
            <div>
              <span className="text-slate-400">Priority:</span>{' '}
              <strong className="text-rose-700">{existingCase.priority}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400">Address:</span>{' '}
              <span className="text-slate-800">{existingCase.address}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 italic">
          If this is the same animal, you can view the existing active case to upload observations, photos, or chat with responders.
        </p>

        {/* BUTTON ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => onViewExisting(existingCase.id)}
            className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>VIEW EXISTING CASE</span>
          </button>

          <button
            onClick={onContinueNew}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>CONTINUE NEW REPORT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
