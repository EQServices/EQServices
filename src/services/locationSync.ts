import { supabase } from '../config/supabase';

let syncPromise: Promise<void> | null = null;

interface SyncOptions {
  force?: boolean;
  districtCode?: string;
}

export const ensureLocationsSeeded = async (options: SyncOptions = {}) => {
  if (syncPromise) {
    return syncPromise;
  }

  syncPromise = supabase.functions
    .invoke('sync-ctt-locations', {
      body: {
        force: options.force ?? false,
        districtCode: options.districtCode ?? null,
      },
    })
    .then(({ error }) => {
      if (error) {
        throw error;
      }
    })
    .finally(() => {
      syncPromise = null;
    });

  return syncPromise;
};

export const triggerLocationsRefresh = async (districtCode?: string) => {
  return ensureLocationsSeeded({ force: true, districtCode });
};

