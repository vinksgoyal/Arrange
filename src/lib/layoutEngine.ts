import {
  DENSITY_TARGET_ROW_MM,
  MARGIN_MM,
  PAGE_DIMENSIONS_MM,
  type ImageItem,
  type LayoutPage,
  type LayoutResult,
  type PageSettings,
  type PlacedImage,
} from '@/types';

/**
 * Layout engine
 * -------------
 * Images are packed using a "justified row" strategy — the same idea used by
 * dense photo-gallery layouts (Flickr / Google Photos justified grids), adapted
 * to paginate onto fixed A4/Letter/Legal sheets.
 *
 * Why rows, not a generic rectangle bin-packer: preserving *every* image's
 * aspect ratio (no crop, no stretch) means the only real degree of freedom is
 * the scale applied to each image. Grouping images into a row and solving for
 * the single row height that makes the row's scaled widths sum exactly to the
 * usable page width uses that degree of freedom fully — every row reaches the
 * paper's edges with zero wasted horizontal space, and only the last, partial
 * row of each page can fall short of the full width.
 *
 * Steps:
 *  1. Work out usable content width/height in mm from page size + margins.
 *  2. Greedily accumulate images into a row until the row, if scaled to the
 *     density's target height, would overflow the content width — then solve
 *     for the exact height that makes it fit perfectly (or leave the final,
 *     naturally-short row at target height rather than stretching it huge).
 *  3. Stack rows down the page; start a new page once a row would overflow
 *     the content height.
 */

function usableContentSizeMm(settings: PageSettings) {
  const base = PAGE_DIMENSIONS_MM[settings.pageSize];
  const { width, height } =
    settings.orientation === 'landscape'
      ? { width: base.height, height: base.width }
      : { width: base.width, height: base.height };
  const margin = MARGIN_MM[settings.margin];
  return {
    contentWidth: width - margin * 2,
    contentHeight: height - margin * 2,
    margin,
  };
}

/** Solve the row height that makes a set of images' scaled widths, plus spacing, equal targetWidth. */
function solveRowHeight(images: ImageItem[], targetWidth: number, spacing: number): number {
  const totalSpacing = spacing * Math.max(0, images.length - 1);
  const sumAspect = images.reduce((sum, img) => sum + img.width / img.height, 0);
  // sum(height * aspect_i) + totalSpacing = targetWidth  =>  height = (targetWidth - totalSpacing) / sumAspect
  const availableWidth = Math.max(targetWidth - totalSpacing, 1);
  return availableWidth / sumAspect;
}

function rowWidthAtHeight(images: ImageItem[], height: number, spacing: number): number {
  const totalSpacing = spacing * Math.max(0, images.length - 1);
  const imagesWidth = images.reduce((sum, img) => sum + (img.width / img.height) * height, 0);
  return imagesWidth + totalSpacing;
}

interface Row {
  images: ImageItem[];
  height: number;
}

/**
 * Groups images into justified rows for a page of usable width `contentWidth`.
 * Uses a target row height as the density lever, growing rows until adding
 * one more image would overflow the width more than it would underflow it.
 */
function buildRows(images: ImageItem[], contentWidth: number, spacing: number, targetHeight: number): Row[] {
  const rows: Row[] = [];
  let current: ImageItem[] = [];

  const commitRow = () => {
    if (current.length === 0) return;
    // Natural width if every image in the row were rendered at targetHeight.
    const naturalWidth = rowWidthAtHeight(current, targetHeight, spacing);

    // A row that reaches (or exceeds) the full width at target height gets
    // scaled down to land exactly on the edge — zero horizontal waste. A row
    // that falls short (typically only the final, trailing row of the whole
    // set) is left at target height rather than stretched to fill the width,
    // which would blow it up into an unintended hero image.
    const height = naturalWidth >= contentWidth ? solveRowHeight(current, contentWidth, spacing) : targetHeight;
    rows.push({ images: current, height });
    current = [];
  };

  for (const img of images) {
    current.push(img);
    const naturalWidth = rowWidthAtHeight(current, targetHeight, spacing);
    if (naturalWidth >= contentWidth) {
      commitRow();
    }
  }
  commitRow();

  return rows;
}

/** Lay out a single page's worth of rows, top to bottom, splitting once height overflows. */
function paginateRows(rows: Row[], contentHeight: number, spacing: number): Row[][] {
  const pages: Row[][] = [];
  let current: Row[] = [];
  let usedHeight = 0;

  for (const row of rows) {
    const additional = current.length === 0 ? row.height : spacing + row.height;
    if (usedHeight + additional > contentHeight && current.length > 0) {
      pages.push(current);
      current = [row];
      usedHeight = row.height;
    } else {
      current.push(row);
      usedHeight += additional;
    }
  }
  if (current.length > 0) pages.push(current);
  return pages;
}

export function computeLayout(images: ImageItem[], settings: PageSettings): LayoutResult {
  const ready = images.filter((img) => img.status === 'ready');
  if (ready.length === 0) return { pages: [], coverage: 0 };

  const { contentWidth, contentHeight } = usableContentSizeMm(settings);
  const spacingMm = settings.spacing;
  const targetHeight = Math.min(DENSITY_TARGET_ROW_MM[settings.density], contentHeight);

  const rows = buildRows(ready, contentWidth, spacingMm, targetHeight);
  const pagesOfRows = paginateRows(rows, contentHeight, spacingMm);

  let totalArea = 0;
  const printableArea = contentWidth * contentHeight * pagesOfRows.length;

  const pages: LayoutPage[] = pagesOfRows.map((rowsOnPage, pageIndex) => {
    let y = 0;
    const placed: PlacedImage[] = [];
    for (const row of rowsOnPage) {
      let x = 0;
      for (const img of row.images) {
        const width = (img.width / img.height) * row.height;
        placed.push({ image: img, x, y, width, height: row.height });
        totalArea += width * row.height;
        x += width + spacingMm;
      }
      y += row.height + spacingMm;
    }
    return { pageNumber: pageIndex + 1, images: placed };
  });

  return { pages, coverage: printableArea > 0 ? totalArea / printableArea : 0 };
}

export { usableContentSizeMm };
