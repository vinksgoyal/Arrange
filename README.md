# Arrange

Drop in a pile of images, get back a print-ready A4 (or Letter/Legal) PDF —
every image fully visible, aspect ratio intact, minimal wasted paper.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To produce a production build:

```bash
npm run build
npm run preview
```

## How the layout engine works

The core problem is: place N images of arbitrary aspect ratio onto fixed-size
pages, without ever cropping or stretching one, while wasting as little paper
as possible. `src/lib/layoutEngine.ts` solves this with a **justified-row**
algorithm — the same family of algorithm behind dense photo-gallery layouts
(Flickr/Google Photos):

1. Images are accumulated into a row until, at the density's target height,
   the row would fill the page's usable width.
2. The exact row height that makes the row's images span the full width
   (with configured spacing between them) is solved algebraically — this is
   the only degree of freedom available once "no cropping, no stretching" is
   a hard constraint.
3. Rows are stacked down the page; once a row would overflow the page's
   usable height, a new page starts.

This guarantees every row reaches both edges of the printable area (zero
horizontal waste on all but the final, naturally short row), while every
image keeps its original proportions.

## Folder structure

```
src/
  components/   shared UI primitives (Button, SegmentedControl) and layout chrome (Header)
  features/     one folder per user-facing feature (upload, preview, settings, pdf, landing)
  hooks/        useImageUpload, useLayout
  lib/          layoutEngine, pdfGenerator, imageUtils — framework-free logic
  pages/        Workspace (the main authenticated-feeling screen)
  store/        Zustand store — images, settings, selection
  types/        shared type + constant definitions (page sizes, margins, density)
```

## Notes

- Everything runs client-side; images are never uploaded anywhere.
- WEBP/HEIC sources are re-encoded to high-quality JPEG via canvas before
  being embedded in the PDF (`pdf-lib` only embeds JPEG/PNG directly).
- Page settings (size, orientation, margins, spacing, density) persist to
  `localStorage` between sessions; the image list itself does not (files
  aren't serializable, and re-prompting for a fresh selection each session
  is the safer default).
