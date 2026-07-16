import { FileStack, Moon, Sun, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';

export function Header() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const clearAll = useAppStore((s) => s.clearAll);
  const hasImages = useAppStore((s) => s.images.length > 0);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white/80 px-5 backdrop-blur dark:border-dark-border dark:bg-dark-bg/80">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-white dark:bg-white dark:text-black">
          <FileStack className="h-4 w-4" strokeWidth={2} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-ink dark:text-white">Arrange</span>
      </div>

      <div className="flex items-center gap-1.5">
        {hasImages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Remove all images and start over?')) clearAll();
            }}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
            Start over
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={toggleDarkMode} aria-label="Toggle dark mode">
          {isDarkMode ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
        </Button>
      </div>
    </header>
  );
}
