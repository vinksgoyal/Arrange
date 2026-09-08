import { FileStack, Github, Home, Moon, Sun, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  showHome?: boolean;
  onHome?: () => void;
}

export function Header({ showHome = false, onHome }: HeaderProps) {
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
        {showHome && (
          <Button variant="ghost" size="sm" onClick={onHome} aria-label="Go to home">
            <Home className="h-4 w-4" strokeWidth={1.75} />
            Home
          </Button>
        )}
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
        <a href="https://github.com/vinksgoyal/Arrange" target="_blank" rel="noreferrer" aria-label="Open Arrange on GitHub" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white">
          <Github className="h-4 w-4" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <Button variant="ghost" size="sm" onClick={toggleDarkMode} aria-label="Toggle dark mode">
          {isDarkMode ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
        </Button>
      </div>
    </header>
  );
}
