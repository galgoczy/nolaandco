import { create } from 'zustand';

/**
 * A termékoldalon éppen választott párnaváltozat (nem perzisztált). A
 * változatválasztó állítja, a leírások ennek megfelelően váltanak.
 * null: még nem állította be a választó (ilyenkor a szerver kezdőértéke él).
 */
export const usePillowVariantStore = create<{
  weighted: boolean | null;
  setWeighted: (weighted: boolean | null) => void;
}>((set) => ({
  weighted: null,
  setWeighted: (weighted) => set({ weighted }),
}));
