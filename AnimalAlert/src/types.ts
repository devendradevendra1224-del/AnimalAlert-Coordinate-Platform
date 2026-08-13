export type UserRole = 'reporter' | 'volunteer' | 'rescuer' | 'admin';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CaseStatus = 
  | 'reported'
  | 'assigned'
  | 'in_progress'
  | 'transporting'
  | 'hospitalized'
  | 'sheltered'
  | 'completed'
  | 'cancelled';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_available?: boolean;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  preferred_radius_km?: number;
  verified?: boolean; // For rescuers/volunteers credentials
  organization_id?: string;
  created_at?: string;
}

export interface AdminSettings {
  initial_rescue_radius_km: number;
  expanded_rescue_radius_km: number;
  escalation_timeout_min: number;
  volunteer_notify_radius_km: number;
  duplicate_detection_radius_m: number;
  duplicate_detection_time_min: number;
}

export interface RescueCase {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reporter_phone?: string;
  assigned_rescuer_id?: string;
  assigned_rescuer_name?: string;
  assigned_organization_id?: string;
  assigned_organization_name?: string;
  animal_type: string;
  description: string;
  photo_url?: string;
  latitude: number;
  longitude: number;
  address: string;
  status: CaseStatus;
  priority: PriorityLevel;
  urgency_reason?: string;
  escalation_level: number; // 1 to 5
  last_escalated_at?: string;
  hospital_id?: string;
  hospital_name?: string;
  shelter_id?: string;
  shelter_name?: string;
  created_at: string;
  updated_at: string;
  distance_km?: number; // Calculated on client
}

export type ObservationType = 
  | 'animal_seen'
  | 'animal_moved'
  | 'animal_missing'
  | 'updated_location'
  | 'additional_photo'
  | 'danger_changed'
  | 'other';

export interface CaseObservation {
  id: string;
  rescue_case_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  observation_type: ObservationType;
  description: string;
  image_url?: string;
  photo_url?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export type VolunteerTaskType = 
  | 'locate_animal'
  | 'provide_updated_photo'
  | 'provide_updated_location'
  | 'contact_organization'
  | 'help_transport'
  | 'reach_hospital'
  | 'locate_shelter';

export interface VolunteerTask {
  id: string;
  rescue_case_id: string;
  task_type: VolunteerTaskType;
  title: string;
  description: string;
  assigned_volunteer_id?: string;
  assigned_volunteer_name?: string;
  status: 'open' | 'accepted' | 'completed';
  created_at: string;
}

export type OrgType = 'animal_rescue' | 'shelter' | 'ngo' | 'veterinary' | 'other';
export type OrgVerificationStatus = 'verified' | 'unverified' | 'suspended';

export interface RescueOrganization {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  organization_type: OrgType;
  verified: boolean;
  active: boolean;
  verification_status: OrgVerificationStatus;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  role: 'member' | 'manager' | 'admin';
  created_at: string;
}

export interface RescueMessage {
  id: string;
  rescue_case_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  message: string;
  created_at: string;
}

export interface AbuseReport {
  id: string;
  reported_by: string;
  reported_by_name?: string;
  rescue_case_id?: string;
  reported_message_id?: string;
  report_type: 'fake_rescue' | 'incorrect_info' | 'spam' | 'inappropriate_message' | 'inappropriate_content' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'restricted' | 'suspended' | 'actioned';
  created_at: string;
}

export interface NotificationPreferences {
  rescue_alerts: boolean;
  critical_alerts: boolean;
  nearby_alerts: boolean;
  case_updates: boolean;
  organization_alerts: boolean;
}

export interface VetHospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  is_24h: boolean;
  distance_km?: number;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  phone: string;
  capacity: number;
  current_occupancy: number;
  latitude: number;
  longitude: number;
}

export interface AuditLog {
  id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  details: string;
  target_id?: string;
  created_at: string;
}

export interface AIAnalysisResult {
  animal_type: string;
  confidence: number;
  injuries_detected: string[];
  environmental_dangers: string[];
  recommended_priority: PriorityLevel;
  urgency_reason: string;
  guidance_notes: string[];
}

export type AppView =
  | 'home'
  | 'report'
  | 'my-reports'
  | 'rescue-details'
  | 'case-details'
  | 'volunteer-dashboard'
  | 'volunteer-profile'
  | 'rescuer-dashboard'
  | 'organization-dashboard'
  | 'vet-finder'
  | 'shelters'
  | 'history'
  | 'live-map'
  | 'public-rescue'
  | 'admin-dashboard'
  | 'admin-rescues'
  | 'admin-escalations'
  | 'admin-unresolved'
  | 'admin-users'
  | 'admin-rescuers'
  | 'admin-shelters'
  | 'admin-analytics'
  | 'admin-map'
  | 'admin-audit'
  | 'admin-moderation'
  | 'admin-settings'
  | 'login';
