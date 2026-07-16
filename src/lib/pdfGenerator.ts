import { PDFDocument } from 'pdf-lib';
import type { LayoutResult, PageSettings } from '@/types';
import { MARGIN_MM, PAGE_DIMENSIONS_MM } from '@/types';

const MM_TO_PT = 72 / 25.4;

/**
 * Non-JPEG/PNG sources (HEIC, or anything the browser can decode but pdf-lib
 * can't embed directly) are re-encoded to a high-quality JPEG via canvas
 * before embedding, so export quality stays lossless-feeling at print size.
 */
async function ensureEmbeddableJpeg(file: File, previewUrl: string): Promise<ArrayBuffer> {
  const img = new Image();
  img.src = previewUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95),
  );
  return blob.arrayBuffer();
}

export interface GeneratePdfOptions {
  onProgress?: (fraction: number) => void;
}

export async function generatePdf(
  layout: LayoutResult,
  settings: PageSettings,
  options: GeneratePdfOptions = {},
): Promise<Blob> {
  const doc = await PDFDocument.create();
  doc.setTitle('Arrange — print-ready pages');
  doc.setProducer('Arrange');

  const base = PAGE_DIMENSIONS_MM[settings.pageSize];
  const { width: pageWidthMm, height: pageHeightMm } =
    settings.orientation === 'landscape'
      ? { width: base.height, height: base.width }
      : { width: base.width, height: base.height };
  const pageWidthPt = pageWidthMm * MM_TO_PT;
  const pageHeightPt = pageHeightMm * MM_TO_PT;

  const embeddedCache = new Map<string, Awaited<ReturnType<typeof doc.embedJpg>>>();

  let done = 0;
  const total = layout.pages.reduce((sum, p) => sum + p.images.length, 0) || 1;

  for (const page of layout.pages) {
    const pdfPage = doc.addPage([pageWidthPt, pageHeightPt]);
    const margin = marginFor(settings) * MM_TO_PT;

    for (const placed of page.images) {
      const { file, id, previewUrl } = placed.image;
      let embedded = embeddedCache.get(id);

      if (!embedded) {
        if (file.type === 'image/png') {
          embedded = await doc.embedPng(await file.arrayBuffer());
        } else if (file.type === 'image/jpeg') {
          embedded = await doc.embedJpg(await file.arrayBuffer());
        } else {
          // WEBP / HEIC / anything else: re-encode via canvas to a JPEG pdf-lib can embed.
          const jpegBytes = await ensureEmbeddableJpeg(file, previewUrl);
          embedded = await doc.embedJpg(jpegBytes);
        }
        embeddedCache.set(id, embedded);
      }

      // Layout engine's y grows downward from the top; PDF space grows
      // upward from the bottom, so flip.
      const xPt = margin + placed.x * MM_TO_PT;
      const wPt = placed.width * MM_TO_PT;
      const hPt = placed.height * MM_TO_PT;
      const yPt = pageHeightPt - margin - placed.y * MM_TO_PT - hPt;

      pdfPage.drawImage(embedded, { x: xPt, y: yPt, width: wPt, height: hPt });

      done += 1;
      options.onProgress?.(done / total);
    }
  }

  const bytes = await doc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

function marginFor(settings: PageSettings): number {
  return MARGIN_MM[settings.margin];
}
