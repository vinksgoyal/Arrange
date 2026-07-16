/** A single image the user has added to the workspace. */
export interface ImageItem {
  id: string;
  file: File;
  /** Object URL used for on-screen thumbnails / layout preview. */
  previewUrl: string;
  name: string;
  /** Natural pixel dimensions, read once the image has decoded. */
  width: number;
  height: number;
  /** Order the user has arranged the image in (drag-reorder). */
  order: number;
  status: 'loading' | 'ready' | 'error';
}

export type PageSize = 'A4' | 'Letter' | 'Legal';
export type Orientation = 'portrait' | 'landscape';
export type MarginSize = 'small' | 'medium' | 'large';
export type Spacing = 2 | 4 | 6 | 8;
export type Density = 'large' | 'balanced' | 'saving';

export interface PageSettings {
  pageSize: PageSize;
  orientation: Orientation;
  margin: MarginSize;
  spacing: Spacing;
  density: Density;
}

/** Physical page dimensions in millimetres, before margins are applied. */
export const PAGE_DIMENSIONS_MM: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
};

export const MARGIN_MM: Record<MarginSize, number> = {
  small: 8,
  medium: 14,
  large: 22,
};

/** Target row height (mm) per density setting — the lever the packing engine tunes. */
export const DENSITY_TARGET_ROW_MM: Record<Density, number> = {
  large: 95,
  balanced: 65,
  saving: 45,
};

/** A single positioned image, ready to be drawn onto a page. */
export interface PlacedImage {
  image: ImageItem;
  /** Position and size in millimetres, relative to the page's top-left content origin. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutPage {
  pageNumber: number;
  images: PlacedImage[];
}

export interface LayoutResult {
  pages: LayoutPage[];
  /** Fraction of total printable area covered by images, 0–1, across all pages. */
  coverage: number;
}
