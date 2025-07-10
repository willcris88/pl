/**
 * HOOK PERSONALIZADO PARA CONTROLE DA SIDEBAR
 * 
 * Este hook centraliza toda a lógica de controle da sidebar:
 * - Estado de expansão/colapso
 * - Persistência no localStorage
 * - Controle de hover para auto-expansão
 * - Integração com responsive design
 * 
 * Uso:
 * const { isCollapsed, toggleSidebar, setHoverExpanded } = useSidebar();
 */

import { useState, useEffect, useCallback } from "react";

interface SidebarState {
  isCollapsed: boolean;
  isHoverExpanded: boolean;
  isMobile: boolean;
}

interface SidebarControls {
  isCollapsed: boolean;
  isHoverExpanded: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  setHoverExpanded: (expanded: boolean) => void;
  getEffectiveWidth: () => string;
  getSidebarClasses: () => string;
}

const STORAGE_KEY = 'sidebar-state';
const MOBILE_BREAKPOINT = 768; // pixels

export function useSidebar(): SidebarControls {
  const [state, setState] = useState<SidebarState>(() => {
    // Inicialização com valores padrão
    const initialState: SidebarState = {
      isCollapsed: false,
      isHoverExpanded: false,
      isMobile: false
    };

    // Recuperar estado do localStorage apenas no cliente
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          initialState.isCollapsed = parsed.isCollapsed || false;
        }
        
        // Detectar se é mobile
        initialState.isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      } catch (error) {
        console.warn('Erro ao carregar estado da sidebar do localStorage:', error);
      }
    }

    return initialState;
  });

  // Salvar estado no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isCollapsed: state.isCollapsed
        }));
      } catch (error) {
        console.warn('Erro ao salvar estado da sidebar no localStorage:', error);
      }
    }
  }, [state.isCollapsed]);

  // Detectar mudanças de tamanho da tela
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setState(prev => ({
        ...prev,
        isMobile,
        // Auto-colapsar em mobile
        isCollapsed: isMobile ? true : prev.isCollapsed
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle da sidebar
  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCollapsed: !prev.isCollapsed,
      isHoverExpanded: false // Reset hover quando toggle manual
    }));
  }, []);

  // Controle de hover expansion
  const setHoverExpanded = useCallback((expanded: boolean) => {
    setState(prev => ({
      ...prev,
      isHoverExpanded: prev.isCollapsed ? expanded : false
    }));
  }, []);

  // Calcular largura efetiva da sidebar
  const getEffectiveWidth = useCallback((): string => {
    if (state.isMobile) {
      return state.isCollapsed ? "0px" : "280px";
    }
    
    if (state.isCollapsed && !state.isHoverExpanded) {
      return "64px"; // Largura colapsada
    }
    
    return "280px"; // Largura expandida
  }, [state.isCollapsed, state.isHoverExpanded, state.isMobile]);

  // Gerar classes CSS para a sidebar
  const getSidebarClasses = useCallback((): string => {
    const classes = [
      "fixed left-0 top-0 h-full z-50",
      "bg-white dark:bg-slate-900",
      "border-r border-gray-200 dark:border-slate-700",
      "transition-all duration-300 ease-in-out",
      "flex flex-col"
    ];

    // Largura
    if (state.isMobile) {
      classes.push(state.isCollapsed ? "w-0 overflow-hidden" : "w-[280px]");
    } else {
      if (state.isCollapsed && !state.isHoverExpanded) {
        classes.push("w-16");
      } else {
        classes.push("w-[280px]");
      }
    }

    // Estados especiais
    if (state.isHoverExpanded) {
      classes.push("shadow-xl z-60");
    }

    if (state.isMobile && !state.isCollapsed) {
      classes.push("shadow-2xl");
    }

    return classes.join(" ");
  }, [state.isCollapsed, state.isHoverExpanded, state.isMobile]);

  return {
    isCollapsed: state.isCollapsed,
    isHoverExpanded: state.isHoverExpanded,
    isMobile: state.isMobile,
    toggleSidebar,
    setHoverExpanded,
    getEffectiveWidth,
    getSidebarClasses
  };
}

/**
 * HOOK PARA CONTROLE DE LAYOUT RESPONSIVO
 * 
 * Ajusta o layout principal baseado no estado da sidebar
 */
export function useMainLayout() {
  const { isCollapsed, isHoverExpanded, isMobile, getEffectiveWidth } = useSidebar();

  const getMainContentClasses = useCallback((): string => {
    const classes = [
      "min-h-screen transition-all duration-300 ease-in-out"
    ];

    if (isMobile) {
      classes.push("ml-0");
    } else {
      const marginLeft = isCollapsed && !isHoverExpanded ? "ml-16" : "ml-[280px]";
      classes.push(marginLeft);
    }

    return classes.join(" ");
  }, [isCollapsed, isHoverExpanded, isMobile]);

  const getContentMaxWidth = useCallback((): string => {
    const sidebarWidth = parseInt(getEffectiveWidth().replace('px', ''));
    const maxWidth = `calc(100vw - ${sidebarWidth}px)`;
    return maxWidth;
  }, [getEffectiveWidth]);

  return {
    getMainContentClasses,
    getContentMaxWidth,
    isCollapsed,
    isMobile
  };
}

/**
 * CONTEXT PROVIDER PARA SIDEBAR (Opcional)
 * 
 * Para casos onde múltiplos componentes precisam acessar o estado da sidebar
 */
import { createContext, useContext, ReactNode } from "react";

const SidebarContext = createContext<SidebarControls | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const sidebarControls = useSidebar();

  return (
    <SidebarContext.Provider value={sidebarControls}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext(): SidebarControls {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext deve ser usado dentro de SidebarProvider');
  }
  return context;
}

/**
 * UTILITÁRIOS ADICIONAIS
 */

// Detecta se o usuário prefere sidebar colapsada por padrão
export function detectUserPreference(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Usuários em telas pequenas preferem colapsada
  if (window.innerWidth < 1200) return true;
  
  // Verificar preferência anterior
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.isCollapsed || false;
    }
  } catch (error) {
    console.warn('Erro ao detectar preferência do usuário:', error);
  }
  
  return false;
}

// Limpar estado da sidebar do localStorage
export function resetSidebarState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}