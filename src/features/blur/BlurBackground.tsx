import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Focus, ImageUp, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

export function BlurBackground({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [strength, setStrength] = useState(18);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const maxSize = 1500;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) return;

    const padding = Math.ceil(strength * 2.5) + 4;
    const source = document.createElement('canvas');
    source.width = canvas.width + padding * 2;
    source.height = canvas.height + padding * 2;
    const sourceContext = source.getContext('2d');
    if (!sourceContext) return;
    sourceContext.drawImage(image, padding, padding, canvas.width, canvas.height);
    sourceContext.drawImage(image, 0, 0, image.naturalWidth, 1, padding, 0, canvas.width, padding);
    sourceContext.drawImage(image, 0, image.naturalHeight - 1, image.naturalWidth, 1, padding, padding + canvas.height, canvas.width, padding);
    sourceContext.drawImage(image, 0, 0, 1, image.naturalHeight, 0, padding, padding, canvas.height);
    sourceContext.drawImage(image, image.naturalWidth - 1, 0, 1, image.naturalHeight, padding + canvas.width, padding, padding, canvas.height);
    sourceContext.drawImage(image, 0, 0, 1, 1, 0, 0, padding, padding);
    sourceContext.drawImage(image, image.naturalWidth - 1, 0, 1, 1, padding + canvas.width, 0, padding, padding);
    sourceContext.drawImage(image, 0, image.naturalHeight - 1, 1, 1, 0, padding + canvas.height, padding, padding);
    sourceContext.drawImage(image, image.naturalWidth - 1, image.naturalHeight - 1, 1, 1, padding + canvas.width, padding + canvas.height, padding, padding);

    const blurred = document.createElement('canvas');
    blurred.width = source.width;
    blurred.height = source.height;
    const blurredContext = blurred.getContext('2d');
    if (!blurredContext) return;
    blurredContext.filter = `blur(${strength}px)`;
    blurredContext.drawImage(source, 0, 0);
    blurredContext.filter = 'none';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(blurred, padding, padding, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  }, [strength]);

  useEffect(() => { draw(); }, [draw]);

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      setFileName(file.name);
      draw();
      URL.revokeObjectURL(url);
    };
    image.onerror = () => toast.error('This image could not be opened.');
    image.src = url;
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.replace(/\.[^.]+$/, '') || 'blurred-image'}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink dark:text-white/60 dark:hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to tools</button>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300"><Focus className="h-5 w-5" /></div><h1 className="text-3xl font-semibold tracking-tight text-ink dark:text-white">Blur image</h1><p className="mt-2 text-sm text-ink-muted">Fast, private image blur that runs entirely in your browser.</p></div>{imageRef.current && <Button variant="primary" onClick={download}><Download className="h-4 w-4" /> Download PNG</Button>}</div>
      {!imageRef.current ? <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-white px-6 text-center transition hover:border-border-strong dark:border-dark-border dark:bg-dark-surface"><UploadCloud className="mb-4 h-8 w-8 text-ink-muted" /><span className="font-medium text-ink dark:text-white">Choose an image</span><span className="mt-1 text-sm text-ink-faint">JPG, PNG, or WEBP. Nothing leaves your device.</span><input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => event.target.files?.[0] && loadFile(event.target.files[0])} /></label> : <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"><section className="rounded-2xl border border-border bg-white p-4 shadow-card dark:border-dark-border dark:bg-dark-surface"><div className="mb-4 flex items-center justify-between"><div><p className="font-medium text-ink dark:text-white">{fileName}</p><p className="text-xs text-ink-faint">Live preview</p></div><label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-accent"><ImageUp className="h-4 w-4" /> Replace<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => event.target.files?.[0] && loadFile(event.target.files[0])} /></label></div><div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl bg-surface-muted p-4 dark:bg-dark-bg"><canvas ref={canvasRef} className="max-h-[68vh] max-w-full object-contain" /></div></section><aside className="h-fit rounded-2xl border border-border bg-white p-5 shadow-card dark:border-dark-border dark:bg-dark-surface"><h2 className="text-sm font-semibold text-ink dark:text-white">Blur strength</h2><label className="mt-6 block text-xs font-medium text-ink-muted"><span className="float-right text-ink dark:text-white">{strength}px</span><input type="range" min="2" max="48" value={strength} onChange={(event) => setStrength(Number(event.target.value))} className="mt-2 w-full accent-accent" /></label><p className="mt-5 border-t border-border pt-5 text-xs leading-5 text-ink-faint dark:border-dark-border">Background blur has been removed for now because automatic subject detection was too slow and unreliable. This tool applies a clean blur to the entire image.</p></aside></div>}
    </main>
  );
}
