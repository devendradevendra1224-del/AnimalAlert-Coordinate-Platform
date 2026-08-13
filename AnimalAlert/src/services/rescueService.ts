import { 
  RescueCase, 
  CaseObservation, 
  VolunteerTask, 
  RescueMessage, 
  PriorityLevel, 
  CaseStatus,
  UserProfile 
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateDistanceKm } from './vetHospitalService';
import { getAdminSettings, logAuditAction } from './adminService';

export const INITIAL_RESCUE_CASES: RescueCase[] = [
  {
    id: 'case-1001',
    reporter_id: 'usr-reporter-101',
    reporter_name: 'Sarah Jenkins',
    reporter_phone: '+1 (555) 234-5678',
    animal_type: 'Dog',
    description: 'Injured Golden Retriever sitting near busy highway off-ramp with limp leg. Appears scared and in pain.',
    photo_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    latitude: 37.7760,
    longitude: -122.4180,
    address: 'Market St & 10th St, San Francisco, CA',
    status: 'reported',
    priority: 'CRITICAL',
    urgency_reason: 'Animal near traffic & visible injury detected',
    escalation_level: 3, // Level 3: Community Volunteers notified
    last_escalated_at: new Date(Date.now() - 300000).toISOString(),
    created_at: new Date(Date.now() - 600000).toISOString(),
    updated_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'case-1002',
    reporter_id: 'usr-reporter-101',
    reporter_name: 'Sarah Jenkins',
    reporter_phone: '+1 (555) 234-5678',
    assigned_rescuer_id: 'usr-rescuer-303',
    assigned_rescuer_name: 'Marcus Vance',
    animal_type: 'Cat',
    description: 'Tabby cat trapped on high tree branch behind community center. Meowing continuously for hours.',
    photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    latitude: 37.7680,
    longitude: -122.4220,
    address: '16th St & Valencia St, San Francisco, CA',
    status: 'in_progress',
    priority: 'HIGH',
    urgency_reason: 'Animal trapped & risk of falling',
    escalation_level: 1,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'case-1003',
    reporter_id: 'usr-reporter-101',
    reporter_name: 'Sarah Jenkins',
    assigned_organization_id: 'org-bay-area-rescue-01',
    assigned_organization_name: 'Bay Area Wildlife & Animal Rescue Alliance',
    animal_type: 'Bird',
    description: 'Injured Red-tailed Hawk with tangled wing near park bench.',
    photo_url: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=800&q=80',
    latitude: 37.7700,
    longitude: -122.4400,
    address: 'Golden Gate Park East, San Francisco, CA',
    status: 'transporting',
    priority: 'MEDIUM',
    urgency_reason: 'Wildlife unable to fly',
    escalation_level: 4, // Level 4: Organization Assigned
    hospital_id: 'vet-sf-01',
    hospital_name: 'San Francisco SPCA Veterinary Hospital',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'case-1004',
    reporter_id: 'usr-reporter-101',
    reporter_name: 'Sarah Jenkins',
    assigned_rescuer_id: 'usr-rescuer-303',
    assigned_rescuer_name: 'Marcus Vance',
    animal_type: 'Dog',
    description: 'Dehydrated stray puppy found near construction zone.',
    photo_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    latitude: 37.7800,
    longitude: -122.4100,
    address: 'Howard St & 4th St, San Francisco, CA',
    status: 'completed',
    priority: 'MEDIUM',
    escalation_level: 1,
    hospital_id: 'vet-sf-02',
    hospital_name: 'VCA San Francisco Veterinary Specialists',
    shelter_id: 'sh-sf-01',
    shelter_name: 'San Francisco Animal Care & Control',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
];

let mockCases = [...INITIAL_RESCUE_CASES];

const mockObservations: CaseObservation[] = [
  {
    id: 'obs-01',
    rescue_case_id: 'case-1001',
    user_id: 'usr-volunteer-202',
    user_name: 'Alex Rivera',
    user_role: 'volunteer',
    observation_type: 'animal_seen',
    description: 'Animal is still sitting under the tree shadow, drinking water provided by a local shop owner.',
    latitude: 37.7761,
    longitude: -122.4181,
    created_at: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: 'obs-02',
    rescue_case_id: 'case-1002',
    user_id: 'usr-rescuer-303',
    user_name: 'Marcus Vance',
    user_role: 'rescuer',
    observation_type: 'updated_location',
    description: 'Ladder secured. Ascending tree safely to rescue tabby cat.',
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
];

const mockTasks: VolunteerTask[] = [
  {
    id: 'task-01',
    rescue_case_id: 'case-1001',
    task_type: 'provide_updated_photo',
    title: 'Provide Updated Photo & Health Spot Check',
    description: 'Take a fresh clear photo from a safe distance to confirm animal position before rescue van arrives.',
    assigned_volunteer_id: 'usr-volunteer-202',
    assigned_volunteer_name: 'Alex Rivera',
    status: 'accepted',
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'task-02',
    rescue_case_id: 'case-1001',
    task_type: 'reach_hospital',
    title: 'Call Nearby Vet Clinic to Confirm Emergency Room Space',
    description: 'Contact SF SPCA Vet Hospital to check emergency intake availability for incoming Golden Retriever.',
    status: 'open',
    created_at: new Date(Date.now() - 200000).toISOString(),
  },
];

const mockMessages: RescueMessage[] = [
  {
    id: 'msg-01',
    rescue_case_id: 'case-1001',
    sender_id: 'usr-reporter-101',
    sender_name: 'Sarah Jenkins',
    sender_role: 'reporter',
    message: 'The dog moved slightly closer to the sidewalk. Still sitting calmly.',
    created_at: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: 'msg-02',
    rescue_case_id: 'case-1001',
    sender_id: 'usr-volunteer-202',
    sender_name: 'Alex Rivera',
    sender_role: 'volunteer',
    message: 'I am standing across the street keeping an eye on traffic. I brought a bowl of fresh water.',
    created_at: new Date(Date.now() - 120000).toISOString(),
  },
];

// FETCH RESCUE CASES
export const fetchRescueCases = async (userLocation?: { lat: number; lng: number }): Promise<RescueCase[]> => {
  let cases: RescueCase[] = [...mockCases];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('rescue_cases').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        cases = data as RescueCase[];
      }
    } catch {
      // fallback
    }
  }

  if (userLocation) {
    cases = cases.map((c) => ({
      ...c,
      distance_km: calculateDistanceKm(userLocation.lat, userLocation.lng, c.latitude, c.longitude),
    }));
  }

  return cases;
};

// CHECK FOR DUPLICATE REPORT (500m radius, 30 min window configurable)
export interface DuplicateCheckResult {
  isPossibleDuplicate: boolean;
  existingCase?: RescueCase;
  distanceMeters?: number;
}

export const checkForDuplicateReport = async (
  lat: number,
  lng: number,
  animalType: string
): Promise<DuplicateCheckResult> => {
  const settings = await getAdminSettings();
  const cases = await fetchRescueCases({ lat, lng });

  const thresholdMeters = settings.duplicate_detection_radius_m || 500;
  const timeWindowMs = (settings.duplicate_detection_time_min || 30) * 60 * 1000;
  const now = Date.now();

  const possibleDuplicate = cases.find((c) => {
    if (c.status === 'completed' || c.status === 'cancelled') return false;
    const distanceMeters = (c.distance_km || 0) * 1000;
    const ageMs = now - new Date(c.created_at).getTime();
    const isSameType = c.animal_type.toLowerCase() === animalType.toLowerCase();

    return distanceMeters <= thresholdMeters && ageMs <= timeWindowMs && isSameType;
  });

  if (possibleDuplicate) {
    return {
      isPossibleDuplicate: true,
      existingCase: possibleDuplicate,
      distanceMeters: Math.round((possibleDuplicate.distance_km || 0) * 1000),
    };
  }

  return { isPossibleDuplicate: false };
};

// CREATE RESCUE CASE
export const createRescueCase = async (
  reportData: Omit<RescueCase, 'id' | 'status' | 'escalation_level' | 'created_at' | 'updated_at'>,
  user?: UserProfile | null
): Promise<RescueCase> => {
  const nowIso = new Date().toISOString();
  const newCase: RescueCase = {
    id: `case-${Date.now()}`,
    ...reportData,
    reporter_id: user?.id || reportData.reporter_id || 'usr-anon',
    reporter_name: user?.full_name || reportData.reporter_name || 'Anonymous Reporter',
    reporter_phone: user?.phone || reportData.reporter_phone,
    status: 'reported',
    escalation_level: 1, // Start at Level 1: Nearby Rescuers
    last_escalated_at: nowIso,
    created_at: nowIso,
    updated_at: nowIso,
  };

  mockCases.unshift(newCase);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('rescue_cases').insert([newCase]);
    } catch (e) {
      console.warn('Supabase insert rescue error:', e);
    }
  }

  await logAuditAction(
    'CASE_CREATED',
    newCase.reporter_id,
    newCase.reporter_name || 'Reporter',
    `Reported ${newCase.priority} priority ${newCase.animal_type} rescue case.`,
    newCase.id
  );

  return newCase;
};

// ESCALATE CASE IF NEEDED
export const escalateCaseIfNeeded = async (caseId: string, targetLevel?: number): Promise<RescueCase | null> => {
  const c = mockCases.find((x) => x.id === caseId);
  if (!c) return null;

  const nextLevel = targetLevel !== undefined ? targetLevel : Math.min(5, c.escalation_level + 1);
  const nowIso = new Date().toISOString();

  c.escalation_level = nextLevel;
  c.last_escalated_at = nowIso;
  c.updated_at = nowIso;

  if (isSupabaseConfigured && supabase) {
    await supabase
      .from('rescue_cases')
      .update({
        escalation_level: nextLevel,
        last_escalated_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', caseId);
  }

  const levelNames: Record<number, string> = {
    1: 'LEVEL 1 (Nearby Rescuers)',
    2: 'LEVEL 2 (Expanded Rescuer Network)',
    3: 'LEVEL 3 (Community Volunteers)',
    4: 'LEVEL 4 (Verified Rescue Organizations)',
    5: 'LEVEL 5 (Admin Emergency Escalation)',
  };

  await logAuditAction(
    'CASE_ESCALATED',
    'system',
    'Smart Escalation Engine',
    `Escalated Case #${caseId} to ${levelNames[nextLevel] || nextLevel}.`,
    caseId
  );

  return c;
};

// UPDATE CASE STATUS
export const updateCaseStatus = async (
  caseId: string,
  status: CaseStatus,
  user?: UserProfile | null,
  additionalDetails?: { hospitalId?: string; hospitalName?: string; shelterId?: string; shelterName?: string }
): Promise<RescueCase | null> => {
  const c = mockCases.find((x) => x.id === caseId);
  if (!c) return null;

  c.status = status;
  c.updated_at = new Date().toISOString();

  if (additionalDetails?.hospitalId) {
    c.hospital_id = additionalDetails.hospitalId;
    c.hospital_name = additionalDetails.hospitalName;
  }
  if (additionalDetails?.shelterId) {
    c.shelter_id = additionalDetails.shelterId;
    c.shelter_name = additionalDetails.shelterName;
  }

  if (isSupabaseConfigured && supabase) {
    await supabase.from('rescue_cases').update({
      status,
      updated_at: c.updated_at,
      hospital_id: c.hospital_id,
      hospital_name: c.hospital_name,
      shelter_id: c.shelter_id,
      shelter_name: c.shelter_name,
    }).eq('id', caseId);
  }

  await logAuditAction(
    'STATUS_UPDATE',
    user?.id || 'usr-system',
    user?.full_name || 'User',
    `Updated Case #${caseId} status to '${status}'.`,
    caseId
  );

  return c;
};

// ASSIGN RESCUER OR ORGANIZATION
export const assignCase = async (
  caseId: string,
  assignee: { rescuerId?: string; rescuerName?: string; orgId?: string; orgName?: string },
  actor?: UserProfile | null
): Promise<RescueCase | null> => {
  const c = mockCases.find((x) => x.id === caseId);
  if (!c) return null;

  if (assignee.rescuerId) {
    c.assigned_rescuer_id = assignee.rescuerId;
    c.assigned_rescuer_name = assignee.rescuerName;
  }
  if (assignee.orgId) {
    c.assigned_organization_id = assignee.orgId;
    c.assigned_organization_name = assignee.orgName;
    c.escalation_level = Math.max(c.escalation_level, 4);
  }

  c.status = 'assigned';
  c.updated_at = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    await supabase.from('rescue_cases').update({
      assigned_rescuer_id: c.assigned_rescuer_id,
      assigned_rescuer_name: c.assigned_rescuer_name,
      assigned_organization_id: c.assigned_organization_id,
      assigned_organization_name: c.assigned_organization_name,
      status: 'assigned',
      escalation_level: c.escalation_level,
      updated_at: c.updated_at,
    }).eq('id', caseId);
  }

  await logAuditAction(
    'CASE_ASSIGNED',
    actor?.id || 'usr-system',
    actor?.full_name || 'Admin/Manager',
    `Assigned Case #${caseId} to ${assignee.rescuerName || assignee.orgName}.`,
    caseId
  );

  return c;
};

// ACCEPT RESCUE CASE WITH ATOMIC DUPLICATE CLAIM PROTECTION
export interface AcceptRescueResult {
  success: boolean;
  message?: string;
  updatedCase?: RescueCase;
}

export const acceptRescueCase = async (
  caseId: string,
  rescuer: UserProfile
): Promise<AcceptRescueResult> => {
  let currentCase = mockCases.find((x) => x.id === caseId);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('rescue_cases').select('*').eq('id', caseId).single();
      if (data) currentCase = data as RescueCase;
    } catch {
      // fallback
    }
  }

  if (!currentCase) {
    return { success: false, message: 'Rescue case not found.' };
  }

  // ATOMIC CHECK: If case is already assigned to a different rescuer
  if (
    currentCase.assigned_rescuer_id &&
    currentCase.assigned_rescuer_id !== rescuer.id &&
    currentCase.status !== 'reported'
  ) {
    return {
      success: false,
      message: `Another rescuer (${currentCase.assigned_rescuer_name || 'Assigned Rescuer'}) has already accepted this case.`,
    };
  }

  const nowIso = new Date().toISOString();
  currentCase.assigned_rescuer_id = rescuer.id;
  currentCase.assigned_rescuer_name = rescuer.full_name;
  currentCase.status = 'in_progress';
  currentCase.updated_at = nowIso;

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('rescue_cases')
        .update({
          assigned_rescuer_id: rescuer.id,
          assigned_rescuer_name: rescuer.full_name,
          status: 'in_progress',
          updated_at: nowIso,
        })
        .eq('id', caseId)
        .or(`assigned_rescuer_id.is.null,assigned_rescuer_id.eq.${rescuer.id}`);

      if (error) {
        return { success: false, message: 'Another rescuer has already accepted this case.' };
      }
    } catch (e) {
      console.warn('Supabase update accept error:', e);
    }
  }

  await logAuditAction(
    'CASE_ACCEPTED',
    rescuer.id,
    rescuer.full_name,
    `Rescuer ${rescuer.full_name} accepted Case #${caseId}.`,
    caseId
  );

  return { success: true, updatedCase: currentCase };
};

// CASE OBSERVATIONS
export const fetchCaseObservations = async (caseId: string): Promise<CaseObservation[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('case_observations')
        .select('*')
        .eq('rescue_case_id', caseId)
        .order('created_at', { ascending: false });
      if (data && data.length > 0) return data as CaseObservation[];
    } catch {
      // fallback
    }
  }
  return mockObservations.filter((o) => o.rescue_case_id === caseId);
};

export const createCaseObservation = async (
  obsData: Omit<CaseObservation, 'id' | 'created_at'>
): Promise<CaseObservation> => {
  const newObs: CaseObservation = {
    id: `obs-${Date.now()}`,
    ...obsData,
    created_at: new Date().toISOString(),
  };

  mockObservations.unshift(newObs);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('case_observations').insert([newObs]);
  }

  await logAuditAction(
    'OBSERVATION_ADDED',
    obsData.user_id,
    obsData.user_name,
    `Added observation '${obsData.observation_type}' to Case #${obsData.rescue_case_id}.`,
    obsData.rescue_case_id
  );

  return newObs;
};

// VOLUNTEER TASKS
export const fetchVolunteerTasks = async (caseId?: string): Promise<VolunteerTask[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('volunteer_tasks').select('*').order('created_at', { ascending: false });
      if (caseId) query = query.eq('rescue_case_id', caseId);
      const { data } = await query;
      if (data && data.length > 0) return data as VolunteerTask[];
    } catch {
      // fallback
    }
  }
  if (caseId) return mockTasks.filter((t) => t.rescue_case_id === caseId);
  return mockTasks;
};

export const createVolunteerTask = async (
  taskData: Omit<VolunteerTask, 'id' | 'status' | 'created_at'>
): Promise<VolunteerTask> => {
  const newTask: VolunteerTask = {
    id: `task-${Date.now()}`,
    ...taskData,
    status: 'open',
    created_at: new Date().toISOString(),
  };

  mockTasks.unshift(newTask);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('volunteer_tasks').insert([newTask]);
  }

  return newTask;
};

export const updateVolunteerTaskStatus = async (
  taskId: string,
  status: 'open' | 'accepted' | 'completed',
  volunteer?: UserProfile | null
): Promise<VolunteerTask | null> => {
  const task = mockTasks.find((t) => t.id === taskId);
  if (!task) return null;

  task.status = status;
  if (volunteer) {
    task.assigned_volunteer_id = volunteer.id;
    task.assigned_volunteer_name = volunteer.full_name;
  }

  if (isSupabaseConfigured && supabase) {
    await supabase.from('volunteer_tasks').update({
      status,
      assigned_volunteer_id: task.assigned_volunteer_id,
      assigned_volunteer_name: task.assigned_volunteer_name,
    }).eq('id', taskId);
  }

  return task;
};

// RESCUE CHAT MESSAGES
export const fetchRescueMessages = async (caseId: string): Promise<RescueMessage[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('rescue_messages')
        .select('*')
        .eq('rescue_case_id', caseId)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) return data as RescueMessage[];
    } catch {
      // fallback
    }
  }
  return mockMessages.filter((m) => m.rescue_case_id === caseId);
};

export const sendRescueMessage = async (
  msgData: Omit<RescueMessage, 'id' | 'created_at'>
): Promise<RescueMessage> => {
  const newMsg: RescueMessage = {
    id: `msg-${Date.now()}`,
    ...msgData,
    created_at: new Date().toISOString(),
  };

  mockMessages.push(newMsg);

  if (isSupabaseConfigured && supabase) {
    await supabase.from('rescue_messages').insert([newMsg]);
  }

  return newMsg;
};
