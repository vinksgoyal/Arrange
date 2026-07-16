import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { clsx } from 'clsx';
import { useImageUpload } from '@/hooks/useImageUpload';

interface DropzoneProps {
  compact?: boolean;
}

export function Dropzone({ compact = false }: DropzoneProps) {
  const { importFiles, isImporting } = useImageUpload();

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) importFiles(accepted);
    },
    [importFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
    },
    noClick: false,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors duration-150',
        compact ? 'p-8' : 'p-16',
        isDragActive
          ? 'border-accent bg-accent-subtle'
          : 'border-border hover:border-border-strong bg-white dark:bg-dark-surface dark:border-dark-border',
      )}
    >
      <input {...getInputProps()} aria-label="Upload images" />
      <div
        className={clsx(
          'mb-4 flex items-center justify-center rounded-full bg-surface-muted transition-transform duration-150 dark:bg-white/5',
          compact ? 'h-10 w-10' : 'h-14 w-14',
          isDragActive && 'scale-105',
        )}
      >
        <UploadCloud className={clsx('text-ink-muted', compact ? 'h-5 w-5' : 'h-6 w-6')} strokeWidth={1.75} />
      </div>
      <p className={clsx('font-medium text-ink', compact ? 'text-sm' : 'text-base')}>
        {isDragActive ? 'Drop to add' : isImporting ? 'Reading images…' : 'Drag images here, or click to browse'}
      </p>
      <p className="mt-1 text-sm text-ink-faint">PNG, JPEG, WEBP, HEIC — as many as you like</p>
    </div>
  );
}
