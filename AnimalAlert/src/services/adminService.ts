import { AdminSettings, AuditLog, AbuseReport, RescueCase } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

let currentSettings: AdminSettings = {
  initial_rescue_radius_km: 5.0,
  expanded_rescue_radius_km: 10.0,
  escalation_timeout_min: 5,
  volunteer_notify_radius_km: 15.0,
  duplicate_detection_radius_m: 500.0,
  duplicate_detection_time_min: 30,
};

const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    action: 'SETTINGS_UPDATE',
    actor_id: 'usr-admin-505',
    actor_name: 'Chief Admin (System)',
    details: 'Configured escalation timeout to 5 minutes and duplicate check window to 30 mins.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'log-002',
    action: 'ORG_VERIFIED',
    actor_id: 'usr-admin-505',
    actor_name: 'Chief Admin (System)',
    details: 'Verified Bay Area Wildlife & Animal Rescue Alliance credentials.',
    target_id: 'org-bay-area-rescue-01',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

const initialAbuseReports: AbuseReport[] = [
  {
    id: 'rep-01',
    reported_by: 'usr-rescuer-303',
    reported_by_name: 'Marcus Vance',
    rescue_case_id: 'case-demo-99',
    report_type: 'incorrect_info',
    description: 'Reported location was inaccurate by 2 miles.',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

let mockAuditLogs = [...initialAuditLogs];
let mockAbuseReports = [...initialAbuseReports];

export const getAdminSettings = async (): Promise<AdminSettings> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('admin_settings').select('*').single();
      if (data) {
        currentSettings = {
          initial_rescue_radius_km: data.initial_rescue_radius_km,
          expanded_rescue_radius_km: data.expanded_rescue_radius_km,
          escalation_timeout_min: data.escalation_timeout_min,
          volunteer_notify_radius_km: data.volunteer_notify_radius_km,
          duplicate_detection_radius_m: data.duplicate_detection_radius_m,
          duplicate_detection_time_min: data.duplicate_detection_time_min,
        };
      }
    } catch {
      // fallback
    }
  }
  return currentSettings;
};

export const updateAdminSettings = async (
  newSettings: AdminSettings,
  actorName: string = 'Admin'
): Promise<AdminSettings> => {
  currentSettings = { ...newSettings };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('admin_settings').upsert({ id: 1, ...newSettings });
  }

  await logAuditAction(
    'SETTINGS_UPDATE',
    'usr-admin-505',
    actorName,
    `Updated escalation thresholds & duplicate parameters.`
  );

  return currentSettings;
};

export const logAuditAction = async (
  action: string,
  actorId: string,
  actorName: string,
  details: string,
  targetId?: string
): Promise<AuditLog> => {
  const log: AuditLog = {
    id: `log-${Date.now()}`,
    action,
    actor_id: actorId,
    actor_name: actorName,
    details,
    target_id: targetId,
    created_at: new Date().toISOString(),
  };

  mockAuditLogs.unshift(log);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('audit_logs').insert([log]);
    } catch {
      // fallback
    }
  }

  return log;
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as AuditLog[];
      }
    } catch {
      // fallback
    }
  }
  return mockAuditLogs;
};

export const getAbuseReports = async (): Promise<AbuseReport[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as AbuseReport[];
      }
    } catch {
      // fallback
    }
  }
  return mockAbuseReports;
};

export const submitAbuseReport = async (
  reportData: Omit<AbuseReport, 'id' | 'status' | 'created_at'>
): Promise<AbuseReport> => {
  const newReport: AbuseReport = {
    id: `rep-${Date.now()}`,
    ...reportData,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  mockAbuseReports.unshift(newReport);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('reports').insert([newReport]);
  }

  return newReport;
};

export const handleAbuseReportAction = async (
  reportId: string,
  status: AbuseReport['status'],
  actorName: string = 'Admin'
): Promise<void> => {
  const r = mockAbuseReports.find((x) => x.id === reportId);
  if (r) {
    r.status = status;
  }

  if (isSupabaseConfigured && supabase) {
    await supabase.from('reports').update({ status }).eq('id', reportId);
  }

  await logAuditAction(
    `MODERATION_${status.toUpperCase()}`,
    'usr-admin-505',
    actorName,
    `Abuse report #${reportId} set to state ${status}.`,
    reportId
  );
};
