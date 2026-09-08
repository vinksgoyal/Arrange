import { motion } from 'framer-motion';
import { FileStack, FilePenLine, ImagePlus, Layers3, ShieldCheck, Zap } from 'lucide-react';
import { Dropzone } from '@/features/upload/Dropzone';

interface LandingProps {
  onOpenImageToPdf: () => void;
  onOpenPdfEditor: () => void;
}

export function Landing({ onOpenImageToPdf, onOpenPdfEditor }: LandingProps) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white dark:bg-white dark:text-black"
      >
        <FileStack className="h-6 w-6" strokeWidth={1.75} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05, ease: 'easeOut' }}
        className="text-center text-4xl font-semibold tracking-tight text-ink sm:text-5xl"
      >
        Your files, ready for anywhere.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
        className="mx-auto mt-4 max-w-xl text-center text-base text-ink-muted"
      >
        Arrange images into a clean PDF, or make quick edits to an existing document. Everything
        happens locally in your browser.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15, ease: 'easeOut' }}
        className="mt-10 grid gap-4 lg:grid-cols-3"
      >
        <div className="rounded-2xl border border-border bg-white p-5 text-left shadow-card dark:border-dark-border dark:bg-dark-surface">
          <div className="mb-5 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-subtle text-accent dark:bg-accent/15">
              <ImagePlus className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted dark:bg-white/5">Popular</span>
          </div>
          <h2 className="text-lg font-semibold text-ink dark:text-white">Arrange for print</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">Fit multiple images onto A4 pages with full aspect ratio preserved and minimal wasted paper.</p>
          <div className="mt-5">
            <Dropzone compact />
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenImageToPdf}
          className="group rounded-2xl border border-border bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-pop dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
            <Layers3 className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-ink dark:text-white">Image to PDF</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">Convert images into a PDF in their upload order, with one image per page.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink group-hover:text-accent dark:text-white dark:group-hover:text-accent">
            Convert images <span aria-hidden="true">→</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenPdfEditor}
          className="group rounded-2xl border border-border bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-pop dark:border-dark-border dark:bg-dark-surface"
        >
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
            <FilePenLine className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-ink dark:text-white">PDF editor</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">Remove pages, rotate scans, rename the document, and export instantly.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink group-hover:text-accent dark:text-white dark:group-hover:text-accent">
            Open editor <span aria-hidden="true">→</span>
          </span>
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.25 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-faint"
      >
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Private by default</span>
        <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> No upload wait</span>
      </motion.p>
    </div>
  );
}
