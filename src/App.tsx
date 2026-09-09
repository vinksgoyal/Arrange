import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/store/useAppStore';
import { Header } from '@/components/layout/Header';
import { Landing } from '@/features/landing/Landing';
import { ImageToPdf } from '@/features/pdf/ImageToPdf';
import { PdfEditor } from '@/features/pdf/PdfEditor';
import { BlurBackground } from '@/features/blur/BlurBackground';
import { ImageToolkit } from '@/features/tools/ImageToolkit';
import { Workspace } from '@/pages/Workspace';
import { UrlShortener } from '@/features/shortener/UrlShortener';

export default function App() {
  const hasImages = useAppStore((s) => s.images.length > 0);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const clearAll = useAppStore((s) => s.clearAll);
  const [activeTool, setActiveTool] = useState<'home' | 'image-to-pdf' | 'pdf-editor' | 'blur' | 'toolkit' | 'shortener'>('home');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/s\/([a-z0-9-]+)$/i);
    if (!match) return;

    try {
      const links = JSON.parse(localStorage.getItem('arrange-short-links') ?? '[]') as Array<{ code: string; target: string }>;
      const link = links.find((item) => item.code === match[1]);
      if (link) window.location.replace(link.target);
    } catch {
      // Ignore malformed local storage and keep the app usable.
    }
  }, []);

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
      ) : activeTool === 'blur' ? (
        <BlurBackground onBack={() => setActiveTool('home')} />
      ) : activeTool === 'toolkit' ? (
        <ImageToolkit onBack={() => setActiveTool('home')} />
      ) : activeTool === 'shortener' ? (
        <UrlShortener onBack={() => setActiveTool('home')} />
      ) : (
        <Landing
          onOpenImageToPdf={() => setActiveTool('image-to-pdf')}
          onOpenPdfEditor={() => setActiveTool('pdf-editor')}
          onOpenBlur={() => setActiveTool('blur')}
          onOpenToolkit={() => setActiveTool('toolkit')}
          onOpenShortener={() => setActiveTool('shortener')}
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
