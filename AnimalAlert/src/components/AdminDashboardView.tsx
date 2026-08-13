
import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  RescueCase, 
  RescueOrganization, 
  AdminSettings, 
  AuditLog, 
  AbuseReport 
} from '../types';
import { fetchRescueCases, escalateCaseIfNeeded } from '../services/rescueService';
import { fetchOrganizations, setOrganizationVerification } from '../services/organizationService';
import { 
  getAdminSettings, 
  updateAdminSettings, 
  getAuditLogs, 
  getAbuseReports, 
  handleAbuseReportAction 
} from '../services/adminService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  ShieldAlert, 
  Clock, 
  Users, 
  Building2, 
  Settings, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Sliders, 
  Eye, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardViewProps {
  currentUser: UserProfile;
  onViewCase: (caseId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onViewCase,
}) => {
  const [activeTab, setActiveTab] = useState<'escalations' | 'analytics' | 'orgs' | 'moderation' | 'settings' | 'audit'>('escalations');

  const [cases, setCases] = useState<RescueCase[]>([]);
  const [orgs, setOrgs] = useState<RescueOrganization[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [abuseReports, setAbuseReports] = useState<AbuseReport[]>([]);

  // Settings form local state
  const [initRadius, setInitRadius] = useState(5);
  const [expRadius, setExpRadius] = useState(10);
  const [timeoutMin, setTimeoutMin] = useState(5);
  const [volRadius, setVolRadius] = useState(15);
  const [dupRadius, setDupRadius] = useState(500);
  const [dupTime, setDupTime] = useState(30);
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const cData = await fetchRescueCases();
    const oData = await fetchOrganizations();
    const sData = await getAdminSettings();
    const lData = await getAuditLogs();
    const rData = await getAbuseReports();

    setCases(cData);
    setOrgs(oData);
    setSettings(sData);
    setAuditLogs(lData);
    setAbuseReports(rData);

    if (sData) {
      setInitRadius(sData.initial_rescue_radius_km);
      setExpRadius(sData.expanded_rescue_radius_km);
      setTimeoutMin(sData.escalation_timeout_min);
      setVolRadius(sData.volunteer_notify_radius_km);
      setDupRadius(sData.duplicate_detection_radius_m);
      setDupTime(sData.duplicate_detection_time_min);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await updateAdminSettings(
      {
        initial_rescue_radius_km: initRadius,
        expanded_rescue_radius_km: expRadius,
        escalation_timeout_min: timeoutMin,
        volunteer_notify_radius_km: volRadius,
        duplicate_detection_radius_m: dupRadius,
        duplicate_detection_time_min: dupTime,
      },
      currentUser.full_name
    );
    setSettings(updated);
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 3000);
    await loadAdminData();
  };

  const handleVerifyOrg = async (orgId: string, status: 'verified' | 'suspended' | 'unverified') => {
    await setOrganizationVerification(orgId, status);
    await loadAdminData();
  };

  const handleModeration = async (reportId: string, status: 'reviewed' | 'dismissed' | 'actioned') => {
    await handleAbuseReportAction(reportId, status, currentUser.full_name);
    await loadAdminData();
  };

  // Analytics data prep
  const escalationData = [
    { name: 'Level 1', count: cases.filter((c) => c.escalation_level === 1).length },
    { name: 'Level 2', count: cases.filter((c) => c.escalation_level === 2).length },
    { name: 'Level 3', count: cases.filter((c) => c.escalation_level === 3).length },
    { name: 'Level 4', count: cases.filter((c) => c.escalation_level === 4).length },
    { name: 'Level 5', count: cases.filter((c) => c.escalation_level === 5).length },
  ];

  const priorityData = [
    { name: 'CRITICAL', value: cases.filter((c) => c.priority === 'CRITICAL').length, color: '#e11d48' },
    { name: 'HIGH', value: cases.filter((c) => c.priority === 'HIGH').length, color: '#f97316' },
    { name: 'MEDIUM', value: cases.filter((c) => c.priority === 'MEDIUM').length, color: '#f59e0b' },
    { name: 'LOW', value: cases.filter((c) => c.priority === 'LOW').length, color: '#64748b' },
  ];

  const escalatedCases = cases.filter((c) => c.escalation_level >= 3 && c.status !== 'completed');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>AnimalAlert Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Administration & Analytics
          </h1>
          <p className="text-sm text-purple-200 mt-1 font-medium">
            Smart escalation controls, org verification, abuse moderation & audit logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REFRESH DATA</span>
        </button>
      </div>

      {/* ADMIN TABS */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'escalations', label: `Escalations (${escalatedCases.length})`, icon: ShieldAlert },
          { id: 'analytics', label: 'Analytics & Metrics', icon: TrendingUp },
          { id: 'orgs', label: `Organizations (${orgs.length})`, icon: Building2 },
          { id: 'moderation', label: `Moderation (${abuseReports.length})`, icon: AlertTriangle },
          { id: 'settings', label: 'Escalation Settings', icon: Sliders },
          { id: 'audit', label: 'Audit Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ESCALATIONS */}
      {activeTab === 'escalations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>🚨 Active Escalated Rescue Cases (Level 3+)</span>
              <span className="text-xs font-mono font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                {escalatedCases.length} Critical Escalations
              </span>
            </h3>

            {escalatedCases.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No escalated cases pending right now.</p>
            ) : (
              <div className="space-y-3">
                {escalatedCases.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded border border-rose-200">
                          CASE #{c.id}
                        </span>
                        <span className="text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                          LEVEL {c.escalation_level} ESCALATION
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900">{c.animal_type}: {c.description}</h4>
                      <p className="text-xs text-slate-600 font-mono">Location: {c.address}</p>
                    </div>

                    <button
                      onClick={() => onViewCase(c.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                    >
                      OPEN COMMAND VIEW
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Escalation Level Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={escalationData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Priority Breakdown</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZATIONS VERIFICATION */}
      {activeTab === 'orgs' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Rescue Organization Verification Management
          </h3>

          <div className="space-y-3">
            {orgs.map((o) => (
              <div
                key={o.id}
                className="p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-slate-900 text-base">{o.name}</h4>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        o.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {o.verification_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{o.description}</p>
                  <p className="text-xs font-mono text-slate-400">Phone: {o.phone} • Email: {o.email}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVerifyOrg(o.id, 'verified')}
                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700"
                  >
                    VERIFY ORG
                  </button>
                  <button
                    onClick={() => handleVerifyOrg(o.id, 'suspended')}
                    className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700"
                  >
                    SUSPEND ORG
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MODERATION */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Abuse Reports & Moderation Queue
          </h3>

          <div className="space-y-3">
            {abuseReports.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No pending abuse reports.</p>
            ) : (
              abuseReports.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-amber-900">Report #{r.id} ({r.report_type})</span>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold uppercase">{r.status}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium">{r.description}</p>

                  <div className="flex items-center space-x-2 pt-2 border-t border-amber-200/60">
                    <button
                      onClick={() => handleModeration(r.id, 'dismissed')}
                      className="px-3 py-1 bg-slate-200 text-slate-800 font-bold text-xs rounded-lg"
                    >
                      DISMISS
                    </button>
                    <button
                      onClick={() => handleModeration(r.id, 'actioned')}
                      className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-lg"
                    >
                      RESTRICT USER / ACTION
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Smart Escalation & Radius Configuration
          </h3>

          {savedSettingsMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
              ✓ Admin settings saved and logged to audit trail.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase font-mono">Initial Rescue Radius (km)</label>
              <input
                type="number"
                value={initRadius}
                onChange={(e) => setInitRadius(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase font-mono">Expanded Rescue Radius (km)</label>
              <input
                type="number"
                value={expRadius}
                onChange={(e) => setExpRadius(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase font-mono">Escalation Timeout (minutes)</label>
              <input
                type="number"
                value={timeoutMin}
                onChange={(e) => setTimeoutMin(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase font-mono">Volunteer Notify Radius (km)</label>
              <input
                type="number"
                value={volRadius}
                onChange={(e) => setVolRadius(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase font-mono">Duplicate Detection Radius (meters)</label>
              <input
                type="number"
                value={dupRadius}
                onChange={(e) => setDupRadius(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase font-mono">Duplicate Window (minutes)</label>
              <input
                type="number"
                value={dupTime}
                onChange={(e) => setDupTime(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white font-extrabold text-xs rounded-xl hover:bg-purple-700 shadow-md"
          >
            SAVE ESCALATION PARAMETERS
          </button>
        </form>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            System Audit Trail
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span className="font-bold text-purple-700">{log.action}</span>
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <p className="text-slate-800 font-medium">{log.details}</p>
                <span className="text-[10px] text-slate-400">Actor: {log.actor_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
