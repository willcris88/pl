/**
 * CALENDÁRIO VISUAL COMPLETO
 * 
 * Interface de calendário com visualização em grade mensal:
 * - Visualização de calendário por mês/semana
 * - Clique em qualquer dia para criar evento
 * - Eventos exibidos nos dias correspondentes
 * - Modal para criação/edição de eventos
 * - Navegação entre meses
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ResponsiveLayout } from "@/components/layout/responsive-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Users
} from "lucide-react";

interface EventoCalendario {
  id: number;
  usuarioId: number;
  titulo: string;
  descricao?: string;
  dataInicio: string;
  horaInicio?: string;
  dataFim?: string;
  horaFim?: string;
  diaInteiro: boolean;
  tipoEvento: string;
  prioridade: string;
  status: string;
  localizacao?: string;
  participantes?: string;
  cor: string;
}

const TIPOS_EVENTO = [
  { value: 'pessoal', label: 'Pessoal', cor: '#3b82f6' },
  { value: 'trabalho', label: 'Trabalho', cor: '#ef4444' },
  { value: 'compromisso', label: 'Compromisso', cor: '#f97316' },
  { value: 'reuniao', label: 'Reunião', cor: '#8b5cf6' },
  { value: 'tarefa', label: 'Tarefa', cor: '#10b981' },
  { value: 'evento', label: 'Evento', cor: '#ec4899' },
  { value: 'outro', label: 'Outro', cor: '#14b8a6' }
];

const PRIORIDADES = [
  { value: 'baixa', label: 'Baixa', cor: '#10b981' },
  { value: 'normal', label: 'Normal', cor: '#3b82f6' },
  { value: 'alta', label: 'Alta', cor: '#f97316' },
  { value: 'urgente', label: 'Urgente', cor: '#ef4444' }
];

const STATUS_EVENTO = [
  { value: 'pendente', label: 'Pendente', cor: '#f59e0b' },
  { value: 'confirmado', label: 'Confirmado', cor: '#10b981' },
  { value: 'cancelado', label: 'Cancelado', cor: '#ef4444' },
  { value: 'concluido', label: 'Concluído', cor: '#6b7280' }
];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'July', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Calendario() {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [dialogAberto, setDialogAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<EventoCalendario | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<string>("");
  const [visualizacao, setVisualizacao] = useState<'mes' | 'semana'>('mes');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Usar hook de autenticação existente
  const { user: usuario } = useAuth();
  
  // Debug: mostrar dados do usuário e eventos
  console.log('Usuario atual:', usuario);
  if (eventoEditando && usuario) {
    console.log('Evento sendo editado:', eventoEditando);
    console.log('IDs - Usuario:', usuario.id, 'Evento Usuario:', eventoEditando.usuarioId);
    console.log('Pode editar?:', !eventoEditando || (usuario && eventoEditando.usuarioId === usuario.id));
  }

  // Query para buscar todos os eventos (compartilhados)
  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['/api/calendario/eventos', dataAtual.getFullYear(), dataAtual.getMonth()],
    queryFn: async () => {
      // Buscar eventos do mês inteiro
      const inicioMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
      const fimMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
      
      const params = new URLSearchParams({
        dataInicio: inicioMes.toISOString().split('T')[0],
        dataFim: fimMes.toISOString().split('T')[0]
      });
      
      const response = await fetch(`/api/calendario/eventos?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Erro ao buscar eventos');
      return response.json();
    }
  });

  // Mutation para criar/atualizar evento
  const mutationSalvar = useMutation({
    mutationFn: async (dados: any) => {
      const url = eventoEditando 
        ? `/api/calendario/eventos/${eventoEditando.id}`
        : '/api/calendario/eventos';
      
      console.log('Salvando evento:', { url, dados, method: eventoEditando ? 'PATCH' : 'POST' });
      
      const response = await fetch(url, {
        method: eventoEditando ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dados)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const resultado = await response.json();
      console.log('Evento salvo:', resultado);
      return resultado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/calendario/eventos', dataAtual.getFullYear(), dataAtual.getMonth()] 
      });
      setDialogAberto(false);
      setEventoEditando(null);
      setDiaSelecionado("");
      toast({
        title: "Sucesso",
        description: eventoEditando ? "Evento atualizado!" : "Evento criado!"
      });
    },
    onError: (error: any) => {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "Erro", 
        description: `Erro ao salvar evento: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  });

  // Mutation para excluir evento
  const mutationExcluir = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/calendario/eventos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao excluir evento: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/calendario/eventos', dataAtual.getFullYear(), dataAtual.getMonth()] 
      });
      toast({
        title: "Sucesso",
        description: "Evento excluído!"
      });
    }
  });

  const excluirEvento = (evento: EventoCalendario) => {
    // Verificar se o usuário pode excluir este evento
    if (usuario && evento.usuarioId && usuario.id !== evento.usuarioId) {
      toast({
        title: "Acesso Negado",
        description: "Você só pode excluir seus próprios eventos.",
        variant: "destructive"
      });
      return;
    }
    
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      mutationExcluir.mutate(evento.id);
    }
  };

  // Gerar dias do calendário
  const diasCalendario = useMemo(() => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();
    
    const dias = [];
    
    // Dias do mês anterior para preencher início
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const dia = ultimoDiaMesAnterior - i;
      const data = new Date(ano, mes - 1, dia);
      dias.push({
        dia,
        data: data.toISOString().split('T')[0],
        isOutroMes: true,
        isHoje: false
      });
    }
    
    // Dias do mês atual
    const hoje = new Date().toISOString().split('T')[0];
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes, dia);
      const dataStr = data.toISOString().split('T')[0];
      dias.push({
        dia,
        data: dataStr,
        isOutroMes: false,
        isHoje: dataStr === hoje
      });
    }
    
    // Dias do próximo mês para preencher fim
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 dias
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const data = new Date(ano, mes + 1, dia);
      dias.push({
        dia,
        data: data.toISOString().split('T')[0],
        isOutroMes: true,
        isHoje: false
      });
    }
    
    return dias;
  }, [dataAtual]);

  // Agrupar eventos por data
  const eventosPorData = useMemo(() => {
    return eventos.reduce((acc: Record<string, EventoCalendario[]>, evento: EventoCalendario) => {
      const data = evento.dataInicio;
      if (!acc[data]) acc[data] = [];
      acc[data].push(evento);
      return acc;
    }, {});
  }, [eventos]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const dados = {
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
      dataInicio: formData.get('dataInicio') as string,
      horaInicio: formData.get('horaInicio') as string,
      dataFim: formData.get('dataFim') as string,
      horaFim: formData.get('horaFim') as string,
      diaInteiro: formData.get('diaInteiro') === 'on',
      tipoEvento: formData.get('tipoEvento') as string,
      prioridade: formData.get('prioridade') as string,
      status: formData.get('status') as string,
      localizacao: formData.get('localizacao') as string,
      participantes: formData.get('participantes') as string,
      cor: formData.get('cor') as string,
    };

    if (!dados.titulo) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    mutationSalvar.mutate(dados);
  };

  const abrirDialogCriacao = (data?: string) => {
    setEventoEditando(null);
    setDiaSelecionado(data || "");
    setDialogAberto(true);
  };

  const abrirDialogEdicao = (evento: EventoCalendario) => {
    // Abrir modal sempre para visualizar, mas controlar edição pelos botões
    setEventoEditando(evento);
    setDialogAberto(true);
  };

  const navegarMes = (direcao: 'anterior' | 'proximo') => {
    setDataAtual(prev => {
      const novaData = new Date(prev);
      if (direcao === 'anterior') {
        novaData.setMonth(prev.getMonth() - 1);
      } else {
        novaData.setMonth(prev.getMonth() + 1);
      }
      return novaData;
    });
  };

  const formatarData = (data: string, hora?: string) => {
    const dataObj = new Date(data);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR');
    
    if (hora) {
      return `${dataFormatada} às ${hora}`;
    }
    
    return dataFormatada;
  };

  const obterCorTipo = (tipo: string) => {
    return TIPOS_EVENTO.find(t => t.value === tipo)?.cor || '#3b82f6';
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Calendário
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie seus eventos e compromissos
            </p>
          </div>
          
          <Button onClick={() => abrirDialogCriacao()} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        {/* Controles do Calendário */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navegarMes('anterior')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <h2 className="text-xl font-semibold">
                  {MESES[dataAtual.getMonth()]} {dataAtual.getFullYear()}
                </h2>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navegarMes('proximo')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDataAtual(new Date())}
                >
                  Hoje
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={visualizacao === 'mes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVisualizacao('mes')}
                >
                  Mês
                </Button>
                <Button
                  variant={visualizacao === 'semana' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVisualizacao('semana')}
                >
                  Semana
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendário */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando calendário...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700">
                {/* Cabeçalho dos dias da semana */}
                {DIAS_SEMANA.map(dia => (
                  <div 
                    key={dia}
                    className="p-3 text-center font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
                  >
                    {dia}
                  </div>
                ))}
                
                {/* Dias do calendário */}
                {diasCalendario.map((diaInfo, index) => {
                  const eventosNoDia = eventosPorData[diaInfo.data] || [];
                  
                  return (
                    <div
                      key={index}
                      className={`
                        relative p-2 min-h-[120px] border-b border-r border-gray-200 dark:border-gray-700 
                        cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                        ${diaInfo.isOutroMes ? 'text-gray-400 bg-gray-50 dark:bg-gray-900' : ''}
                        ${diaInfo.isHoje ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      `}
                      onClick={() => !diaInfo.isOutroMes && abrirDialogCriacao(diaInfo.data)}
                    >
                      {/* Número do dia */}
                      <div className={`
                        text-sm font-medium mb-1
                        ${diaInfo.isHoje ? 'text-blue-600 dark:text-blue-400' : ''}
                      `}>
                        {diaInfo.dia}
                      </div>
                      
                      {/* Eventos do dia */}
                      <div className="space-y-1">
                        {eventosNoDia.slice(0, 3).map(evento => (
                          <div
                            key={evento.id}
                            className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                            style={{ 
                              backgroundColor: evento.cor + '20',
                              borderLeft: `3px solid ${evento.cor}`
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirDialogEdicao(evento);
                            }}
                          >
                            <div className="font-medium truncate">{evento.titulo}</div>
                            {evento.horaInicio && (
                              <div className="text-gray-600 dark:text-gray-400">
                                {evento.horaInicio}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {eventosNoDia.length > 3 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{eventosNoDia.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Evento */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {eventoEditando 
                  ? (usuario && eventoEditando.usuarioId === usuario.id 
                      ? 'Editar Evento' 
                      : 'Visualizar Evento')
                  : 'Novo Evento'}
              </DialogTitle>
              <DialogDescription>
                {eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id
                  ? 'Visualizando evento de outro usuário'
                  : 'Preencha os dados do evento'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    defaultValue={eventoEditando?.titulo || ''}
                    required
                    readOnly={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                    className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}

                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    defaultValue={eventoEditando?.descricao || ''}
                    rows={2}
                    readOnly={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                    className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dataInicio">Data de Início *</Label>
                  <Input
                    id="dataInicio"
                    name="dataInicio"
                    type="date"
                    defaultValue={eventoEditando?.dataInicio || diaSelecionado}
                    required
                    readOnly={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                    className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="horaInicio">Hora de Início</Label>
                  <Input
                    id="horaInicio"
                    name="horaInicio"
                    type="time"
                    defaultValue={eventoEditando?.horaInicio || ''}
                    readOnly={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                    className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dataFim">Data de Fim</Label>
                  <Input
                    id="dataFim"
                    name="dataFim"
                    type="date"
                    defaultValue={eventoEditando?.dataFim || eventoEditando?.dataInicio || diaSelecionado}
                    readOnly={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                    className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="horaFim">Hora de Fim</Label>
                  <Input
                    id="horaFim"
                    name="horaFim"
                    type="time"
                    defaultValue={eventoEditando?.horaFim || ''}
                    readOnly={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                    className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipoEvento">Tipo</Label>
                  <Select 
                    name="tipoEvento" 
                    defaultValue={eventoEditando?.tipoEvento || 'pessoal'}
                    disabled={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                  >
                    <SelectTrigger 
                      className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_EVENTO.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select 
                    name="prioridade" 
                    defaultValue={eventoEditando?.prioridade || 'normal'}
                    disabled={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                  >
                    <SelectTrigger 
                      className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORIDADES.map(prioridade => (
                        <SelectItem key={prioridade.value} value={prioridade.value}>
                          {prioridade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    name="status" 
                    defaultValue={eventoEditando?.status || 'pendente'}
                    disabled={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                  >
                    <SelectTrigger 
                      className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_EVENTO.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    name="localizacao"
                    defaultValue={eventoEditando?.localizacao || ''}
                    readOnly={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                    className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="participantes">Participantes</Label>
                  <Input
                    id="participantes"
                    name="participantes"
                    placeholder="Separar por vírgula"
                    defaultValue={eventoEditando?.participantes || ''}
                    readOnly={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                    className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    name="cor"
                    type="color"
                    defaultValue={eventoEditando?.cor || '#3b82f6'}
                    readOnly={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id}
                    className={eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                {/* Botão excluir só aparece se for o dono do evento */}
                {eventoEditando && usuario && eventoEditando.usuarioId === usuario.id && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => excluirEvento(eventoEditando)}
                    disabled={mutationExcluir.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                )}
                
                <div className="flex gap-2 ml-auto">
                  <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                    {eventoEditando && usuario && eventoEditando.usuarioId !== usuario.id ? 'Fechar' : 'Cancelar'}
                  </Button>
                  {/* Botão salvar só aparece se for o dono do evento ou novo evento */}
                  {(!eventoEditando || (usuario && eventoEditando.usuarioId === usuario.id)) && (
                    <Button type="submit" disabled={mutationSalvar.isPending}>
                      {mutationSalvar.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                  )}

                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveLayout>
  );
}