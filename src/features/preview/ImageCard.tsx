import { type DragEvent, useState } from 'react';
import { X, GripVertical, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { ImageItem } from '@/types';
import { formatDimensions } from '@/lib/imageUtils';

interface ImageCardProps {
  item: ImageItem;
  index: number;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  isDragTarget: boolean;
}

export function ImageCard({
  item,
  index,
  selected,
  onToggleSelect,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragTarget,
}: ImageCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(index);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    onDragOver(index);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={clsx(
        'group relative animate-scaleIn overflow-hidden rounded-xl border bg-white transition-shadow dark:bg-dark-surface',
        selected ? 'border-accent ring-1 ring-accent' : 'border-border dark:border-dark-border',
        isDragTarget && 'ring-2 ring-accent/60',
      )}
    >
      <button
        type="button"
        onClick={() => onToggleSelect(item.id)}
        aria-pressed={selected}
        aria-label={selected ? `Deselect ${item.name}` : `Select ${item.name}`}
        className={clsx(
          'absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border transition-opacity duration-150',
          selected
            ? 'border-accent bg-accent text-white opacity-100'
            : 'border-white/70 bg-black/20 text-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
        className={clsx(
          'absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity duration-150 hover:bg-black/60 group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        <X className="h-3 w-3" strokeWidth={2.5} />
      </button>

      <div
        className={clsx(
          'absolute bottom-2 right-2 z-10 cursor-grab text-white/0 transition-opacity duration-150 active:cursor-grabbing',
          isHovering && 'text-white/80',
        )}
      >
        <GripVertical className="h-4 w-4 drop-shadow" />
      </div>

      <div className="aspect-square w-full bg-surface-muted dark:bg-white/5">
        {item.status === 'ready' ? (
          <img
            src={item.previewUrl}
            alt={item.name}
            className="h-full w-full object-contain"
            loading="lazy"
            draggable={false}
          />
        ) : item.status === 'loading' ? (
          <div className="h-full w-full animate-pulse bg-surface-muted dark:bg-white/5" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-red-500">Failed to load</div>
        )}
      </div>

      <div className="px-2.5 py-2">
        <p className="truncate text-xs font-medium text-ink dark:text-white" title={item.name}>
          {item.name}
        </p>
        <p className="text-[11px] text-ink-faint">{formatDimensions(item)}</p>
      </div>
    </div>
  );
}
