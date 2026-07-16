import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Dropzone } from '@/features/upload/Dropzone';
import { ImageGrid } from '@/features/preview/ImageGrid';
import { SettingsPanel } from '@/features/settings/SettingsPanel';
import { PdfPreview } from '@/features/pdf/PdfPreview';
import { DownloadButton } from '@/features/pdf/DownloadButton';

export function Workspace() {
  const images = useAppStore((s) => s.images);
  const removeImages = useAppStore((s) => s.removeImages);
  const selectedIds = useAppStore((s) => s.selectedIds);
  const clearSelection = useAppStore((s) => s.clearSelection);

  // Keyboard shortcuts: Delete removes selection, Escape clears it.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        e.preventDefault();
        removeImages(Array.from(selectedIds));
      }
      if (e.key === 'Escape') {
        clearSelection();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIds, removeImages, clearSelection]);

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-5 py-6 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-6">
        <Dropzone compact />
        {images.length > 0 && <ImageGrid />}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-20 lg:h-[calc(100vh-96px)]">
        {/* Fixed: Settings panel card */}
        <div className="rounded-2xl border border-border bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
          <SettingsPanel />
        </div>

        {/* Fixed: Preview card */}
        <div className="flex flex-1 flex-col rounded-2xl border border-border bg-white p-5 dark:border-dark-border dark:bg-dark-surface">
          <h3 className="mb-3 text-sm font-semibold text-ink dark:text-white">Preview</h3>
          <div className="min-h-[280px] flex-1">
            <PdfPreview />
          </div>
          <div className="mt-4">
            <DownloadButton />
          </div>
        </div>
      </aside>
    </div>
  );
}
