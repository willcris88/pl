import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface MaximizeContextType {
  isMaximized: boolean;
  toggleMaximize: () => void;
}

const MaximizeContext = createContext<MaximizeContextType | null>(null);

export function MaximizeProvider({ children }: { children: ReactNode }) {
  const [isMaximized, setIsMaximized] = useState(() => {
    // Recuperar estado do localStorage
    const saved = localStorage.getItem('app-maximized');
    return saved === 'true';
  });

  useEffect(() => {
    // Salvar estado no localStorage
    localStorage.setItem('app-maximized', isMaximized.toString());
  }, [isMaximized]);

  useEffect(() => {
    // Listener para detectar mudanças no fullscreen
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      if (isCurrentlyFullscreen !== isMaximized) {
        setIsMaximized(isCurrentlyFullscreen);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isMaximized]);

  const toggleMaximize = () => {
    if (!isMaximized) {
      // Entrar em fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      // Sair do fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsMaximized(!isMaximized);
  };

  return (
    <MaximizeContext.Provider value={{ isMaximized, toggleMaximize }}>
      {children}
    </MaximizeContext.Provider>
  );
}

export function useMaximize() {
  const context = useContext(MaximizeContext);
  if (!context) {
    throw new Error('useMaximize must be used within MaximizeProvider');
  }
  return context;
}