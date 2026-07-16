import { useState } from 'react';
import { Trash2, CheckSquare, Square, Undo2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/store/useAppStore';
import { ImageCard } from './ImageCard';
import { Button } from '@/components/ui/Button';

export function ImageGrid() {
  const images = useAppStore((s) => s.images);
  const selectedIds = useAppStore((s) => s.selectedIds);
  const toggleSelected = useAppStore((s) => s.toggleSelected);
  const selectAll = useAppStore((s) => s.selectAll);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const removeImages = useAppStore((s) => s.removeImages);
  const reorderImages = useAppStore((s) => s.reorderImages);
  const undoRemove = useAppStore((s) => s.undoRemove);
  const lastRemoved = useAppStore((s) => s.lastRemoved);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const sorted = [...images].sort((a, b) => a.order - b.order);
  const allSelected = images.length > 0 && selectedIds.size === images.length;

  const handleDrop = () => {
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      reorderImages(dragIndex, overIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleRemoveSelected = () => {
    const ids = Array.from(selectedIds);
    removeImages(ids);
    toast(
      (t) => (
        <span className="flex items-center gap-3 text-sm">
          Removed {ids.length} image{ids.length > 1 ? 's' : ''}
          <button
            className="font-medium text-accent"
            onClick={() => {
              undoRemove();
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: 5000 },
    );
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-ink dark:text-white">
            {images.length} image{images.length === 1 ? '' : 's'}
          </h2>
          {selectedIds.size > 0 && (
            <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {lastRemoved && (
            <Button variant="ghost" size="sm" onClick={undoRemove}>
              <Undo2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Undo
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={allSelected ? clearSelection : selectAll}>
            {allSelected ? <Square className="h-3.5 w-3.5" strokeWidth={1.75} /> : <CheckSquare className="h-3.5 w-3.5" strokeWidth={1.75} />}
            {allSelected ? 'Clear' : 'Select all'}
          </Button>
          {selectedIds.size > 0 && (
            <Button variant="danger" size="sm" onClick={handleRemoveSelected}>
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        onDrop={handleDrop}
      >
        {sorted.map((item, index) => (
          <ImageCard
            key={item.id}
            item={item}
            index={index}
            selected={selectedIds.has(item.id)}
            onToggleSelect={toggleSelected}
            onRemove={(id) => removeImages([id])}
            onDragStart={setDragIndex}
            onDragOver={setOverIndex}
            onDragEnd={handleDrop}
            isDragTarget={overIndex === index && dragIndex !== index}
          />
        ))}
      </div>
    </div>
  );
}
