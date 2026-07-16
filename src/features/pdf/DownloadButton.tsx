import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/store/useAppStore';
import { useLayout } from '@/hooks/useLayout';
import { generatePdf } from '@/lib/pdfGenerator';
import { Button } from '@/components/ui/Button';

export function DownloadButton() {
  const settings = useAppStore((s) => s.settings);
  const layout = useLayout();
  const [progress, setProgress] = useState<number | null>(null);

  const handleDownload = async () => {
    if (layout.pages.length === 0) return;
    setProgress(0);
    try {
      const blob = await generatePdf(layout, settings, { onProgress: setProgress });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arrange-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded.');
    } catch {
      toast.error('Something went wrong generating the PDF.');
    } finally {
      setProgress(null);
    }
  };

  const isGenerating = progress !== null;

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handleDownload}
      disabled={layout.pages.length === 0 || isGenerating}
      className="w-full"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          Generating… {Math.round((progress ?? 0) * 100)}%
        </>
      ) : (
        <>
          <Download className="h-4 w-4" strokeWidth={1.75} />
          Download PDF ({layout.pages.length} page{layout.pages.length === 1 ? '' : 's'})
        </>
      )}
    </Button>
  );
}
