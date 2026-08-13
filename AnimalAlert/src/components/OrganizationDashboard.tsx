import React, { useState, useEffect } from 'react';
import { UserProfile, RescueCase, RescueOrganization } from '../types';
import { fetchRescueCases, updateCaseStatus, assignCase } from '../services/rescueService';
import { fetchOrganizations } from '../services/organizationService';
import { Building2, CheckCircle2, ShieldAlert, Clock, Users, ArrowRight, Eye, UserPlus } from 'lucide-react';

interface OrganizationDashboardProps {
  currentUser: UserProfile;
  onViewCase: (caseId: string) => void;
}

export const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({
  currentUser,
  onViewCase,
}) => {
  const [cases, setCases] = useState<RescueCase[]>([]);
  const [orgs, setOrgs] = useState<RescueOrganization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<RescueOrganization | null>(null);

  useEffect(() => {
    loadOrgData();
  }, [currentUser]);

  const loadOrgData = async () => {
    const allCases = await fetchRescueCases();
    const allOrgs = await fetchOrganizations();

    setCases(allCases);
    setOrgs(allOrgs);

    const myOrg = allOrgs.find((o) => o.id === currentUser.organization_id) || allOrgs[0];
    setSelectedOrg(myOrg || null);
  };

  const activeAlerts = cases.filter((c) => c.status === 'reported' || c.escalation_level >= 4);
  const assignedCases = cases.filter((c) => c.assigned_organization_id === selectedOrg?.id && c.status !== 'completed');
  const completedCases = cases.filter((c) => c.assigned_organization_id === selectedOrg?.id && c.status === 'completed');

  const handleAcceptCase = async (caseId: string) => {
    if (!selectedOrg) return;
    await assignCase(
      caseId,
      { orgId: selectedOrg.id, orgName: selectedOrg.name },
      currentUser
    );
    await loadOrgData();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-2 text-indigo-200 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Building2 className="w-4 h-4" />
          <span>Rescue Organization Command Center</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {selectedOrg?.name || 'Rescue Organization'}
              </h1>
              {selectedOrg?.verified && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400 text-slate-950 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Rescue Organization</span>
                </span>
              )}
            </div>
            <p className="text-sm text-indigo-100 mt-1 font-medium max-w-2xl">
              {selectedOrg?.description || 'Registered NGO & Rescue Network Operations'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs font-mono shrink-0">
            <span className="text-indigo-200 block">Dispatch Phone:</span>
            <strong className="text-white text-sm">{selectedOrg?.phone || '+1 (415) 999-7372'}</strong>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase font-mono">Active Alerts</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{activeAlerts.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase font-mono">Assigned Cases</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{assignedCases.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase font-mono">Completed Rescues</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{completedCases.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase font-mono">Avg Response Speed</span>
          <p className="text-2xl font-black text-sky-600 mt-1">4.2 min</p>
        </div>
      </div>

      {/* ACTIVE RESCUE ALERTS LIST */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>Active Rescue Alerts Requiring Dispatch</span>
          <span className="text-xs font-mono font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
            {activeAlerts.length} Alerts
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeAlerts.map((c) => (
            <div
              key={c.id}
              className="border border-slate-200 rounded-2xl p-5 space-y-3 hover:border-indigo-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
                    CASE #{c.id}
                  </span>
                  <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    Level {c.escalation_level} Escalation
                  </span>
                </div>

                <h4 className="font-extrabold text-slate-900 text-base">{c.animal_type}</h4>
                <p className="text-xs text-slate-600 font-medium line-clamp-2">{c.description}</p>
                <p className="text-xs text-slate-500 font-mono">Address: {c.address}</p>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onViewCase(c.id)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>VIEW DETAILS</span>
                </button>

                <button
                  onClick={() => handleAcceptCase(c.id)}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>ACCEPT CASE FOR ORG</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
