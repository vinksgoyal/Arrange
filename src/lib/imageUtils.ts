import type { ImageItem } from '@/types';

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];

export function isAcceptedImage(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  // Some browsers report an empty MIME type for HEIC — fall back to extension.
  return /\.(png|jpe?g|webp|heic|heif)$/i.test(file.name);
}

/** Reads a File into an ImageItem, decoding it once to capture its natural dimensions. */
export function loadImageItem(file: File, order: number): Promise<ImageItem> {
  return new Promise((resolve) => {
    const id = generateId();
    const previewUrl = URL.createObjectURL(file);
    const base: ImageItem = {
      id,
      file,
      previewUrl,
      name: file.name,
      width: 0,
      height: 0,
      order,
      status: 'loading',
    };

    const img = new Image();
    img.onload = () => {
      resolve({ ...base, width: img.naturalWidth, height: img.naturalHeight, status: 'ready' });
    };
    img.onerror = () => {
      resolve({ ...base, status: 'error' });
    };
    img.src = previewUrl;
  });
}

export function formatDimensions(item: ImageItem): string {
  if (item.status !== 'ready') return '—';
  return `${item.width} × ${item.height}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function revokeImageItem(item: ImageItem) {
  URL.revokeObjectURL(item.previewUrl);
}
