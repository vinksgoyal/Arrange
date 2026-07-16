import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useLayout } from '@/hooks/useLayout';
import { PAGE_DIMENSIONS_MM } from '@/types';
import { Button } from '@/components/ui/Button';

const BASE_PX_PER_MM = 2.5;

export function PdfPreview() {
  const settings = useAppStore((s) => s.settings);
  const layout = useLayout();
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const base = PAGE_DIMENSIONS_MM[settings.pageSize];
  const { width: pageWidthMm, height: pageHeightMm } =
    settings.orientation === 'landscape'
      ? { width: base.height, height: base.width }
      : { width: base.width, height: base.height };

  const activeIndex = Math.min(pageIndex, Math.max(layout.pages.length - 1, 0));
  const page = layout.pages[activeIndex];
  const pxPerMm = BASE_PX_PER_MM * zoom;

  if (layout.pages.length === 0) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-border text-sm text-ink-faint dark:border-dark-border">
        Add images to see a preview
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <span className="min-w-[80px] text-center text-xs text-ink-muted">
            Page {activeIndex + 1} of {layout.pages.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPageIndex((p) => Math.min(layout.pages.length - 1, p + 1))}
            disabled={activeIndex === layout.pages.length - 1}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <span className="w-10 text-center text-xs text-ink-muted">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={() => setZoom((z) => Math.min(2, z + 0.15))} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto rounded-2xl bg-surface-muted p-6 dark:bg-white/[0.03]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative shrink-0 bg-white shadow-pop"
            style={{ width: pageWidthMm * pxPerMm, height: pageHeightMm * pxPerMm }}
          >
            {page.images.map((placed) => (
              <img
                key={placed.image.id}
                src={placed.image.previewUrl}
                alt=""
                className="absolute object-contain"
                style={{
                  left: placed.x * pxPerMm,
                  top: placed.y * pxPerMm,
                  width: placed.width * pxPerMm,
                  height: placed.height * pxPerMm,
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-2 text-center text-[11px] text-ink-faint">
        {Math.round(layout.coverage * 100)}% of paper used across {layout.pages.length} page
        {layout.pages.length === 1 ? '' : 's'}
      </p>
    </div>
  );
}
