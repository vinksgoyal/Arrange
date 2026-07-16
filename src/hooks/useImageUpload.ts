import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/store/useAppStore';
import { isAcceptedImage, loadImageItem } from '@/lib/imageUtils';

export function useImageUpload() {
  const addImages = useAppStore((s) => s.addImages);
  const currentCount = useAppStore((s) => s.images.length);
  const [isImporting, setIsImporting] = useState(false);

  const importFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      const accepted = list.filter(isAcceptedImage);
      const rejected = list.length - accepted.length;

      if (accepted.length === 0) {
        if (rejected > 0) toast.error('Those files are not supported images (PNG, JPEG, WEBP, HEIC).');
        return;
      }

      setIsImporting(true);
      const startOrder = currentCount;
      try {
        // Decode in small batches so the UI stays responsive on large drops.
        const items = [];
        const BATCH = 12;
        for (let i = 0; i < accepted.length; i += BATCH) {
          const batch = accepted.slice(i, i + BATCH);
          const loaded = await Promise.all(batch.map((f, j) => loadImageItem(f, startOrder + i + j)));
          items.push(...loaded);
          addImages(loaded);
        }
        const failed = items.filter((i) => i.status === 'error').length;
        if (failed > 0) toast.error(`${failed} image${failed > 1 ? 's' : ''} could not be read.`);
        if (rejected > 0) toast(`Skipped ${rejected} unsupported file${rejected > 1 ? 's' : ''}.`);
        toast.success(`Added ${accepted.length - failed} image${accepted.length - failed === 1 ? '' : 's'}.`);
      } finally {
        setIsImporting(false);
      }
    },
    [addImages, currentCount],
  );

  return { importFiles, isImporting };
}
