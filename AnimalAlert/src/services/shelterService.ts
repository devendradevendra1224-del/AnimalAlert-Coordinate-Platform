import { Shelter } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'sh-sf-01',
    name: 'San Francisco Animal Care & Control',
    address: '1418 Bryant St, San Francisco, CA 94103',
    phone: '+1 (415) 554-6364',
    capacity: 120,
    current_occupancy: 78,
    latitude: 37.7695,
    longitude: -122.4111,
  },
  {
    id: 'sh-sf-02',
    name: 'Muttville Senior Dog Rescue Shelter',
    address: '255 Ala' + 'mony St, San Francisco, CA 94103',
    phone: '+1 (415) 272-4172',
    capacity: 45,
    current_occupancy: 32,
    latitude: 37.7680,
    longitude: -122.4140,
  },
  {
    id: 'sh-sf-03',
    name: 'Bay Area Feline Haven & Foster Network',
    address: '888 Mission St, San Francisco, CA 94103',
    phone: '+1 (415) 300-8800',
    capacity: 80,
    current_occupancy: 54,
    latitude: 37.7820,
    longitude: -122.4060,
  },
];

export const fetchShelters = async (): Promise<Shelter[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('shelters').select('*');
      if (!error && data && data.length > 0) {
        return data as Shelter[];
      }
    } catch {
      // fallback
    }
  }
  return INITIAL_SHELTERS;
};

export const createShelter = async (shelterData: Omit<Shelter, 'id'>): Promise<Shelter> => {
  const newShelter: Shelter = {
    id: `sh-${Date.now()}`,
    ...shelterData,
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('shelters').insert([newShelter]);
  } else {
    INITIAL_SHELTERS.push(newShelter);
  }

  return newShelter;
};
