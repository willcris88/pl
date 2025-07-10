/**
 * DASHBOARD PESSOAL DO MOTORISTA
 * 
 * Sistema dedicado para motoristas visualizarem seus serviços com:
 * - Lista de serviços atribuídos ao motorista
 * - Detalhes de cada serviço (local de coleta, destino, tipo)
 * - Sistema de checklist com 4 fotos obrigatórias
 * - Controle de horários (saída/chegada)
 * - Interface otimizada para mobile
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Truck, 
  MapPin, 
  Clock, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  LogOut,
  User,
  Calendar,
  Route,
  Phone,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";

interface ServicoMotorista {
  id: number;
  ordemServicoId: number;
  nomeDefunto: string;
  endereco: string;
  telefone: string;
  servico: string;
  observacoes: string;
  horarioSaida: string | null;
  horarioChegada: string | null;
  checklistCompleto: boolean;
  fotos: {
    id: number;
    tipo: string;
    url: string;
    timestamp: string;
  }[];
  viatura: {
    id: number;
    nome: string;
    modelo: string;
    placa: string;
  };
}

interface ChecklistFoto {
  tipo: string;
  obrigatoria: boolean;
  descricao: string;
}

const tiposChecklistObrigatorios: ChecklistFoto[] = [
  { tipo: "veiculo_antes", obrigatoria: true, descricao: "Veículo antes do serviço" },
  { tipo: "local_coleta", obrigatoria: true, descricao: "Local de coleta" },
  { tipo: "durante_servico", obrigatoria: true, descricao: "Durante o serviço" },
  { tipo: "veiculo_depois", obrigatoria: true, descricao: "Veículo após o serviço" }
];

export default function DashboardMotorista() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [servicoSelecionado, setServicoSelecionado] = useState<ServicoMotorista | null>(null);
  const [mostrarChecklist, setMostrarChecklist] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null);
  const [tipoFotoAtual, setTipoFotoAtual] = useState<string>("");

  // Buscar serviços do motorista
  const { data: servicos, isLoading } = useQuery({
    queryKey: ["/api/servicos-motorista/meus-servicos"],
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Buscar dados do motorista
  const { data: motorista } = useQuery({
    queryKey: ["/api/servicos-motorista/perfil"]
  });

  // Mutation para registrar saída
  const registrarSaidaMutation = useMutation({
    mutationFn: async (servicoId: number) => {
      const response = await fetch(`/api/servicos-motorista/${servicoId}/saida`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        throw new Error("Erro ao registrar saída");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Saída registrada",
        description: "Horário de saída registrado com sucesso",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/servicos-motorista/meus-servicos"] });
    }
  });

  // Mutation para registrar chegada
  const registrarChegadaMutation = useMutation({
    mutationFn: async (servicoId: number) => {
      const response = await fetch(`/api/servicos-motorista/${servicoId}/chegada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        throw new Error("Erro ao registrar chegada");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Chegada registrada",
        description: "Horário de chegada registrado com sucesso",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/servicos-motorista/meus-servicos"] });
    }
  });

  // Mutation para upload de foto
  const uploadFotoMutation = useMutation({
    mutationFn: async ({ servicoId, tipo, arquivo }: { servicoId: number; tipo: string; arquivo: File }) => {
      const formData = new FormData();
      formData.append("foto", arquivo);
      formData.append("tipo", tipo);
      
      const response = await fetch(`/api/servicos-motorista/${servicoId}/foto`, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error("Erro ao enviar foto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Foto enviada",
        description: "Foto do checklist enviada com sucesso",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/servicos-motorista/meus-servicos"] });
    }
  });

  const handleLogout = () => {
    fetch("/api/servicos-motorista/logout", { method: "POST" })
      .then(() => {
        setLocation("/login-motorista");
      });
  };

  const handleCapturarFoto = (tipo: string) => {
    setTipoFotoAtual(tipo);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // Usar câmera traseira
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && servicoSelecionado) {
        uploadFotoMutation.mutate({
          servicoId: servicoSelecionado.id,
          tipo: tipo,
          arquivo: file
        });
      }
    };
    input.click();
  };

  const calcularProgressoChecklist = (servico: ServicoMotorista) => {
    const fotosObrigatorias = tiposChecklistObrigatorios.length;
    const fotosEnviadas = servico.fotos.filter(f => 
      tiposChecklistObrigatorios.some(t => t.tipo === f.tipo)
    ).length;
    return (fotosEnviadas / fotosObrigatorias) * 100;
  };

  const podeIniciarServico = (servico: ServicoMotorista) => {
    return calcularProgressoChecklist(servico) === 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {motorista?.nome || "Motorista"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CNH: {motorista?.cnh || "N/A"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Meus Serviços
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {servicos?.length || 0} serviços atribuídos
          </p>
        </div>

        {/* Lista de Serviços */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicos?.map((servico: ServicoMotorista) => (
            <Card key={servico.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {servico.nomeDefunto}
                  </CardTitle>
                  <Badge variant={servico.checklistCompleto ? "default" : "secondary"}>
                    OS #{servico.ordemServicoId}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informações do Serviço */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{servico.endereco}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{servico.telefone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span>{servico.servico}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Truck className="w-4 h-4" />
                    <span>{servico.viatura.nome} - {servico.viatura.placa}</span>
                  </div>
                </div>

                {/* Progresso do Checklist */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Checklist</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(calcularProgressoChecklist(servico))}%
                    </span>
                  </div>
                  <Progress value={calcularProgressoChecklist(servico)} className="h-2" />
                </div>

                {/* Horários */}
                <div className="flex justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Saída: {servico.horarioSaida ? new Date(servico.horarioSaida).toLocaleTimeString() : "Não registrada"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Chegada: {servico.horarioChegada ? new Date(servico.horarioChegada).toLocaleTimeString() : "Não registrada"}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col space-y-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => setServicoSelecionado(servico)}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Checklist
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Checklist - {servico.nomeDefunto}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {tiposChecklistObrigatorios.map((tipo) => {
                          const fotoExistente = servico.fotos.find(f => f.tipo === tipo.tipo);
                          return (
                            <div key={tipo.tipo} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center space-x-3">
                                {fotoExistente ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-5 h-5 text-orange-500" />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {tipo.descricao}
                                  </p>
                                  {fotoExistente && (
                                    <p className="text-xs text-gray-500">
                                      Enviada: {new Date(fotoExistente.timestamp).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {!fotoExistente && (
                                <Button
                                  size="sm"
                                  onClick={() => handleCapturarFoto(tipo.tipo)}
                                  disabled={uploadFotoMutation.isPending}
                                >
                                  <Camera className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Botões de Saída/Chegada */}
                  <div className="flex space-x-2">
                    {!servico.horarioSaida && podeIniciarServico(servico) && (
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => registrarSaidaMutation.mutate(servico.id)}
                        disabled={registrarSaidaMutation.isPending}
                      >
                        <Route className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    )}
                    
                    {servico.horarioSaida && !servico.horarioChegada && (
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => registrarChegadaMutation.mutate(servico.id)}
                        disabled={registrarChegadaMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Chegar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há serviços */}
        {(!servicos || servicos.length === 0) && (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum serviço atribuído
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Você não possui serviços atribuídos no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}