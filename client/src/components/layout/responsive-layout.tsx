/**
 * LAYOUT RESPONSIVO UNIVERSAL
 * 
 * Componente para layout 100% responsivo que se adapta a:
 * - Desktop (sidebar fixa expandida)
 * - Tablet (sidebar colapsável com hover)
 * - Mobile (sidebar overlay)
 * - Fullscreen (mantém sidebar funcional)
 * 
 * Uso:
 * <ResponsiveLayout>
 *   <YourPageContent />
 * </ResponsiveLayout>
 */

import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import Header from "./header";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export function ResponsiveLayout({ 
  children, 
  className, 
  showSidebar = true, 
  showHeader = true 
}: ResponsiveLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Detectar mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {showHeader && <Header />}

        {/* Área de Conteúdo */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-background">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay para mobile quando sidebar aberta */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            // Implementar fechamento da sidebar em mobile
            // Este evento será capturado pelo contexto da sidebar
          }}
        />
      )}
    </div>
  );
}

/**
 * LAYOUT PARA PÁGINAS COM CONTEÚDO FLEXÍVEL
 * 
 * Ideal para dashboards, calendários, etc.
 */
export function FlexibleLayout({ children, ...props }: ResponsiveLayoutProps) {
  return (
    <ResponsiveLayout {...props}>
      <div className="h-full flex flex-col">
        {children}
      </div>
    </ResponsiveLayout>
  );
}

/**
 * LAYOUT PARA FORMULÁRIOS E PÁGINAS DE CONTEÚDO
 * 
 * Ideal para forms, listagens, etc.
 */
export function ContentLayout({ children, ...props }: ResponsiveLayoutProps) {
  return (
    <ResponsiveLayout {...props}>
      <div className="space-y-6">
        {children}
      </div>
    </ResponsiveLayout>
  );
}

/**
 * HOOK PARA DETECÇÃO DE BREAKPOINTS
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  };
}

/**
 * HOOK PARA FULLSCREEN
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  const exitFullscreen = () => {
    document.exitFullscreen?.();
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}