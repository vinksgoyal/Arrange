import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/store/useAppStore';
import { Header } from '@/components/layout/Header';
import { Landing } from '@/features/landing/Landing';
import { ImageToPdf } from '@/features/pdf/ImageToPdf';
import { PdfEditor } from '@/features/pdf/PdfEditor';
import { Workspace } from '@/pages/Workspace';

export default function App() {
  const hasImages = useAppStore((s) => s.images.length > 0);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const clearAll = useAppStore((s) => s.clearAll);
  const [activeTool, setActiveTool] = useState<'home' | 'image-to-pdf' | 'pdf-editor'>('home');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-dark-bg">
      <Header
        showHome={activeTool !== 'home' || hasImages}
        onHome={() => {
          clearAll();
          setActiveTool('home');
        }}
      />
      {hasImages ? (
        <Workspace />
      ) : activeTool === 'image-to-pdf' ? (
        <ImageToPdf onBack={() => setActiveTool('home')} />
      ) : activeTool === 'pdf-editor' ? (
        <PdfEditor onBack={() => setActiveTool('home')} />
      ) : (
        <Landing
          onOpenImageToPdf={() => setActiveTool('image-to-pdf')}
          onOpenPdfEditor={() => setActiveTool('pdf-editor')}
        />
      )}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#18181b',
            color: '#fff',
            fontSize: '13px',
            borderRadius: '10px',
            padding: '8px 14px',
          },
        }}
      />
    </div>
  );
}
