import React, { useState } from 'react';
import { VolunteerTask, VolunteerTaskType, UserProfile } from '../types';
import { createVolunteerTask } from '../services/rescueService';
import { HandHeart, Plus, CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface VolunteerTaskModalProps {
  caseId: string;
  currentUser: UserProfile;
  onTaskCreated: (newTask: VolunteerTask) => void;
  onClose: () => void;
}

export const VolunteerTaskModal: React.FC<VolunteerTaskModalProps> = ({
  caseId,
  currentUser,
  onTaskCreated,
  onClose,
}) => {
  const [taskType, setTaskType] = useState<VolunteerTaskType>('provide_updated_photo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const taskOptions: { type: VolunteerTaskType; label: string; desc: string }[] = [
    { type: 'locate_animal', label: 'Locate Animal', desc: 'Search nearby radius and confirm exact position' },
    { type: 'provide_updated_photo', label: 'Provide Updated Photo', desc: 'Upload clear fresh photo from safe distance' },
    { type: 'provide_updated_location', label: 'Provide Updated Location', desc: 'Report if animal moved or changed spots' },
    { type: 'contact_organization', label: 'Contact Rescue Org', desc: 'Phone local NGOs/shelters for emergency intake' },
    { type: 'help_transport', label: 'Help with Transport', desc: 'Assist driver with crate or vehicle loading' },
    { type: 'reach_hospital', label: 'Reach Vet Hospital', desc: 'Call ER clinic to confirm intake availability' },
    { type: 'locate_shelter', label: 'Locate Shelter', desc: 'Find open shelter/foster space for post-care' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    const selectedOption = taskOptions.find((t) => t.type === taskType);
    const newTask = await createVolunteerTask({
      rescue_case_id: caseId,
      task_type: taskType,
      title: title || selectedOption?.label || 'Volunteer Task',
      description,
    });

    setSubmitting(false);
    onTaskCreated(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-in space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <HandHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Add Non-Medical Volunteer Task</h3>
              <p className="text-xs text-slate-500 font-medium">Assign community assistance task to rescue team</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            <strong>Safety Notice:</strong> Tasks must strictly involve logistical or observational support. Volunteers are strictly forbidden from performing invasive medical procedures or veterinary diagnoses.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Select Task Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {taskOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => {
                    setTaskType(opt.type);
                    if (!title) setTitle(opt.label);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    taskType === opt.type
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="font-bold">{opt.label}</p>
                  <p className="text-[10px] text-slate-500 font-normal line-clamp-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Check under porch & take fresh photo"
              required
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Detailed Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Provide clear steps for volunteers..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE VOLUNTEER TASK</span>
          </button>
        </form>
      </div>
    </div>
  );
};
