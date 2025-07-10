import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Car, User, Phone, CreditCard, Clock, MapPin, FileText, Trash2, AlertTriangle, Camera, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface MotoristaTabProps {
  ordemServicoId: number;
}

interface MotoristaVinculado {
  id: number;
  ordemServicoId: number;
  motoristaId: number;
  veiculoProdutoId: number | null;
  horaSaida: string | null;
  horaChegada: string | null;
  status: string;
  observacoes: string | null;
  criadoEm: string;
  motoristaNome: string;
  motoristaSobrenome: string;
  motoristaEmail: string | null;
  motoristaTelefone: string | null;
  motoristaCnh: string | null;
  veiculoNome: string | null;
  veiculoCategoria: string | null;
}

export function MotoristaTab({ ordemServicoId }: MotoristaTabProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [fotosExpandidas, setFotosExpandidas] = useState<{ [key: number]: boolean }>({});

  // Force cache invalidation on mount to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/motoristas-ordem-servico'] });
  }, [queryClient]);

  const { data: motoristasVinculados = [], isLoading } = useQuery({
    queryKey: ['/api/motoristas-ordem-servico', ordemServicoId],
    queryFn: async () => {
      const response = await fetch(`/api/motoristas-ordem-servico?ordemServicoId=${ordemServicoId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Erro ao buscar motoristas vinculados");
      return response.json();
    },
    enabled: !!ordemServicoId,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Função para buscar fotos do checklist
  const buscarFotosChecklist = async (motoristaOrdemServicoId: number) => {
    try {
      const response = await fetch(`/api/motorista/checklist-fotos/${motoristaOrdemServicoId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar fotos:", error);
      return null;
    }
  };

  const toggleFotos = (motoristaId: number) => {
    setFotosExpandidas(prev => ({
      ...prev,
      [motoristaId]: !prev[motoristaId]
    }));
  };

  // Mutation para remover motorista vinculado
  const removeMotoristaMutation = useMutation({
    mutationFn: async (vinculoId: number) => {
      const response = await fetch(`/api/motoristas-ordem-servico/${vinculoId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Erro ao remover motorista");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Motorista removido com sucesso!",
      });
      // Invalidar cache para atualizar listas
      queryClient.invalidateQueries({ queryKey: ['/api/motoristas-ordem-servico'] });
      queryClient.invalidateQueries({ queryKey: ['/produtos-os'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover motorista",
        variant: "destructive",
      });
    },
  });

  const formatarDataHora = (data: string | null) => {
    if (!data) return "Não definido";
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Aba */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-teal-500 text-white">
          <Car className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Motoristas Vinculados
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Dados do motorista
          </p>
        </div>
      </div>

      {/* Lista de Motoristas Vinculados */}
      <div className="grid gap-4">
        {motoristasVinculados.length > 0 ? (
          motoristasVinculados.map((motorista: MotoristaVinculado) => (
            <div key={motorista.id}>
              <Card className="bg-slate-700 dark:bg-slate-800 border-slate-600 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-500 text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {motorista.motoristaNome} {motorista.motoristaSobrenome}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-300">
                          {motorista.veiculoNome || "Não especificado"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    motorista.status === 'concluido' 
                      ? "bg-green-500 text-white border-green-400"
                      : "bg-orange-500 text-white border-orange-400"
                  }>
                    {motorista.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  {motorista.motoristaTelefone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-purple-400" />
                      <span className="text-slate-300">{motorista.motoristaTelefone}</span>
                    </div>
                  )}
                  
                  {motorista.motoristaCnh && (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-purple-400" />
                      <span className="text-slate-300">CNH: {motorista.motoristaCnh}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">
                      Saída: {formatarDataHora(motorista.horaSaida)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">
                      Chegada: {formatarDataHora(motorista.horaChegada)}
                    </span>
                  </div>
                </div>

                {motorista.observacoes && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">
                        {motorista.observacoes}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  {/* Botão para expandir/recolher fotos do checklist */}
                  {(motorista.status === 'concluido' || motorista.status === 'em_andamento') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-blue-500 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900"
                      onClick={() => toggleFotos(motorista.id)}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      {fotosExpandidas[motorista.id] ? 'Ocultar Fotos' : 'Ver Fotos'}
                      {fotosExpandidas[motorista.id] ? 
                        <ChevronUp className="h-4 w-4 ml-1" /> : 
                        <ChevronDown className="h-4 w-4 ml-1" />
                      }
                    </Button>
                  )}
                  
                  {/* Só mostra botão Remover se status não for 'concluido' */}
                  {motorista.status !== 'concluido' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white dark:bg-slate-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Confirmar Exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
                          Tem certeza que deseja remover este motorista da ordem de serviço?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => removeMotoristaMutation.mutate(motorista.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
              </Card>
              
              {/* Seção de Fotos Expandida */}
              {fotosExpandidas[motorista.id] && (
                <FotosChecklistCard motoristaOrdemServicoId={motorista.id} />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhum motorista vinculado</p>
            <p className="text-sm mt-2">
              Acesse a aba "Produtos" para vincular motoristas aos veículos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para exibir fotos do checklist
function FotosChecklistCard({ motoristaOrdemServicoId }: { motoristaOrdemServicoId: number }) {
  const [fotos, setFotos] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarFotos = async () => {
      try {
        const response = await fetch(`/api/motorista/checklist-fotos/${motoristaOrdemServicoId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setFotos(data);
        }
      } catch (error) {
        console.error("Erro ao buscar fotos:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarFotos();
  }, [motoristaOrdemServicoId]);

  if (loading) {
    return (
      <Card className="mt-4 bg-slate-100 dark:bg-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-slate-600">Carregando fotos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 bg-slate-100 dark:bg-slate-800 border-l-4 border-l-blue-500">
      <CardContent className="p-6 space-y-6">
        
        {/* Fotos de Saída */}
        {fotos?.saida && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Checklist de Saída</h4>
              <Badge variant="outline" className="text-xs">
                {new Date(fotos.saida.criadoEm).toLocaleString('pt-BR')}
              </Badge>
            </div>
            
            {fotos.saida.observacoesSaida && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md mb-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Observações:</strong> {fotos.saida.observacoesSaida}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[fotos.saida.foto1, fotos.saida.foto2, fotos.saida.foto3, fotos.saida.foto4]
                .filter(Boolean)
                .map((foto, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={`/api/motorista/fotos/${foto}`}
                      alt={`Foto de saída ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(`/api/motorista/fotos/${foto}`, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-md flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Fotos de Chegada */}
        {fotos?.chegada && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Checklist de Chegada</h4>
              <Badge variant="outline" className="text-xs">
                {new Date(fotos.chegada.criadoEm).toLocaleString('pt-BR')}
              </Badge>
            </div>
            
            {fotos.chegada.observacoesChegada && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Observações:</strong> {fotos.chegada.observacoesChegada}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[fotos.chegada.foto1, fotos.chegada.foto2, fotos.chegada.foto3, fotos.chegada.foto4]
                .filter(Boolean)
                .map((foto, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={`/api/motorista/fotos/${foto}`}
                      alt={`Foto de chegada ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(`/api/motorista/fotos/${foto}`, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-md flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* Caso não haja fotos */}
        {!fotos?.saida && !fotos?.chegada && (
          <div className="text-center py-6">
            <Camera className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nenhuma foto de checklist encontrada para este serviço.
            </p>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}