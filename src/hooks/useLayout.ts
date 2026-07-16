import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { computeLayout } from '@/lib/layoutEngine';

export function useLayout() {
  const images = useAppStore((s) => s.images);
  const settings = useAppStore((s) => s.settings);

  const sorted = useMemo(() => [...images].sort((a, b) => a.order - b.order), [images]);

  return useMemo(() => computeLayout(sorted, settings), [sorted, settings]);
}
