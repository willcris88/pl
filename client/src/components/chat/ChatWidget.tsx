/**
 * Widget de Chat em Tempo Real
 * Sistema completo inspirado no Messenger com WebSocket
 * Funcionalidades: envio/recebimento, status online/offline, notificações
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, User, Circle, Bell, Trash2, MoreVertical, Smile } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/contexts/NotificationContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  online?: boolean;
}

interface Mensagem {
  id: number;
  remetente_id: number;
  destinatario_id: number;
  conteudo: string;
  lida: boolean;
  criada_em: string;
  remetente?: { nome: string };
}

export function ChatWidget() {
  const { user } = useAuth();
  const { notificacoes, contadorNaoLidas, marcarComoLida, limparNotificacoes } = useNotifications();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Mensagem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastSentMessageRef = useRef<string | null>(null);

  // Lista de emojis populares
  const emojis = [
    "😊", "😂", "🤣", "😍", "😘", "😎", "🤔", "😢", "😭", "😡", "😱", "😅", "😆", "😉", "😜", "🤗", "👍", "👎", "👏", "🙏", "💪", "👋", "✨", "🔥", "💯", "❤️", "💙", "💚", "💛", "💜", "🧡", "🎉", "🎊", "🎈", "🎁", "🏆", "⚡", "🌟", "💫", "🌈"
  ];

  // Marcar como lida quando abrir o chat
  const handleOpenChat = () => {
    setIsOpen(true);
    if (contadorNaoLidas > 0) {
      marcarComoLida();
    }
  };

  // Abrir dropdown de notificações
  const handleOpenNotifications = () => {
    setIsNotificationOpen(true);
  };

  // Query para buscar usuários disponíveis
  const { data: usuariosData } = useQuery({
    queryKey: ["/api/usuarios"],
    enabled: isOpen && !!user,
  });

  // Garantir que usuarios seja sempre um array
  const usuarios = Array.isArray(usuariosData) ? usuariosData : [];

  // Query para contar mensagens não lidas
  const { data: unreadCount = { count: 0 } } = useQuery({
    queryKey: ["/api/chat/nao-lidas"],
    enabled: !!user,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Buscar mensagens com usuário selecionado
  const { data: mensagensData, refetch: refetchMensagens } = useQuery({
    queryKey: ["/api/chat/mensagens", selectedUser?.id],
    enabled: !!selectedUser && !!user,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // Garantir que mensagens seja sempre um array
  const mensagens = Array.isArray(mensagensData) ? mensagensData : [];

  // Mutation para enviar mensagem via API
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { destinatario_id: number; conteudo: string }) => {
      lastSentMessageRef.current = data.conteudo;
      return await apiRequest(`/api/chat/mensagens`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Refetch manual das mensagens após envio
      refetchMensagens();
      queryClient.invalidateQueries({ queryKey: ["/api/chat/nao-lidas"] });
      // Limpar após 2 segundos
      setTimeout(() => {
        lastSentMessageRef.current = null;
      }, 2000);
    },
  });

  // Mutation para excluir mensagem específica
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest(`/api/chat/mensagens/${messageId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      refetchMensagens();
    },
  });

  // Mutation para limpar conversa
  const clearConversationMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/chat/conversas/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      refetchMensagens();
    },
  });

  // Conectar WebSocket quando usuário estiver autenticado
  useEffect(() => {
    if (!user) return;

    // Fechar conexão anterior se existir
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Conectado ao WebSocket do chat");
        // Autenticar usuário no WebSocket
        ws.send(JSON.stringify({
          type: "auth",
          userId: user.id
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case "nova_mensagem":
              // Ignorar se for a mesma mensagem que acabou de enviar
              if (lastSentMessageRef.current && data.conteudo === lastSentMessageRef.current) {
                console.log("Ignorando mensagem recém-enviada:", data.conteudo);
                return;
              }
              
              // Refetch apenas se for mensagem recebida (não enviada)
              if (data.remetente_id !== user.id && selectedUser && data.remetente_id === selectedUser.id) {
                refetchMensagens();
              }
              // Atualizar contador de não lidas
              queryClient.invalidateQueries({ queryKey: ["/api/chat/nao-lidas"] });
              break;

            case "user_online":
              setOnlineUsers(prev => new Set([...prev, data.userId]));
              break;

            case "user_offline":
              setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
              });
              break;

            case "message_sent":
              // Confirmação de envio
              console.log("Mensagem enviada com sucesso");
              break;
          }
        } catch (error) {
          console.error("Erro ao processar mensagem WebSocket:", error);
        }
      };

      ws.onclose = () => {
        console.log("Conexão WebSocket fechada");
      };

      ws.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
      };

    } catch (error) {
      console.error("Erro ao conectar WebSocket:", error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, selectedUser, queryClient]);

  // Atualizar mensagens quando mensagens mudarem
  useEffect(() => {
    if (mensagens.length > 0) {
      setMessages(mensagens);
    } else if (selectedUser) {
      setMessages([]);
    }
  }, [mensagens, selectedUser]);

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !user) return;

    const messageData = {
      destinatario_id: selectedUser.id,
      conteudo: newMessage.trim()
    };

    // Enviar APENAS via API - o backend fará o broadcast via WebSocket
    try {
      await sendMessageMutation.mutateAsync(messageData);
      setNewMessage("");
      setShowEmojis(false);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  // Adicionar emoji à mensagem
  const handleAddEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  // Excluir mensagem
  const handleDeleteMessage = (messageId: number) => {
    if (confirm("Tem certeza que deseja excluir esta mensagem?")) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  // Limpar conversa
  const handleClearConversation = () => {
    if (selectedUser && confirm(`Tem certeza que deseja limpar toda a conversa com ${selectedUser.nome}?`)) {
      clearConversationMutation.mutate(selectedUser.id);
    }
  };

  // Filtrar usuários (excluir o próprio usuário)
  const availableUsers = usuarios.filter((u: Usuario) => u.id !== user?.id);

  if (!user) return null;

  return (
    <div className="relative flex items-center gap-2">
      {/* Botão de Notificações */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenNotifications}
        className="relative text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-secondary"
        title="Notificações"
      >
        <Bell className="h-5 w-5" />
        {contadorNaoLidas > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
          >
            {contadorNaoLidas > 99 ? "99+" : contadorNaoLidas}
          </Badge>
        )}
      </Button>

      {/* Botão do Chat */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenChat}
        className="relative text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-secondary"
        title="Chat"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>

      {/* Modal do Chat */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 h-96 bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!selectedUser ? (
            /* Lista de Usuários */
            <div className="flex-1 overflow-y-auto p-2">
              <h4 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                Usuários Disponíveis
              </h4>
              <div className="space-y-1">
                {availableUsers.map((usuario: Usuario) => (
                  <button
                    key={usuario.id}
                    onClick={() => setSelectedUser(usuario)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left"
                  >
                    <div className="relative">
                      <User className="h-8 w-8 p-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <Circle 
                        className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ${
                          onlineUsers.has(usuario.id) 
                            ? "fill-green-500 text-green-500" 
                            : "fill-gray-400 text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{usuario.nome}</p>
                      <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      onlineUsers.has(usuario.id)
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {onlineUsers.has(usuario.id) ? "Online" : "Offline"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conversa */
            <>
              {/* Header da Conversa */}
              <div className="flex items-center gap-2 p-3 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                  className="p-1"
                >
                  ←
                </Button>
                <User className="h-6 w-6 p-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedUser.nome}</p>
                  <p className={`text-xs ${
                    onlineUsers.has(selectedUser.id)
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500"
                  }`}>
                    {onlineUsers.has(selectedUser.id) ? "Online" : "Offline"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleClearConversation} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Conversa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.remetente_id === user.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className={`group flex items-end gap-2 ${
                      message.remetente_id === user.id ? "flex-row-reverse" : "flex-row"
                    }`}>
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.remetente_id === user.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        <p>{message.conteudo}</p>
                        <p className={`text-xs mt-1 ${
                          message.remetente_id === user.id
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {new Date(message.criada_em).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      {message.remetente_id === user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMessage(message.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensagem */}
              <div className="p-3 border-t">
                {/* Emojis */}
                {showEmojis && (
                  <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="grid grid-cols-8 gap-1 max-h-20 overflow-y-auto">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddEmoji(emoji)}
                          className="p-1 text-lg hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojis(!showEmojis)}
                    className="p-2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Dropdown de Notificações */}
      <NotificationDropdown
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}