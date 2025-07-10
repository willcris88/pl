import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Car, 
  User, 
  LogOut, 
  Clock, 
  MapPin, 
  Camera, 
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Calendar,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMotoristaUpdates } from "@/hooks/use-motorista-updates";

interface MotoristaLogado {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cnh: string;
}

interface OrdemServicoVinculada {
  id: number;
  ordemServicoId: number;
  motoristaId: number;
  veiculoProdutoId: number;
  horaSaida: string | null;
  horaChegada: string | null;
  status: string;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
  
  // Novos campos do serviço
  dataServico: string | null;
  horaServico: string | null;
  localOrigem: string | null;
  localDestino: string | null;
  tipoVeiculo: string | null;
  
  // Dados da ordem de serviço
  ordem: {
    id: number;
    numeroOs: string;
    nomeFalecido: string;
    contratante: string;
    enderecoCorpo: string;
    localVelorio: string;
    enderecoSepultamento: string;
    dataHoraSepultamento: string;
    telefoneResponsavel: string;
    status: string;
  };
  
  // Dados do veículo
  veiculo: {
    id: number;
    nome: string;
    categoria: string;
    tipo: string;
  };
}

export default function MotoristaDashboard() {
  const [motoristaLogado, setMotoristaLogado] = useState<MotoristaLogado | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const motorista = localStorage.getItem("motoristaLogado");
    if (!motorista) {
      setLocation("/motorista/login");
      return;
    }
    setMotoristaLogado(JSON.parse(motorista));
  }, []);

  // Hook para atualizações automáticas
  useMotoristaUpdates(motoristaLogado);

  // Buscar ordens de serviço vinculadas ao motorista com atualização dinâmica
  const { data: ordensVinculadas = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/motorista/ordens-servico', motoristaLogado?.id],
    queryFn: async () => {
      if (!motoristaLogado) return [];
      
      const response = await fetch(`/api/motorista/ordens-servico?motoristaId=${motoristaLogado.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Erro ao buscar ordens vinculadas");
      return response.json();
    },
    enabled: !!motoristaLogado,
    refetchInterval: 10000, // Atualiza a cada 10 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5000, // Considera dados válidos por 5 segundos
  });

  const handleLogout = () => {
    localStorage.removeItem("motoristaLogado");
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    setLocation("/motorista/login");
  };

  const handleIniciarServico = (motoristaOrdemServicoId: number) => {
    setLocation(`/motorista/servico/${motoristaOrdemServicoId}`);
  };

  // Atualizar dados quando houver mudanças
  useEffect(() => {
    const interval = setInterval(() => {
      if (motoristaLogado) {
        refetch();
      }
    }, 15000); // Atualiza a cada 15 segundos

    return () => clearInterval(interval);
  }, [motoristaLogado, refetch]);

  if (!motoristaLogado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Portal do Motorista
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Bem-vindo, {motoristaLogado.nome} {motoristaLogado.sobrenome}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Informações do motorista */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Minhas Informações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Email</p>
                <p className="font-medium">{motoristaLogado.email}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Telefone</p>
                <p className="font-medium">{motoristaLogado.telefone}</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">CNH</p>
                <p className="font-medium">{motoristaLogado.cnh}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ordens de serviço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ordens de Serviço Vinculadas
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Atualização automática
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="h-8 px-3"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Atualizar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-slate-600">Carregando...</p>
            ) : ordensVinculadas.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Nenhuma ordem de serviço vinculada no momento
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ordensVinculadas.map((ordem: OrdemServicoVinculada) => {
                  console.log("Ordem sendo renderizada:", ordem);
                  return (
                    <div
                    key={ordem.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                          OS #{ordem.ordem?.numeroOs || 'N/A'}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          {ordem.ordem?.nomeFalecido || 'Nome não informado'}
                        </p>
                      </div>
                      <Badge 
                        variant={ordem.status === 'concluido' ? 'default' : 'secondary'}
                        className={ordem.status === 'concluido' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {ordem.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span>
                            {ordem.dataServico && ordem.horaServico ? 
                              `${ordem.dataServico} às ${ordem.horaServico}` : 
                              ordem.ordem?.dataHoraSepultamento ? 
                                new Date(ordem.ordem.dataHoraSepultamento).toLocaleString('pt-BR') : 
                                'Data não informada'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-slate-500" />
                          <span>{ordem.tipoVeiculo || ordem.veiculo?.nome || 'Veículo não informado'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span>{ordem.ordem?.telefoneResponsavel || 'Telefone não informado'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span>De: {ordem.localOrigem || ordem.ordem?.enderecoCorpo || 'Local não informado'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-slate-500" />
                          <span>Para: {ordem.localDestino || ordem.ordem?.enderecoSepultamento || 'Destino não informado'}</span>
                        </div>
                        {(ordem.localOrigem || ordem.localDestino) && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              ✓ Informações personalizadas do serviço
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {ordem.observacoes && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Observações:</strong> {ordem.observacoes}
                        </p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {ordem.horaSaida ? (
                          <span>Saída: {new Date(ordem.horaSaida).toLocaleString('pt-BR')}</span>
                        ) : (
                          <span>Aguardando início</span>
                        )}
                        {ordem.horaChegada && (
                          <span className="ml-4">
                            Chegada: {new Date(ordem.horaChegada).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>

                      {ordem.status !== 'concluido' && (
                        <Button
                          onClick={() => handleIniciarServico(ordem.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {ordem.horaSaida ? (
                            <>
                              <Camera className="h-4 w-4 mr-2" />
                              Continuar Serviço
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Iniciar Serviço
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}