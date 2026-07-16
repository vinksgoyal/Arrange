import { useState } from 'react';
import { Download } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { generatePdf, downloadPdf } from '@/lib/pdfGenerator';
import { computeLayout } from '@/lib/layoutEngine';
import { Button } from '@/components/ui/Button';

export function DownloadButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const images = useAppStore((s) => s.images);
  const settings = useAppStore((s) => s.settings);

  const handleDownload = async () => {
    if (images.length === 0) return;
    
    setIsLoading(true);
    setProgress(0);
    
    try {
      const result = computeLayout(images, settings);
      const blob = await generatePdf(result, settings, { onProgress: setProgress });
      downloadPdf(blob, 'arranged-images.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <Button
      variant="primary"
      size="md"
      className="w-full"
      onClick={handleDownload}
      disabled={isLoading || images.length === 0}
    >
      <Download className="h-4 w-4" strokeWidth={1.75} />
      {isLoading ? `Generating... ${progress}%` : 'Download PDF'}
    </Button>
  );
}
