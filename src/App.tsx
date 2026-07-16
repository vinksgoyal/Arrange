import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from '@/store/useAppStore';
import { Header } from '@/components/layout/Header';
import { Landing } from '@/features/landing/Landing';
import { Workspace } from '@/pages/Workspace';

export default function App() {
  const hasImages = useAppStore((s) => s.images.length > 0);
  const isDarkMode = useAppStore((s) => s.isDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-surface-subtle dark:bg-dark-bg">
      <Header />
      {hasImages ? <Workspace /> : <Landing />}
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
