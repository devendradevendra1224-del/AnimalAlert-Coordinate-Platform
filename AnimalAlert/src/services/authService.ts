import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const DEMO_REPORTER: UserProfile = {
  id: 'usr-reporter-101',
  email: 'reporter@animalalert.org',
  full_name: 'Sarah Jenkins',
  phone: '+1 (555) 234-5678',
  role: 'reporter',
  latitude: 37.7749,
  longitude: -122.4194,
  location_name: 'Downtown San Francisco',
  created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
};

export const DEMO_VOLUNTEER: UserProfile = {
  id: 'usr-volunteer-202',
  email: 'volunteer@animalalert.org',
  full_name: 'Alex Rivera',
  phone: '+1 (555) 345-6789',
  role: 'volunteer',
  is_available: true,
  latitude: 37.7780,
  longitude: -122.4150,
  location_name: 'SoMa, San Francisco',
  preferred_radius_km: 12,
  verified: false, // Community Volunteer
  created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
};

export const DEMO_RESCUER: UserProfile = {
  id: 'usr-rescuer-303',
  email: 'rescuer@animalalert.org',
  full_name: 'Marcus Vance',
  phone: '+1 (555) 876-5432',
  role: 'rescuer',
  is_available: true,
  latitude: 37.7710,
  longitude: -122.4220,
  location_name: 'Mission District',
  preferred_radius_km: 15,
  verified: true, // Verified Rescuer
  created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
};

export const DEMO_ORG_MANAGER: UserProfile = {
  id: 'usr-orgmgr-404',
  email: 'orgmanager@baypaws.org',
  full_name: 'Elena Rostova',
  phone: '+1 (555) 999-1234',
  role: 'rescuer',
  organization_id: 'org-bay-area-rescue-01',
  latitude: 37.7833,
  longitude: -122.4167,
  location_name: 'Bay Area Paws HQ',
  verified: true,
  created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
};

export const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-505',
  email: 'admin@animalalert.org',
  full_name: 'Chief Admin (System)',
  phone: '+1 (555) 000-9999',
  role: 'admin',
  latitude: 37.7749,
  longitude: -122.4194,
  location_name: 'Emergency Command Center',
  created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
};

let activeUser: UserProfile | null = DEMO_REPORTER;

export const setDemoActiveUser = async (user: UserProfile) => {
  activeUser = { ...user };
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('profiles').upsert([user]);
    } catch (e) {
      console.warn('Supabase user sync error:', e);
    }
  }
};

export const getCurrentUser = (): UserProfile | null => {
  return activeUser;
};

export const updateVolunteerProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> => {
  if (activeUser && activeUser.id === userId) {
    activeUser = { ...activeUser, ...updates };
  }

  if (isSupabaseConfigured && supabase) {
    await supabase.from('profiles').update(updates).eq('id', userId);
  }

  return activeUser || DEMO_VOLUNTEER;
};

export const toggleUserAvailability = async (
  userId: string,
  isAvailable: boolean,
  lat?: number,
  lng?: number
): Promise<boolean> => {
  const updates: Partial<UserProfile> = { is_available: isAvailable };
  if (isAvailable && lat !== undefined && lng !== undefined) {
    updates.latitude = lat;
    updates.longitude = lng;
  }

  if (activeUser && activeUser.id === userId) {
    activeUser = { ...activeUser, ...updates };
  }

  if (isSupabaseConfigured && supabase) {
    await supabase.from('profiles').update(updates).eq('id', userId);
  }

  return isAvailable;
};
