import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ImageItem, PageSettings } from '@/types';
import { revokeImageItem } from '@/lib/imageUtils';

const DEFAULT_SETTINGS: PageSettings = {
  pageSize: 'A4',
  orientation: 'portrait',
  margin: 'medium',
  spacing: 4,
  density: 'balanced',
};

interface AppState {
  images: ImageItem[];
  settings: PageSettings;
  selectedIds: Set<string>;
  isDarkMode: boolean;
  lastRemoved: ImageItem[] | null;

  addImages: (items: ImageItem[]) => void;
  updateImage: (id: string, patch: Partial<ImageItem>) => void;
  removeImages: (ids: string[]) => void;
  undoRemove: () => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  clearAll: () => void;

  toggleSelected: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  updateSettings: (patch: Partial<PageSettings>) => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      images: [],
      settings: DEFAULT_SETTINGS,
      selectedIds: new Set(),
      isDarkMode: false,
      lastRemoved: null,

      addImages: (items) =>
        set((state) => ({ images: [...state.images, ...items] })),

      updateImage: (id, patch) =>
        set((state) => ({
          images: state.images.map((img) => (img.id === id ? { ...img, ...patch } : img)),
        })),

      removeImages: (ids) =>
        set((state) => {
          const idSet = new Set(ids);
          const removed = state.images.filter((img) => idSet.has(img.id));
          const remaining = new Set(state.selectedIds);
          ids.forEach((id) => remaining.delete(id));
          return {
            images: state.images.filter((img) => !idSet.has(img.id)),
            selectedIds: remaining,
            lastRemoved: removed,
          };
        }),

      undoRemove: () =>
        set((state) => {
          if (!state.lastRemoved) return state;
          return { images: [...state.images, ...state.lastRemoved], lastRemoved: null };
        }),

      reorderImages: (fromIndex, toIndex) =>
        set((state) => {
          const next = [...state.images];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return { images: next.map((img, i) => ({ ...img, order: i })) };
        }),

      clearAll: () =>
        set((state) => {
          state.images.forEach(revokeImageItem);
          return { images: [], selectedIds: new Set() };
        }),

      toggleSelected: (id) =>
        set((state) => {
          const next = new Set(state.selectedIds);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { selectedIds: next };
        }),

      selectAll: () => set((state) => ({ selectedIds: new Set(state.images.map((i) => i.id)) })),

      clearSelection: () => set({ selectedIds: new Set() }),

      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'arrange-settings',
      partialize: (state) => ({ settings: state.settings, isDarkMode: state.isDarkMode }),
    },
  ),
);
