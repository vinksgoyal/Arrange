import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, Download, FileImage, RotateCw, Trash2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { generateImagePdf, downloadPdf, type ImagePdfItem } from '@/lib/pdfGenerator';

interface ImageToPdfProps { onBack: () => void; }

export function ImageToPdf({ onBack }: ImageToPdfProps) {
  const [items, setItems] = useState<ImagePdfItem[]>([]);
  const itemsRef = useRef<ImagePdfItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => () => { itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl)); }, []);

  const addFiles = useCallback((incoming: File[]) => {
    const images = incoming.filter((file) => file.type.startsWith('image/') || /\.(png|jpe?g|webp|heic|heif)$/i.test(file.name));
    if (images.length !== incoming.length) toast.error('Only image files can be converted.');
    setItems((current) => [...current, ...images.map((file) => ({ file, scale: 1, rotation: 0 as const, width: 0, height: 0, previewUrl: URL.createObjectURL(file) }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: addFiles, accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif'] }, multiple: true });
  const updateItem = (index: number, patch: Partial<ImagePdfItem>) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const convert = async () => {
    setIsConverting(true);
    try { downloadPdf(await generateImagePdf(items, setProgress), 'images.pdf'); toast.success(`${items.length} image${items.length === 1 ? '' : 's'} converted.`); }
    catch { toast.error('One of these images could not be converted.'); }
    finally { setIsConverting(false); setProgress(0); }
  };

  return <main className="mx-auto max-w-5xl px-6 py-10">
    <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink dark:text-white/60 dark:hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to tools</button>
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"><FileImage className="h-5 w-5" /></div><h1 className="text-3xl font-semibold tracking-tight text-ink dark:text-white">Image to PDF</h1><p className="mt-2 text-sm text-ink-muted">One image per A4 portrait page. Rotate images without changing the page.</p></div><Button variant="primary" onClick={convert} disabled={items.length === 0 || isConverting}><Download className="h-4 w-4" />{isConverting ? `Converting ${progress}%` : 'Download PDF'}</Button></div>
    <div {...getRootProps()} className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${isDragActive ? 'border-accent bg-accent-subtle' : 'border-border bg-white hover:border-border-strong dark:border-dark-border dark:bg-dark-surface'}`}><input {...getInputProps()} /><UploadCloud className="mb-3 h-8 w-8 text-ink-muted" /><span className="font-medium text-ink dark:text-white">Drop images here or click to browse</span><span className="mt-1 text-sm text-ink-faint">PNG, JPEG, WEBP, HEIC</span></div>
    {items.length > 0 && <section className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-card dark:border-dark-border dark:bg-dark-surface"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-ink dark:text-white">Preview pages</h2><p className="mt-1 text-xs text-ink-faint">Every page stays A4 portrait. Rotate and resize the image inside it.</p></div><Button size="sm" variant="ghost" onClick={() => { items.forEach((item) => URL.revokeObjectURL(item.previewUrl)); setItems([]); }}>Clear all</Button></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <div key={`${item.file.name}-${index}`} className="rounded-xl border border-border bg-surface-subtle p-3 dark:border-dark-border dark:bg-dark-bg"><div className="relative flex aspect-[1/1.414] items-center justify-center overflow-hidden rounded-lg border border-border bg-white p-3 dark:border-dark-border dark:bg-dark-surface"><img src={item.previewUrl} alt={`Preview of ${item.file.name}`} onLoad={(event) => updateItem(index, { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} className="max-h-full max-w-full object-contain transition-all" style={{ width: `${item.scale * 100}%`, transform: `rotate(${item.rotation}deg)` }} /></div><div className="mt-3 flex items-center justify-between gap-2"><span className="min-w-0 truncate text-xs font-medium text-ink dark:text-white">{index + 1}. {item.file.name}</span><div className="flex items-center gap-1"><button type="button" title="Rotate image" aria-label={`Rotate ${item.file.name}`} onClick={() => updateItem(index, { rotation: (((item.rotation + 90) % 360) as 0 | 90 | 180 | 270) })} className="rounded-md p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink dark:hover:bg-white/10"><RotateCw className="h-4 w-4" /></button><button type="button" title={`Remove ${item.file.name}`} onClick={() => { URL.revokeObjectURL(item.previewUrl); setItems((current) => current.filter((_, fileIndex) => fileIndex !== index)); }} className="rounded-md p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"><Trash2 className="h-4 w-4" /></button></div></div><label className="mt-3 block text-xs text-ink-muted">Image size <span className="float-right font-medium text-ink dark:text-white">{Math.round(item.scale * 100)}%</span><input aria-label={`Size for ${item.file.name}`} type="range" min="25" max="100" step="5" value={item.scale * 100} onChange={(event) => updateItem(index, { scale: Number(event.target.value) / 100 })} className="mt-2 w-full accent-accent" /></label></div>)}</div></section>}
  </main>;
}
