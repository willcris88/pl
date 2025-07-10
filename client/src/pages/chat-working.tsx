import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Send, Settings, ChevronDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  online?: boolean;
  ultima_atividade?: string;
}

interface Mensagem {
  id: number;
  remetente_id: number;
  destinatario_id: number;
  conteudo: string;
  lida: boolean;
  criada_em: string;
  remetente?: Usuario;
}

export default function ChatWorking() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Função para buscar usuários
  const buscarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/usuarios', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
        console.log('✅ Usuários carregados:', data);
      } else {
        console.error('❌ Erro ao carregar usuários:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para marcar usuário como online
  const marcarOnline = async () => {
    try {
      await fetch('/api/chat/presenca', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ online: true }),
      });
    } catch (error) {
      console.error('❌ Erro ao marcar online:', error);
    }
  };

  // Função para buscar mensagens
  const buscarMensagens = async (usuarioId: number) => {
    try {
      const response = await fetch(`/api/chat/mensagens/${usuarioId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMensagens(data);
      } else {
        console.error('❌ Erro ao carregar mensagens:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
    }
  };

  // Função para enviar mensagem
  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !usuarioSelecionado) return;

    const mensagemTemp = {
      id: Date.now(),
      conteudo: novaMensagem.trim(),
      remetente_id: user?.id,
      destinatario_id: usuarioSelecionado.id,
      criada_em: new Date().toISOString(),
      remetente: { nome: user?.nome },
      lida: false,
    };

    // Adicionar mensagem instantaneamente na interface
    setMensagens(prev => [...prev, mensagemTemp]);
    setNovaMensagem('');
    
    // Scroll para baixo
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const response = await fetch('/api/chat/mensagens', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinatario_id: usuarioSelecionado.id,
          conteudo: mensagemTemp.conteudo,
        }),
      });

      if (!response.ok) {
        // Remover mensagem se falhou
        setMensagens(prev => prev.filter(m => m.id !== mensagemTemp.id));
        console.error('❌ Erro ao enviar mensagem:', response.status);
      }
    } catch (error) {
      // Remover mensagem se falhou
      setMensagens(prev => prev.filter(m => m.id !== mensagemTemp.id));
      console.error('❌ Erro na requisição:', error);
    }
  };

  // Efeito para carregar usuários
  useEffect(() => {
    if (user) {
      buscarUsuarios();
      marcarOnline();
    }
  }, [user]);

  // Efeito para WebSocket
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Conectado ao WebSocket do chat');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'nova_mensagem') {
          // Tocar som de notificação
          playNotificationSound();
          
          // Se a conversa está aberta, atualizar mensagens instantaneamente
          if (usuarioSelecionado && (data.remetente_id === usuarioSelecionado.id || data.destinatario_id === usuarioSelecionado.id)) {
            // Adicionar mensagem instantaneamente se for de conversa ativa
            const novaMensagemWS = {
              id: data.id || Date.now(),
              conteudo: data.conteudo,
              remetente_id: data.remetente_id,
              destinatario_id: data.destinatario_id,
              criada_em: data.criada_em,
              remetente: data.remetente || { nome: 'Usuário' },
              lida: false,
            };
            
            setMensagens(prev => {
              // Evitar duplicatas
              const exists = prev.some(m => m.id === novaMensagemWS.id);
              if (!exists) {
                return [...prev, novaMensagemWS];
              }
              return prev;
            });
            
            // Scroll para baixo
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };

    socket.onclose = () => {
      console.log('Conexão WebSocket fechada');
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, [user, usuarioSelecionado]);

  // Efeito para scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Filtrar usuários pela busca
  const usuariosFiltrados = usuarios.filter(u => 
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Faça login para acessar o chat</h2>
          <p className="text-gray-600">Você precisa estar autenticado para usar o sistema de chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Lista de usuários */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Chat</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar pessoas"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de usuários */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Carregando usuários...</div>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Nenhum usuário encontrado</div>
              </div>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <div
                  key={usuario.id}
                  onClick={() => {
                    setUsuarioSelecionado(usuario);
                    buscarMensagens(usuario.id);
                  }}
                  className={cn(
                    "flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors",
                    usuarioSelecionado?.id === usuario.id && "bg-blue-50 border border-blue-200"
                  )}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {usuario.nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {usuario.nome}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          usuario.online ? "bg-green-400" : "bg-gray-300"
                        )} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {usuario.email}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área de conversa */}
      <div className="flex-1 flex flex-col">
        {!usuarioSelecionado ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Selecione uma conversa
              </h2>
              <p className="text-gray-500">
                Escolha um usuário para começar a conversar
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header da conversa */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {usuarioSelecionado.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {usuarioSelecionado.nome}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {usuarioSelecionado.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {mensagens.map((mensagem) => (
                  <div
                    key={mensagem.id}
                    className={cn(
                      "flex",
                      mensagem.remetente_id === user.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                        mensagem.remetente_id === user.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <p className="text-sm">{mensagem.conteudo}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        mensagem.remetente_id === user.id ? "text-blue-100" : "text-gray-500"
                      )}>
                        {new Date(mensagem.criada_em).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input para nova mensagem */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  enviarMensagem();
                }}
                className="flex items-center space-x-2"
              >
                <Input
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!novaMensagem.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}