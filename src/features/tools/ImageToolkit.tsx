import { useCallback, useEffect, useState } from 'react';
import JSZip from 'jszip';
import { ArrowLeft, Download, FileImage, ImagePlus, Redo2, RotateCcw, Undo2, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

type Mode = 'resize' | 'crop' | 'convert' | 'watermark' | 'contact' | 'rename' | 'zip';
type ToolFile = { file: File; url: string; name: string; image?: HTMLImageElement };
type Settings = { width: number; quality: number; format: 'image/png' | 'image/jpeg' | 'image/webp'; cropX: number; cropY: number; cropWidth: number; cropHeight: number; watermark: string; watermarkOpacity: number; background: string };

const initialSettings: Settings = { width: 1200, quality: 0.85, format: 'image/jpeg', cropX: 0, cropY: 0, cropWidth: 100, cropHeight: 100, watermark: 'Arrange', watermarkOpacity: 0.35, background: '#ffffff' };
const modeLabels: Array<[Mode, string]> = [['resize', 'Resize'], ['crop', 'Crop'], ['convert', 'Convert'], ['watermark', 'Watermark'], ['contact', 'Contact sheet'], ['rename', 'Rename'], ['zip', 'ZIP export']];

function extension(format: Settings['format']) { return format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg'; }
function downloadBlob(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); }

export function ImageToolkit({ onBack }: { onBack: () => void }) {
  const [files, setFiles] = useState<ToolFile[]>([]);
  const [mode, setMode] = useState<Mode>('resize');
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [past, setPast] = useState<Settings[]>([]);
  const [future, setFuture] = useState<Settings[]>([]);
  const [selected, setSelected] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  const current = files[selected];
  const isBatchMode = mode === 'contact' || mode === 'rename' || mode === 'zip';
  const updateSettings = (patch: Partial<Settings>) => {
    setPast((items) => [...items.slice(-19), settings]);
    setFuture([]);
    setSettings((value) => ({ ...value, ...patch }));
  };
  const undo = () => { const previous = past.at(-1); if (!previous) return; setFuture((items) => [settings, ...items]); setSettings(previous); setPast((items) => items.slice(0, -1)); };
  const redo = () => { const next = future[0]; if (!next) return; setPast((items) => [...items, settings]); setSettings(next); setFuture((items) => items.slice(1)); };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const accepted = Array.from(incoming).filter((file) => file.type.startsWith('image/'));
    if (accepted.length === 0) { toast.error('Choose image files.'); return; }
    Promise.all(accepted.map((file) => new Promise<ToolFile>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => resolve({ file, url, name: file.name, image });
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(file.name)); };
      image.src = url;
    }))).then((loaded) => setFiles((items) => [...items, ...loaded])).catch(() => toast.error('One image could not be opened.'));
  };

  const render = useCallback(async () => {
    if (!current?.image) return null;
    const source = current.image;
    const crop = { x: source.naturalWidth * settings.cropX / 100, y: source.naturalHeight * settings.cropY / 100, width: Math.max(1, source.naturalWidth * settings.cropWidth / 100), height: Math.max(1, source.naturalHeight * settings.cropHeight / 100) };
    const scale = mode === 'crop' ? 1 : Math.min(1, settings.width / crop.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(crop.width * scale));
    canvas.height = Math.max(1, Math.round(crop.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.fillStyle = settings.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
    if (mode === 'watermark' && settings.watermark.trim()) {
      context.globalAlpha = settings.watermarkOpacity;
      context.fillStyle = '#ffffff';
      context.font = `600 ${Math.max(18, canvas.width / 22)}px sans-serif`;
      context.textAlign = 'right';
      context.textBaseline = 'bottom';
      context.fillText(settings.watermark, canvas.width - 24, canvas.height - 20);
      context.globalAlpha = 1;
    }
    return new Promise<{ blob: Blob; url: string } | null>((resolve) => canvas.toBlob((blob) => resolve(blob ? { blob, url: canvas.toDataURL(settings.format, settings.quality) } : null), settings.format, settings.quality));
  }, [current, mode, settings]);

  useEffect(() => {
    if (!current || isBatchMode) { setPreviewUrl(''); return; }
    let active = true;
    render().then((result) => { if (active) setPreviewUrl(result?.url || ''); });
    return () => { active = false; };
  }, [current, isBatchMode, render]);

  const createContactSheet = async () => {
    const loaded = files.filter((item) => item.image);
    if (!loaded.length) return null;
    const columns = 3;
    const tileWidth = 360;
    const tileHeight = 300;
    const rows = Math.ceil(loaded.length / columns);
    const canvas = document.createElement('canvas');
    canvas.width = columns * tileWidth;
    canvas.height = rows * tileHeight;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.fillStyle = settings.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    loaded.forEach((item, index) => {
      const x = (index % columns) * tileWidth;
      const y = Math.floor(index / columns) * tileHeight;
      const image = item.image!;
      const scale = Math.min((tileWidth - 32) / image.naturalWidth, (tileHeight - 58) / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.drawImage(image, x + (tileWidth - width) / 2, y + 12, width, height);
      context.fillStyle = '#202124';
      context.font = '14px sans-serif';
      context.textAlign = 'center';
      context.fillText(item.name, x + tileWidth / 2, y + tileHeight - 18, tileWidth - 24);
    });
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  };

  const download = async () => {
    if (!files.length) return;
    setIsWorking(true);
    try {
      if (mode === 'zip') {
        const zip = new JSZip();
        files.forEach((item, index) => zip.file(`${String(index + 1).padStart(2, '0')}-${item.name}`, item.file));
        downloadBlob(await zip.generateAsync({ type: 'blob' }), 'arrange-images.zip');
      } else if (mode === 'rename') {
        const zip = new JSZip();
        files.forEach((item, index) => zip.file(`${settings.watermark || 'image'}-${String(index + 1).padStart(2, '0')}.${item.name.split('.').pop() || 'jpg'}`, item.file));
        downloadBlob(await zip.generateAsync({ type: 'blob' }), 'renamed-images.zip');
      } else if (mode === 'contact') {
        const blob = await createContactSheet();
        if (blob) downloadBlob(blob, 'contact-sheet.jpg');
      } else {
        const result = await render();
        if (result) downloadBlob(result.blob, `${current.name.replace(/\.[^.]+$/, '') || 'image'}.${extension(settings.format)}`);
      }
      toast.success('Export ready.');
    } catch { toast.error('Could not create the export.'); } finally { setIsWorking(false); }
  };

  const formatLabel = mode === 'convert' ? 'Output format' : mode === 'resize' ? 'Resize and compress' : mode === 'crop' ? 'Crop area' : mode === 'watermark' ? 'Watermark' : mode === 'contact' ? 'Contact sheet' : mode === 'rename' ? 'Batch rename' : 'ZIP export';

  return <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8"><div className="mb-7 flex items-center justify-between gap-4"><button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink dark:text-white/60 dark:hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to tools</button>{files.length > 0 && <Button variant="primary" onClick={download} disabled={isWorking}><Download className="h-4 w-4" />{isWorking ? 'Preparing…' : 'Export'}</Button>}</div><div className="mb-8"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300"><FileImage className="h-5 w-5" /></div><h1 className="text-3xl font-semibold tracking-tight text-ink dark:text-white">Image toolkit</h1><p className="mt-2 text-sm text-ink-muted">Resize, crop, convert, watermark, rename, and package images locally.</p></div><div className="mb-5 flex gap-2 overflow-x-auto border-b border-border pb-3 dark:border-dark-border">{modeLabels.map(([value, label]) => <button key={value} type="button" onClick={() => setMode(value)} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${mode === value ? 'bg-accent text-white' : 'text-ink-muted hover:bg-surface-muted hover:text-ink dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white'}`}>{label}</button>)}</div>{files.length === 0 ? <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-white text-center dark:border-dark-border dark:bg-dark-surface"><UploadCloud className="mb-4 h-8 w-8 text-ink-muted" /><span className="font-medium text-ink dark:text-white">Drop images here or browse</span><span className="mt-1 text-sm text-ink-faint">Multiple files are supported</span><input type="file" accept="image/*" multiple className="hidden" onChange={(event) => addFiles(event.target.files)} /></label> : <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]"><section className="rounded-2xl border border-border bg-white p-4 shadow-card dark:border-dark-border dark:bg-dark-surface"><div className="mb-4 flex items-center justify-between"><div><p className="font-medium text-ink dark:text-white">Before and after</p><p className="text-xs text-ink-faint">{files.length} image{files.length === 1 ? '' : 's'} loaded</p></div><label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-accent"><ImagePlus className="h-4 w-4" /> Add more<input type="file" accept="image/*" multiple className="hidden" onChange={(event) => addFiles(event.target.files)} /></label></div><div className="grid gap-3 sm:grid-cols-2"><div className="overflow-hidden rounded-xl bg-surface-muted p-3 dark:bg-dark-bg"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Original</p><img src={current?.url} alt={current?.name || 'Original'} className="aspect-square w-full object-contain" /></div><div className="overflow-hidden rounded-xl bg-surface-muted p-3 dark:bg-dark-bg"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Preview</p>{mode === 'contact' ? <div className="flex aspect-square items-center justify-center text-center text-sm text-ink-faint">{files.length} images will become a contact sheet</div> : <img src={previewUrl || current?.url} alt="Edited preview" className="aspect-square w-full object-contain" />}</div></div><div className="mt-4 flex gap-2 overflow-x-auto pb-1">{files.map((item, index) => <button key={`${item.name}-${index}`} type="button" onClick={() => setSelected(index)} className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${selected === index ? 'border-accent' : 'border-transparent'}`}><img src={item.url} alt={item.name} className="h-full w-full object-cover" /></button>)}</div></section><aside className="h-fit rounded-2xl border border-border bg-white p-5 shadow-card dark:border-dark-border dark:bg-dark-surface"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-ink dark:text-white">{formatLabel}</h2><div className="flex gap-1"><button type="button" title="Undo" disabled={!past.length} onClick={undo} className="rounded-md p-1.5 text-ink-muted hover:bg-surface-muted disabled:opacity-30 dark:hover:bg-white/10"><Undo2 className="h-4 w-4" /></button><button type="button" title="Redo" disabled={!future.length} onClick={redo} className="rounded-md p-1.5 text-ink-muted hover:bg-surface-muted disabled:opacity-30 dark:hover:bg-white/10"><Redo2 className="h-4 w-4" /></button></div></div>{(mode === 'resize' || mode === 'convert' || mode === 'watermark') && <><label className="mt-5 block text-xs text-ink-muted">Output width <span className="float-right font-medium text-ink dark:text-white">{settings.width}px</span><input type="range" min="240" max="2400" step="10" value={settings.width} onChange={(event) => updateSettings({ width: Number(event.target.value) })} className="mt-2 w-full accent-accent" /></label><label className="mt-5 block text-xs text-ink-muted">Quality <span className="float-right font-medium text-ink dark:text-white">{Math.round(settings.quality * 100)}%</span><input type="range" min="0.25" max="1" step="0.05" value={settings.quality} onChange={(event) => updateSettings({ quality: Number(event.target.value) })} className="mt-2 w-full accent-accent" /></label></>}{(mode === 'convert' || mode === 'resize' || mode === 'watermark') && <label className="mt-5 block text-xs text-ink-muted">Format<select value={settings.format} onChange={(event) => updateSettings({ format: event.target.value as Settings['format'] })} className="mt-2 h-10 w-full rounded-lg border border-border bg-surface-subtle px-3 text-sm text-ink dark:border-dark-border dark:bg-dark-bg dark:text-white"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option></select></label>}{mode === 'crop' && <div className="mt-5 grid grid-cols-2 gap-3">{([['cropX', 'Left'], ['cropY', 'Top'], ['cropWidth', 'Width'], ['cropHeight', 'Height']] as const).map(([key, label]) => <label key={key} className="text-xs text-ink-muted">{label}<input type="number" min="0" max="100" value={settings[key]} onChange={(event) => updateSettings({ [key]: Math.min(100, Math.max(0, Number(event.target.value))) })} className="mt-1 h-9 w-full rounded-lg border border-border bg-surface-subtle px-2 text-sm text-ink dark:border-dark-border dark:bg-dark-bg dark:text-white" /></label>)}</div>}{mode === 'watermark' && <label className="mt-5 block text-xs text-ink-muted">Watermark text<input value={settings.watermark} onChange={(event) => updateSettings({ watermark: event.target.value })} className="mt-2 h-10 w-full rounded-lg border border-border bg-surface-subtle px-3 text-sm text-ink dark:border-dark-border dark:bg-dark-bg dark:text-white" /></label>}{mode === 'rename' && <label className="mt-5 block text-xs text-ink-muted">Name prefix<input value={settings.watermark} onChange={(event) => updateSettings({ watermark: event.target.value })} placeholder="image" className="mt-2 h-10 w-full rounded-lg border border-border bg-surface-subtle px-3 text-sm text-ink dark:border-dark-border dark:bg-dark-bg dark:text-white" /></label>}{(mode === 'resize' || mode === 'convert' || mode === 'watermark' || mode === 'contact') && <label className="mt-5 block text-xs text-ink-muted">Background color<input type="color" value={settings.background} onChange={(event) => updateSettings({ background: event.target.value })} className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-border bg-transparent dark:border-dark-border" /></label>}<button type="button" onClick={() => { setSettings(initialSettings); setPast([]); setFuture([]); }} className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink dark:text-white/65 dark:hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Reset settings</button>{mode === 'zip' && <p className="mt-5 text-xs leading-5 text-ink-faint">Package all loaded originals into one ZIP file.</p>}</aside></div>}
    </main>;
}
