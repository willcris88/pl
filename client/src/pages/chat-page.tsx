import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

interface Conversa {
  usuario: Usuario;
  ultima_mensagem?: Mensagem;
  mensagens_nao_lidas: number;
}

export default function ChatPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [busca, setBusca] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug do estado do usuário
  console.log('🔍 Estado do usuário:', user);
  console.log('🔍 Usuário logado?', !!user);
  console.log('🔍 Chat page montada!');

  // Buscar usuários online
  const { data: usuariosData, error: errorUsuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['/api/chat/usuarios'],
    refetchInterval: 10000, // Atualizar a cada 10 segundos
    enabled: !!user, // Só executa se o usuário estiver logado
    queryFn: async () => {
      console.log('🔍 Fazendo query para /api/chat/usuarios');
      const response = await fetch('/api/chat/usuarios', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📊 Response data:', data);
      return data;
    },
  });

  // Garantir que usuarios seja sempre um array
  const usuarios = Array.isArray(usuariosData) ? usuariosData : [];

  // Debug dos usuários
  console.log('👥 Usuarios carregados:', usuarios);
  console.log('🔄 Loading usuarios:', loadingUsuarios);
  if (errorUsuarios) {
    console.error('❌ Erro ao carregar usuários:', errorUsuarios);
  }

  // Buscar conversas
  const { data: conversasData, error: errorConversas } = useQuery({
    queryKey: ['/api/chat/conversas'],
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Garantir que conversas seja sempre um array
  const conversas = Array.isArray(conversasData) ? conversasData : [];

  // Debug das conversas
  console.log('💬 Conversas carregadas:', conversas);
  if (errorConversas) {
    console.error('❌ Erro ao carregar conversas:', errorConversas);
  }

  // Buscar mensagens da conversa atual
  const { data: mensagensData } = useQuery({
    queryKey: ['/api/chat/mensagens', usuarioSelecionado?.id],
    enabled: !!usuarioSelecionado,
    refetchInterval: 2000, // Atualizar a cada 2 segundos
  });

  // Garantir que mensagens seja sempre um array
  const mensagens = Array.isArray(mensagensData) ? mensagensData : [];

  // Mutation para enviar mensagem
  const enviarMensagemMutation = useMutation({
    mutationFn: async (data: { destinatario_id: number; conteudo: string }) => {
      const response = await fetch('/api/chat/mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Erro ao enviar mensagem');
      return response.json();
    },
    onSuccess: () => {
      setNovaMensagem('');
      queryClient.invalidateQueries({ queryKey: ['/api/chat/mensagens'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversas'] });
    },
  });

  // WebSocket para tempo real
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
        if (data.type === 'nova_mensagem' || data.type === 'usuario_online' || data.type === 'usuario_offline') {
          queryClient.invalidateQueries({ queryKey: ['/api/chat/conversas'] });
          queryClient.invalidateQueries({ queryKey: ['/api/chat/usuarios'] });
          if (usuarioSelecionado) {
            queryClient.invalidateQueries({ queryKey: ['/api/chat/mensagens', usuarioSelecionado.id] });
          }
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket desconectado');
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, [user, queryClient, usuarioSelecionado]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handleEnviarMensagem = () => {
    if (!novaMensagem.trim() || !usuarioSelecionado) return;

    enviarMensagemMutation.mutate({
      destinatario_id: usuarioSelecionado.id,
      conteudo: novaMensagem.trim(),
    });
  };

  const usuariosFiltrados = usuarios.filter((usuario: Usuario) =>
    usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busca.toLowerCase())
  );

  const formatarHora = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    if (data.toDateString() === hoje.toDateString()) {
      return formatarHora(dataString);
    } else if (data.toDateString() === ontem.toDateString()) {
      return 'Ontem';
    } else {
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Painel Esquerdo - Lista de Conversas */}
      <div className={cn(
        "w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col",
        usuarioSelecionado ? "hidden lg:flex" : "flex"
      )}>
        {/* Header do Chat */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-white bg-indigo-600 px-3 py-2 rounded-lg">
              Chat
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar pessoas"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-gray-100 dark:bg-gray-700 border-none"
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversas.map((conversa: Conversa) => (
              <div
                key={conversa.usuario.id}
                onClick={() => setUsuarioSelecionado(conversa.usuario)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                  usuarioSelecionado?.id === conversa.usuario.id && "bg-gray-50 dark:bg-gray-700"
                )}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 font-medium">
                      {getIniciais(conversa.usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  {conversa.usuario.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {conversa.usuario.nome}
                    </p>
                    {conversa.ultima_mensagem && (
                      <span className="text-xs text-gray-500">
                        {formatarData(conversa.ultima_mensagem.criada_em)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conversa.ultima_mensagem?.conteudo || 'Nenhuma mensagem ainda'}
                  </p>
                </div>

                {conversa.mensagens_nao_lidas > 0 && (
                  <div className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversa.mensagens_nao_lidas}
                  </div>
                )}
              </div>
            ))}

            {/* Usuários sem conversa */}
            {usuariosFiltrados.filter((u: Usuario) => 
              u.id !== user?.id && !conversas.find((c: Conversa) => c.usuario.id === u.id)
            ).map((usuario: Usuario) => (
              <div
                key={usuario.id}
                onClick={() => setUsuarioSelecionado(usuario)}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                      {getIniciais(usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  {usuario.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {usuario.nome}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {usuario.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Painel Direito - Conversa */}
      <div className={cn(
        "flex-1 flex flex-col",
        !usuarioSelecionado ? "hidden lg:flex" : "flex"
      )}>
        {usuarioSelecionado ? (
          <>
            {/* Header da Conversa */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setUsuarioSelecionado(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>

                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 font-medium">
                      {getIniciais(usuarioSelecionado.nome)}
                    </AvatarFallback>
                  </Avatar>
                  {usuarioSelecionado.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {usuarioSelecionado.nome}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {usuarioSelecionado.online ? 'Online' : 'Offline'}
                  </p>
                </div>

                <Button variant="ghost" size="sm">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {mensagens.map((mensagem: Mensagem) => (
                  <div
                    key={mensagem.id}
                    className={cn(
                      "flex",
                      mensagem.remetente_id === user?.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                        mensagem.remetente_id === user?.id
                          ? "bg-indigo-600 text-white ml-auto"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      )}
                    >
                      <p className="text-sm">{mensagem.conteudo}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          mensagem.remetente_id === user?.id
                            ? "text-indigo-200"
                            : "text-gray-500"
                        )}
                      >
                        {formatarHora(mensagem.criada_em)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enviar uma mensagem"
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                  className="flex-1"
                />
                <Button
                  onClick={handleEnviarMensagem}
                  disabled={!novaMensagem.trim() || enviarMensagemMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Estado vazio */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha um usuário para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}