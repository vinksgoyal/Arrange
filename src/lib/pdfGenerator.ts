import { PDFDocument } from 'pdf-lib';
import { LayoutResult, PageSettings, MARGIN_MM, PAGE_DIMENSIONS_MM } from '@/types';

export async function generatePdf(
  layout: LayoutResult,
  settings: PageSettings,
  options?: { onProgress?: (progress: number) => void }
): Promise<Blob> {
  if (!layout || !layout.pages || layout.pages.length === 0) {
    throw new Error('No pages to generate PDF');
  }

  const pdfDoc = await PDFDocument.create();
  
  const pageSize = PAGE_DIMENSIONS_MM[settings.pageSize];
  const pageWidthMM = settings.orientation === 'portrait' ? pageSize.width : pageSize.height;
  const pageHeightMM = settings.orientation === 'portrait' ? pageSize.height : pageSize.width;
  
  const pageWidthPt = pageWidthMM * 2.83465;
  const pageHeightPt = pageHeightMM * 2.83465;
  const marginMM = MARGIN_MM[settings.margin];
  
  let processed = 0;
  const totalPages = layout.pages.length;

  for (const pageData of layout.pages) {
    if (options?.onProgress) {
      processed++;
      options.onProgress(Math.round((processed / totalPages) * 100));
    }

    const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
    const { height: pageHeight } = page.getSize();

    for (const placedImage of pageData.images) {
      try {
        const response = await fetch(placedImage.image.previewUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        let image;
        if (blob.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else if (blob.type === 'image/jpeg' || blob.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else {
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');
          
          ctx.drawImage(img, 0, 0);
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const base64Data = jpegDataUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          image = await pdfDoc.embedJpg(bytes.buffer);
          URL.revokeObjectURL(img.src);
        }

        const xPt = (placedImage.x + marginMM) * 2.83465;
        const yPt = (placedImage.y + marginMM) * 2.83465;
        const widthPt = placedImage.width * 2.83465;
        const heightPt = placedImage.height * 2.83465;
        
        page.drawImage(image, {
          x: xPt,
          y: pageHeight - yPt - heightPt,
          width: widthPt,
          height: heightPt,
        });
        
      } catch (error) {
        console.error('Error processing image:', placedImage.image.id, error);
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  // Convert Uint8Array to ArrayBuffer and create blob
  const buffer = pdfBytes.buffer as ArrayBuffer;
  return new Blob([buffer], { type: 'application/pdf' });
}

export function downloadPdf(blob: Blob, filename: string = 'arranged.pdf'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function previewPdf(layout: LayoutResult, settings: PageSettings): Promise<string> {
  const blob = await generatePdf(layout, settings);
  return URL.createObjectURL(blob);
}
