# Arrange

Arrange is a browser-first image workspace for turning loose files into clean, print-ready documents. It keeps processing local, gives you control over image order and rotation, and makes the common image-to-PDF workflow quick.

[Open the repository on GitHub](https://github.com/vinksgoyal/Arrange)

## What it does

### Arrange for print

- Upload multiple PNG, JPEG, WEBP, and HEIC images.
- Drag images into the order you need.
- Rotate individual images without changing their source files.
- Choose A4, Letter, or Legal paper sizes.
- Adjust margins, spacing, density, and page orientation.
- Preview the generated layout before downloading.
- Export a print-ready PDF without cropping or stretching images.

### Image to PDF

- Create one A4 portrait page per image.
- Keep pages portrait while rotating images inside the page.
- Resize each image before export.
- Reorder, replace, or remove images.
- Download the finished PDF locally.

### Blur image

- Blur the complete image in real time.
- Adjust blur strength with a slider.
- Preview the result before downloading.
- Export a PNG without uploading the image anywhere.

The PDF editor is present in the codebase but currently marked **Coming soon** in the interface.

## Privacy

Arrange is designed for local browser processing. Images are read by the browser and are not sent to an application server by the current tools.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Framer Motion
- pdf-lib
- react-dropzone
- Lucide React

## Run locally

Requirements: Node.js 18 or newer and npm.

```bash
git clone https://github.com/vinksgoyal/Arrange.git
cd Arrange
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

Useful checks:

```bash
npm run lint
npm run build
```

## Project map

```text
src/
  components/       Shared layout and UI controls
  features/         Landing, upload, preview, PDF, and blur workflows
  hooks/            Upload and layout state helpers
  lib/              Image, layout, and PDF processing
  pages/            Workspace composition
  store/            Persistent application state
  types/            Shared TypeScript models
```

## Roadmap

Arrange is intentionally structured as a growing toolbox. Planned directions include:

- More image cleanup tools
- Crop, resize, and compression workflows
- Contact sheets and batch export presets
- More PDF operations
- Saved local projects
- Keyboard-first workflows
- Offline/PWA support
- Expanded export formats

## Contributing

Issues, ideas, and pull requests are welcome. Keep changes focused, run `npm run lint` and `npm run build`, and describe any user-facing behavior changes in the pull request.

## License

MIT
