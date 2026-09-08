import { useRef, useState } from 'react';
import { degrees, PDFDocument } from 'pdf-lib';
import { ArrowLeft, FilePenLine, RotateCw, Trash2, UploadCloud, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

interface PdfEditorProps {
  onBack: () => void;
}

export function PdfEditor({ onBack }: PdfEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [removedPages, setRemovedPages] = useState<Set<number>>(new Set());
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [title, setTitle] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const loadPdf = async (file: File) => {
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setSource(bytes);
      setFileName(file.name.replace(/\.pdf$/i, ''));
      setTitle(pdf.getTitle() || file.name.replace(/\.pdf$/i, ''));
      setPageCount(pdf.getPageCount());
      setRemovedPages(new Set());
      setRotations({});
    } catch {
      toast.error('This PDF could not be opened.');
    }
  };

  const exportPdf = async () => {
    if (!source) return;
    setIsExporting(true);
    try {
      const pdf = await PDFDocument.load(source);
      pdf.setTitle(title.trim() || 'Edited document');
      for (let index = pageCount - 1; index >= 0; index -= 1) {
        if (removedPages.has(index)) pdf.removePage(index);
      }
      const keptIndexes = Array.from({ length: pageCount }, (_, index) => index).filter((index) => !removedPages.has(index));
      keptIndexes.forEach((originalIndex, newIndex) => {
        const page = pdf.getPage(newIndex);
        const rotation = rotations[originalIndex] || 0;
        if (rotation) page.setRotation(degrees(page.getRotation().angle + rotation));
      });
      const bytes = await pdf.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName || 'edited-document'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF exported.');
    } catch {
      toast.error('Could not export this PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink dark:text-white/60 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to tools
      </button>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"><FilePenLine className="h-5 w-5" /></div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink dark:text-white">PDF editor</h1>
          <p className="mt-2 text-sm text-ink-muted">Make the small changes that usually take a full desktop app.</p>
        </div>
        {source && <Button variant="primary" onClick={exportPdf} disabled={isExporting || pageCount - removedPages.size === 0}><Download className="h-4 w-4" />{isExporting ? 'Exporting…' : 'Download PDF'}</Button>}
      </div>

      {!source ? (
        <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-72 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-white px-6 text-center transition hover:border-border-strong dark:border-dark-border dark:bg-dark-surface">
          <UploadCloud className="mb-4 h-8 w-8 text-ink-muted" />
          <span className="font-medium text-ink dark:text-white">Choose a PDF to edit</span>
          <span className="mt-1 text-sm text-ink-faint">Your document stays on this device</span>
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => event.target.files?.[0] && loadPdf(event.target.files[0])} />
        </button>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="rounded-2xl border border-border bg-white p-4 shadow-card dark:border-dark-border dark:bg-dark-surface">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3 dark:border-dark-border"><div><p className="font-medium text-ink dark:text-white">{fileName}.pdf</p><p className="text-xs text-ink-faint">{pageCount - removedPages.size} of {pageCount} pages included</p></div><Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()}>Replace</Button><input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => event.target.files?.[0] && loadPdf(event.target.files[0])} /></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: pageCount }, (_, index) => {
                const isRemoved = removedPages.has(index);
                return <div key={index} className={`relative rounded-xl border p-4 ${isRemoved ? 'border-red-200 bg-red-50/50 opacity-60 dark:border-red-900 dark:bg-red-950/20' : 'border-border bg-surface-subtle dark:border-dark-border dark:bg-white/[0.02]'}`}><div className="mb-5 flex h-28 items-center justify-center rounded-lg border border-border bg-white text-3xl font-semibold text-ink-faint dark:border-dark-border dark:bg-dark-bg">{index + 1}</div><div className="flex items-center justify-between"><span className="text-xs font-medium text-ink-muted">Page {index + 1}</span><div className="flex gap-1"><button type="button" title="Rotate page" onClick={() => setRotations((current) => ({ ...current, [index]: ((current[index] || 0) + 90) % 360 }))} className="rounded-md p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink dark:hover:bg-white/10"><RotateCw className="h-4 w-4" /></button><button type="button" title={isRemoved ? 'Restore page' : 'Remove page'} onClick={() => setRemovedPages((current) => { const next = new Set(current); if (next.has(index)) next.delete(index); else next.add(index); return next; })} className="rounded-md p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"><Trash2 className="h-4 w-4" /></button></div></div></div>;
              })}
            </div>
          </section>
          <aside className="h-fit rounded-2xl border border-border bg-white p-5 shadow-card dark:border-dark-border dark:bg-dark-surface"><h2 className="text-sm font-semibold text-ink dark:text-white">Document details</h2><label className="mt-5 block text-xs font-medium text-ink-muted">File name</label><input value={fileName} onChange={(event) => setFileName(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-border bg-surface-subtle px-3 text-sm text-ink outline-none focus:border-accent dark:border-dark-border dark:bg-dark-bg dark:text-white" /><label className="mt-4 block text-xs font-medium text-ink-muted">PDF title</label><input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-border bg-surface-subtle px-3 text-sm text-ink outline-none focus:border-accent dark:border-dark-border dark:bg-dark-bg dark:text-white" /><p className="mt-5 text-xs leading-5 text-ink-faint">Changes are applied only when you download. Original files are never overwritten.</p></aside>
        </div>
      )}
    </main>
  );
}