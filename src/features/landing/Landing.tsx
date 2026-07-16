import { motion } from 'framer-motion';
import { FileStack } from 'lucide-react';
import { Dropzone } from '@/features/upload/Dropzone';

export function Landing() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white dark:bg-white dark:text-black"
      >
        <FileStack className="h-6 w-6" strokeWidth={1.75} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05, ease: 'easeOut' }}
        className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl"
      >
        Every image, one page,
        <br />
        zero cropping.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
        className="mt-4 max-w-md text-base text-ink-muted"
      >
        Drop in your images and Arrange fits them onto print-ready A4 pages automatically —
        full aspect ratio preserved, minimal wasted paper.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15, ease: 'easeOut' }}
        className="mt-10 w-full"
      >
        <Dropzone />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.25 }}
        className="mt-6 text-xs text-ink-faint"
      >
        Everything runs in your browser — images never leave your device.
      </motion.p>
    </div>
  );
}
