import { degrees, PDFDocument } from 'pdf-lib';
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
        const rotation = placedImage.image.rotation ?? 0;
        const drawWidth = rotation % 180 === 0 ? widthPt : heightPt;
        const drawHeight = rotation % 180 === 0 ? heightPt : widthPt;
        const centerX = xPt + widthPt / 2;
        const centerY = pageHeight - yPt - heightPt / 2;
        
        page.drawImage(image, {
          x: centerX - drawWidth / 2,
          y: centerY - drawHeight / 2,
          width: widthPt,
          height: heightPt,
          rotate: degrees(rotation),
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
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function previewPdf(layout: LayoutResult, settings: PageSettings): Promise<string> {
  const blob = await generatePdf(layout, settings);
  return URL.createObjectURL(blob);
}

export interface ImagePdfItem {
  file: File;
  scale: number;
  previewUrl: string;
  rotation: 0 | 90 | 180 | 270;
  width: number;
  height: number;
}

export async function generateImagePdf(items: ImagePdfItem[], onProgress?: (progress: number) => void): Promise<Blob> {
  if (items.length === 0) throw new Error('No images to convert');

  const pdfDoc = await PDFDocument.create();
  const portraitWidth = 595.28;
  const portraitHeight = 841.89;
  const padding = 28;

  for (let index = 0; index < items.length; index += 1) {
    const { file, scale: sizeScale, rotation = 0 } = items[index];
    const bytes = await file.arrayBuffer();
    let image;

    if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(bytes);
    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(bytes);
    } else {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = objectUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Could not read ${file.name}`));
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not prepare image');
      context.drawImage(img, 0, 0);
      const jpegData = await fetch(canvas.toDataURL('image/jpeg', 0.92)).then((response) => response.arrayBuffer());
      image = await pdfDoc.embedJpg(jpegData);
      URL.revokeObjectURL(objectUrl);
    }

    const effectiveWidth = rotation % 180 === 0 ? image.width : image.height;
    const effectiveHeight = rotation % 180 === 0 ? image.height : image.width;
    const pageWidth = portraitWidth;
    const pageHeight = portraitHeight;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const scale = Math.min((pageWidth - padding * 2) / effectiveWidth, (pageHeight - padding * 2) / effectiveHeight) * sizeScale;
    const width = image.width * scale;
    const height = image.height * scale;
    const drawWidth = rotation % 180 === 0 ? width : height;
    const drawHeight = rotation % 180 === 0 ? height : width;
    page.drawImage(image, { x: (pageWidth - drawWidth) / 2, y: (pageHeight - drawHeight) / 2, width, height, rotate: degrees(rotation) });
    onProgress?.(Math.round(((index + 1) / items.length) * 100));
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
