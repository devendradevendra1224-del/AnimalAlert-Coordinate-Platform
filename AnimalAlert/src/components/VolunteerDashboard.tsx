import React, { useState, useEffect } from 'react';
import { UserProfile, RescueCase, VolunteerTask } from '../types';
import { fetchRescueCases, fetchVolunteerTasks, updateVolunteerTaskStatus } from '../services/rescueService';
import { HandHeart, MapPin, Clock, Eye, CheckCircle2, ShieldAlert, Sparkles, Filter, ChevronRight } from 'lucide-react';

interface VolunteerDashboardProps {
  currentUser: UserProfile;
  onViewCase: (caseId: string) => void;
  onOpenProfile: () => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  currentUser,
  onViewCase,
  onOpenProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'tasks' | 'completed'>('alerts');
  const [rescueCases, setRescueCases] = useState<RescueCase[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteerData();
  }, [currentUser]);

  const loadVolunteerData = async () => {
    setLoading(true);
    const cases = await fetchRescueCases({
      lat: currentUser.latitude || 37.7749,
      lng: currentUser.longitude || -122.4194,
    });
    const allTasks = await fetchVolunteerTasks();

    setRescueCases(cases);
    setTasks(allTasks);
    setLoading(false);
  };

  const handleAcceptTask = async (taskId: string) => {
    await updateVolunteerTaskStatus(taskId, 'accepted', currentUser);
    await loadVolunteerData();
  };

  const handleCompleteTask = async (taskId: string) => {
    await updateVolunteerTaskStatus(taskId, 'completed', currentUser);
    await loadVolunteerData();
  };

  // Filter nearby alerts (Level 3+ or nearby cases)
  const nearbyAlerts = rescueCases.filter(
    (c) => c.status !== 'completed' && c.status !== 'cancelled'
  );

  const myTasks = tasks.filter((t) => t.assigned_volunteer_id === currentUser.id && t.status === 'accepted');
  const completedTasks = tasks.filter((t) => t.assigned_volunteer_id === currentUser.id && t.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-200 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <HandHeart className="w-4 h-4" />
            <span>Community Volunteer Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {currentUser.full_name}
          </h1>
          <p className="text-sm text-emerald-100 mt-1 font-medium">
            Helping animals with non-medical community support, transport, and observations.
          </p>
        </div>

        <button
          onClick={onOpenProfile}
          className="px-4 py-2.5 bg-white text-emerald-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-emerald-50 transition-all flex items-center space-x-1.5 shrink-0"
        >
          <span>EDIT VOLUNTEER PROFILE</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* DASHBOARD STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">Nearby Alerts</span>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{nearbyAlerts.length}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">My Active Tasks</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{myTasks.length}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <HandHeart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">Completed Assistance</span>
            <p className="text-2xl font-black text-sky-600 mt-0.5">{completedTasks.length}</p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'alerts'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Nearby Rescue Alerts ({nearbyAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'tasks'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Active Tasks ({myTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'completed'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Completed Assistance ({completedTasks.length})
        </button>
      </div>

      {/* TAB CONTENT: ALERTS */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nearbyAlerts.length === 0 ? (
            <div className="col-span-2 bg-white p-12 rounded-2xl text-center border border-slate-200 text-slate-500 font-medium">
              No active rescue alerts nearby right now.
            </div>
          ) : (
            nearbyAlerts.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                      CASE #{caseItem.id}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${
                        caseItem.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {caseItem.priority === 'CRITICAL' && '🚨 '}
                      {caseItem.priority}
                    </span>
                  </div>

                  <div className="flex space-x-3">
                    {caseItem.photo_url ? (
                      <img
                        src={caseItem.photo_url}
                        alt={caseItem.animal_type}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                        No Photo
                      </div>
                    )}

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-base leading-tight">
                        {caseItem.animal_type}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 font-medium">
                        {caseItem.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium pt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span className="truncate">{caseItem.address}</span>
                    </span>
                    <span className="flex items-center space-x-1 font-mono justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{caseItem.distance_km ? `${caseItem.distance_km} km away` : 'Nearby'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onViewCase(caseItem.id)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>VIEW</span>
                  </button>

                  <button
                    onClick={() => onViewCase(caseItem.id)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                  >
                    <HandHeart className="w-3.5 h-3.5" />
                    <span>HELP</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {myTasks.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 text-slate-500 font-medium">
              You have no active volunteer tasks assigned currently.
            </div>
          ) : (
            myTasks.map((t) => (
              <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md">
                    {t.task_type.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => handleCompleteTask(t.id)}
                    className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700"
                  >
                    MARK TASK COMPLETED
                  </button>
                </div>
                <h4 className="font-extrabold text-slate-900">{t.title}</h4>
                <p className="text-xs text-slate-600 font-medium">{t.description}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: COMPLETED */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedTasks.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 text-slate-500 font-medium">
              No completed assistance tasks logged yet.
            </div>
          ) : (
            completedTasks.map((t) => (
              <div key={t.id} className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">{t.title}</h4>
                  <p className="text-xs text-emerald-800">{t.description}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
