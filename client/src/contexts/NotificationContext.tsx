import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface NotificationItem {
  id: string;
  tipo: 'chat' | 'sistema' | 'tarefa' | 'alerta';
  titulo: string;
  mensagem: string;
  usuario?: string;
  avatar?: string;
  timestamp: Date;
  lida: boolean;
}

interface NotificationContextType {
  notificacoes: NotificationItem[];
  contadorNaoLidas: number;
  marcarComoLida: (id?: string) => void;
  adicionarNotificacao: (notificacao: Omit<NotificationItem, 'id' | 'timestamp' | 'lida'>) => void;
  setUsuarioOnline: (online: boolean) => void;
  limparNotificacoes: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notificacoes, setNotificacoes] = useState<NotificationItem[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { user } = useAuth();

  // Contador de notificações não lidas
  const contadorNaoLidas = notificacoes.filter(n => !n.lida).length;

  // Função para tocar som de notificação
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDO7vvznl0ccF1yb2O6nYhgL');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Erro ao tocar som:', e));
    } catch (e) {
      console.log('Som não suportado');
    }
  };

  // Função para marcar usuário como online/offline
  const setUsuarioOnline = async (online: boolean) => {
    try {
      await fetch('/api/chat/presenca', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ online }),
      });
    } catch (error) {
      console.error('❌ Erro ao marcar presença:', error);
    }
  };

  // Funções para gerenciar notificações
  const adicionarNotificacao = (notificacao: Omit<NotificationItem, 'id' | 'timestamp' | 'lida'>) => {
    const novaNotificacao: NotificationItem = {
      ...notificacao,
      id: Date.now().toString(),
      timestamp: new Date(),
      lida: false,
    };

    setNotificacoes(prev => [novaNotificacao, ...prev.slice(0, 19)]); // Manter apenas 20 notificações
  };

  const marcarComoLida = (id?: string) => {
    if (id) {
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } else {
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    }
  };

  const limparNotificacoes = () => {
    setNotificacoes([]);
  };

  // Configurar WebSocket quando usuário está logado
  useEffect(() => {
    if (!user) return;

    // Marcar usuário como online ao logar
    setUsuarioOnline(true);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('🔗 WebSocket conectado para notificações globais');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'nova_mensagem') {
          // Só notificar se não for mensagem própria
          if (data.remetente_id !== user.id) {
            playNotificationSound();
            
            // Adicionar notificação de chat
            adicionarNotificacao({
              tipo: 'chat',
              titulo: 'Nova mensagem',
              mensagem: data.conteudo.length > 50 ? data.conteudo.substring(0, 50) + '...' : data.conteudo,
              usuario: data.remetente.nome,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao processar notificação WebSocket:', error);
      }
    };

    socket.onclose = () => {
      console.log('🔌 WebSocket desconectado');
      setWs(null);
    };

    // Cleanup ao sair
    return () => {
      setUsuarioOnline(false);
      socket.close();
    };
  }, [user]);

  // Marcar usuário como offline ao fechar a página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        setUsuarioOnline(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notificacoes,
      contadorNaoLidas,
      marcarComoLida,
      adicionarNotificacao,
      setUsuarioOnline,
      limparNotificacoes,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider');
  }
  return context;
};