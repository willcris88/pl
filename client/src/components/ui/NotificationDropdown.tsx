import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageCircle, AlertTriangle, CheckCircle, Trash2, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notificacoes, contadorNaoLidas, marcarComoLida, limparNotificacoes } = useNotifications();

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'chat':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'alerta':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'sistema':
        return <Bell className="h-4 w-4 text-green-500" />;
      case 'tarefa':
        return <CheckCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCardColor = (tipo: string, lida: boolean) => {
    if (lida) return 'bg-gray-50 dark:bg-gray-800/50';
    
    switch (tipo) {
      case 'chat':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
      case 'alerta':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
      case 'sistema':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
      case 'tarefa':
        return 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500';
      default:
        return 'bg-gray-50 dark:bg-gray-800/50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 max-h-[500px] bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Notificações
          </h3>
          {contadorNaoLidas > 0 && (
            <Badge variant="destructive" className="h-5 px-2 text-xs">
              {contadorNaoLidas}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notificacoes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparNotificacoes}
              className="text-gray-500 hover:text-red-500"
              title="Limpar todas"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="flex-1 overflow-y-auto">
        {notificacoes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {notificacoes.map((notificacao) => (
              <div
                key={notificacao.id}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${getCardColor(notificacao.tipo, notificacao.lida)}`}
                onClick={() => marcarComoLida(notificacao.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notificacao.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium ${!notificacao.lida ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {notificacao.titulo}
                      </h4>
                      {!notificacao.lida && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    
                    <p className={`text-sm ${!notificacao.lida ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                      {notificacao.mensagem}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      {notificacao.usuario && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {notificacao.usuario}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(notificacao.timestamp, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}