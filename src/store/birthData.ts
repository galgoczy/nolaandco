import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BirthData } from '@/lib/validators';

interface BirthDataStore {
  data: BirthData | null;
  setData: (data: BirthData | null) => void;
  clear: () => void;
}

export const useBirthDataStore = create<BirthDataStore>()(
  persist(
    (set) => ({
      data: null,
      setData: (data) => set({ data }),
      clear: () => set({ data: null }),
    }),
    { name: 'nola-birth-data' }
  )
);
