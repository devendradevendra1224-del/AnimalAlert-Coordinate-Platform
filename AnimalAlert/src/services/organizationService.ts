import { RescueOrganization, OrganizationMember, OrgVerificationStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_ORGANIZATIONS: RescueOrganization[] = [
  {
    id: 'org-bay-area-rescue-01',
    name: 'Bay Area Wildlife & Animal Rescue Alliance',
    description: '24/7 Rapid Response Wildlife & Stray Rescue Operations across SF Bay Area.',
    phone: '+1 (415) 999-7372',
    email: 'dispatch@bayarearescue.org',
    address: '500 Howard St, San Francisco, CA 94105',
    latitude: 37.7880,
    longitude: -122.3990,
    organization_type: 'animal_rescue',
    verified: true,
    active: true,
    verification_status: 'verified',
    created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
  },
  {
    id: 'org-sf-humane-02',
    name: 'San Francisco Humane Taskforce',
    description: 'Community-funded emergency animal evacuation and foster shelter network.',
    phone: '+1 (415) 555-4862',
    email: 'contact@sfhumanetaskforce.org',
    address: '1200 Van Ness Ave, San Francisco, CA 94109',
    latitude: 37.7850,
    longitude: -122.4210,
    organization_type: 'ngo',
    verified: true,
    active: true,
    verification_status: 'verified',
    created_at: new Date(Date.now() - 86400000 * 200).toISOString(),
  },
  {
    id: 'org-coastal-pet-03',
    name: 'Coastal Pet Emergency Rescuers',
    description: 'Local volunteer organization focusing on injured street animals.',
    phone: '+1 (415) 777-1122',
    email: 'help@coastalpetrescue.org',
    address: '350 Judah St, San Francisco, CA 94122',
    latitude: 37.7620,
    longitude: -122.4680,
    organization_type: 'animal_rescue',
    verified: false,
    active: true,
    verification_status: 'unverified',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

let mockOrgs = [...INITIAL_ORGANIZATIONS];

export const fetchOrganizations = async (): Promise<RescueOrganization[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('organizations').select('*');
      if (!error && data && data.length > 0) {
        return data as RescueOrganization[];
      }
    } catch {
      // fallback
    }
  }
  return mockOrgs;
};

export const createOrganization = async (
  orgData: Omit<RescueOrganization, 'id' | 'verified' | 'created_at' | 'verification_status'>
): Promise<RescueOrganization> => {
  const newOrg: RescueOrganization = {
    id: `org-${Date.now()}`,
    ...orgData,
    verified: false,
    active: true,
    verification_status: 'unverified',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('organizations').insert([newOrg]);
  } else {
    mockOrgs.unshift(newOrg);
  }

  return newOrg;
};

export const setOrganizationVerification = async (
  orgId: string,
  status: OrgVerificationStatus
): Promise<RescueOrganization | null> => {
  const verified = status === 'verified';
  const org = mockOrgs.find((o) => o.id === orgId);
  if (org) {
    org.verification_status = status;
    org.verified = verified;
  }

  if (isSupabaseConfigured && supabase) {
    await supabase
      .from('organizations')
      .update({ verification_status: status, verified })
      .eq('id', orgId);
  }

  return org || null;
};
