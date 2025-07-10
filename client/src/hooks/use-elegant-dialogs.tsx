import { createContext, useContext, ReactNode } from 'react';
import { useNotification } from '@/components/ui/notification-dialog';
import { useConfirmation } from '@/components/ui/confirmation-dialog';

interface ElegantDialogsContextType {
  // Notificações
  showSuccess: (title: string, description: string, onClose?: () => void) => void;
  showError: (title: string, description: string, onClose?: () => void) => void;
  showWarning: (title: string, description: string, onClose?: () => void) => void;
  showInfo: (title: string, description: string, onClose?: () => void) => void;
  
  // Confirmações
  confirmDelete: (itemName: string, onConfirm: () => void) => void;
  confirmSave: (onConfirm: () => void) => void;
  confirmCancel: (onConfirm: () => void) => void;
  confirmAction: (title: string, description: string, onConfirm: () => void, variant?: 'default' | 'destructive' | 'success' | 'warning') => void;
}

const ElegantDialogsContext = createContext<ElegantDialogsContextType | null>(null);

export function ElegantDialogsProvider({ children }: { children: ReactNode }) {
  const { showSuccess, showError, showWarning, showInfo, NotificationModal } = useNotification();
  const { confirm, ConfirmationModal } = useConfirmation();

  const confirmDelete = (itemName: string, onConfirm: () => void) => {
    confirm({
      title: "Confirmar Exclusão",
      description: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
      variant: 'destructive',
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm
    });
  };

  const confirmSave = (onConfirm: () => void) => {
    confirm({
      title: "Salvar Alterações",
      description: "Deseja salvar as alterações realizadas?",
      variant: 'success',
      confirmText: "Salvar",
      cancelText: "Cancelar",
      onConfirm
    });
  };

  const confirmCancel = (onConfirm: () => void) => {
    confirm({
      title: "Cancelar Edição",
      description: "Tem certeza que deseja cancelar? Todas as alterações não salvas serão perdidas.",
      variant: 'warning',
      confirmText: "Sim, cancelar",
      cancelText: "Continuar editando",
      onConfirm
    });
  };

  const confirmAction = (
    title: string, 
    description: string, 
    onConfirm: () => void, 
    variant: 'default' | 'destructive' | 'success' | 'warning' = 'default'
  ) => {
    confirm({
      title,
      description,
      variant,
      onConfirm
    });
  };

  const contextValue: ElegantDialogsContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirmDelete,
    confirmSave,
    confirmCancel,
    confirmAction
  };

  return (
    <ElegantDialogsContext.Provider value={contextValue}>
      {children}
      {NotificationModal}
      {ConfirmationModal}
    </ElegantDialogsContext.Provider>
  );
}

export function useElegantDialogs() {
  const context = useContext(ElegantDialogsContext);
  if (!context) {
    throw new Error('useElegantDialogs must be used within an ElegantDialogsProvider');
  }
  return context;
}

// Helper functions para compatibilidade com código existente
export const elegantAlert = (message: string, title: string = "Aviso", variant: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  // Esta função pode ser usada como substituto direto do alert()
  // Mas recomenda-se usar o hook useElegantDialogs() dentro dos componentes
  console.warn('elegantAlert chamado fora de um componente React. Use useElegantDialogs() dentro de componentes.');
  alert(message); // Fallback temporário
};

export const elegantConfirm = (message: string, title: string = "Confirmação"): Promise<boolean> => {
  // Esta função pode ser usada como substituto direto do confirm()
  // Mas recomenda-se usar o hook useElegantDialogs() dentro dos componentes
  console.warn('elegantConfirm chamado fora de um componente React. Use useElegantDialogs() dentro de componentes.');
  return Promise.resolve(confirm(message)); // Fallback temporário
};