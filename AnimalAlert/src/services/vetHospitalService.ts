import { VetHospital } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_HOSPITALS: VetHospital[] = [
  {
    id: 'vet-sf-01',
    name: 'San Francisco SPCA Veterinary Hospital',
    address: '201 Ala' + 'meda St, San Francisco, CA 94103',
    phone: '+1 (415) 554-3000',
    latitude: 37.7688,
    longitude: -122.4132,
    is_24h: true,
  },
  {
    id: 'vet-sf-02',
    name: 'VCA San Francisco Veterinary Specialists',
    address: '600 Ala' + 'bama St, San Francisco, CA 94110',
    phone: '+1 (415) 552-9110',
    latitude: 37.7628,
    longitude: -122.4119,
    is_24h: true,
  },
  {
    id: 'vet-sf-03',
    name: 'Mission Pet Hospital',
    address: '720 Valencia St, San Francisco, CA 94110',
    phone: '+1 (415) 552-1969',
    latitude: 37.7612,
    longitude: -122.4215,
    is_24h: false,
  },
  {
    id: 'vet-sf-04',
    name: 'Emergency Animal Clinic Bay Area',
    address: '1333 Bush St, San Francisco, CA 94109',
    phone: '+1 (415) 474-3200',
    latitude: 37.7885,
    longitude: -122.4188,
    is_24h: true,
  },
];

export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export const fetchNearbyVetHospitals = async (
  userLat: number = 37.7749,
  userLng: number = -122.4194
): Promise<VetHospital[]> => {
  let hospitals: VetHospital[] = [...INITIAL_HOSPITALS];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('vet_hospitals').select('*');
      if (!error && data && data.length > 0) {
        hospitals = data as VetHospital[];
      }
    } catch {
      // fallback
    }
  }

  return hospitals
    .map((h) => ({
      ...h,
      distance_km: calculateDistanceKm(userLat, userLng, h.latitude, h.longitude),
    }))
    .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
};
