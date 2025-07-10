import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Car, 
  Camera, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  MapPin,
  Clock,
  User,
  AlertCircle,
  Upload,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MotoristaLogado {
  id: number;
  nome: string;
  sobrenome: string;
}

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  categoria: string;
}

interface OrdemServicoDetalhes {
  id: number;
  osNumero: string;
  osFalecido: string;
  osLocalRetirada: string;
  osLocalDestino: string;
  osDataServico: string;
  osHorarioServico: string;
  veiculoNome: string;
  observacoes: string | null;
}

type EtapaServico = 'placa' | 'fotos-saida' | 'informacoes' | 'fotos-chegada' | 'finalizado';

export default function MotoristaServico() {
  const [match] = useRoute("/motorista/servico/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [motoristaLogado, setMotoristaLogado] = useState<MotoristaLogado | null>(null);
  const [etapaAtual, setEtapaAtual] = useState<EtapaServico>('placa');
  const [placaSelecionada, setPlacaSelecionada] = useState('');
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);
  const [fotosSaida, setFotosSaida] = useState<File[]>([]);
  const [fotosChegada, setFotosChegada] = useState<File[]>([]);
  const [observacoesSaida, setObservacoesSaida] = useState('');
  const [observacoesChegada, setObservacoesChegada] = useState('');

  const fileInputSaidaRef = useRef<HTMLInputElement>(null);
  const fileInputChegadaRef = useRef<HTMLInputElement>(null);

  const ordemId = match?.id;

  useEffect(() => {
    const motorista = localStorage.getItem("motoristaLogado");
    if (!motorista) {
      setLocation("/motorista/login");
      return;
    }
    setMotoristaLogado(JSON.parse(motorista));
  }, []);

  // Buscar detalhes da ordem de serviço - SIMPLIFICADO PARA DEBUG
  const [ordemDetalhes, setOrdemDetalhes] = useState(null);
  const [loadingOrdem, setLoadingOrdem] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ordemId) return;
    
    console.log("=== INICIANDO FETCH MANUAL ===");
    console.log("ordemId:", ordemId);
    
    // Usar o ordemId diretamente como dados mocados para testar
    const mockData = {
      id: parseInt(ordemId),
      ordemServicoId: 1,
      observacoes: null,
      osNumero: "54",
      osFalecido: "3435324354435",
      osLocalRetirada: "Local de Retirada",
      osLocalDestino: "Local de Destino",
      osDataServico: "2025-07-08",
      osHorarioServico: "14:00",
    };
    
    console.log("=== USANDO DADOS MOCADOS PARA TESTE ===");
    console.log("mockData:", mockData);
    
    setOrdemDetalhes(mockData);
    setLoadingOrdem(false);
    setError(null);
  }, [ordemId]);

  // Buscar veículos disponíveis
  const { data: veiculos = [], isLoading: loadingVeiculos } = useQuery({
    queryKey: ['/api/veiculos'],
    queryFn: async () => {
      const response = await fetch('/api/veiculos', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Erro ao buscar veículos");
      return response.json();
    },
  });

  // Mutation para enviar checklist de saída
  const checklistSaidaMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/motorista/checklist-saida', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      if (!response.ok) throw new Error("Erro ao enviar checklist de saída");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Checklist de saída enviado!",
        description: "Fotos de saída registradas com sucesso.",
      });
      setEtapaAtual('informacoes');
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para enviar checklist de chegada e finalizar
  const checklistChegadaMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/motorista/checklist-chegada', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      if (!response.ok) throw new Error("Erro ao enviar checklist de chegada");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Serviço finalizado!",
        description: "Checklist de chegada registrado. Corrida concluída.",
      });
      setEtapaAtual('finalizado');
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const buscarVeiculoPorPlaca = () => {
    const veiculo = veiculos.find((v: Veiculo) => 
      v.placa.toUpperCase() === placaSelecionada.toUpperCase()
    );
    
    if (veiculo) {
      setVeiculoSelecionado(veiculo);
      setEtapaAtual('fotos-saida');
      toast({
        title: "Veículo encontrado!",
        description: `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`,
      });
    } else {
      toast({
        title: "Veículo não encontrado",
        description: "Verifique se a placa está correta.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (files: FileList | null, tipo: 'saida' | 'chegada') => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    
    if (tipo === 'saida') {
      const totalFiles = fotosSaida.length + newFiles.length;
      if (totalFiles > 4) {
        toast({
          title: "Limite excedido",
          description: "Máximo de 4 fotos de saída permitidas.",
          variant: "destructive",
        });
        return;
      }
      setFotosSaida(prev => [...prev, ...newFiles]);
    } else {
      const totalFiles = fotosChegada.length + newFiles.length;
      if (totalFiles > 4) {
        toast({
          title: "Limite excedido",
          description: "Máximo de 4 fotos de chegada permitidas.",
          variant: "destructive",
        });
        return;
      }
      setFotosChegada(prev => [...prev, ...newFiles]);
    }
  };

  const removerFoto = (index: number, tipo: 'saida' | 'chegada') => {
    if (tipo === 'saida') {
      setFotosSaida(prev => prev.filter((_, i) => i !== index));
    } else {
      setFotosChegada(prev => prev.filter((_, i) => i !== index));
    }
  };

  const enviarChecklistSaida = () => {
    if (fotosSaida.length !== 4) {
      toast({
        title: "Fotos incompletas",
        description: "É necessário enviar exatamente 4 fotos de saída.",
        variant: "destructive",
      });
      return;
    }

    // Usar o ID da vinculação motorista_ordem_servico em vez do ID da ordem
    console.log("ordemDetalhes completo:", ordemDetalhes);
    console.log("ordemDetalhes.id:", ordemDetalhes?.id);
    const motoristaOrdemServicoId = ordemDetalhes?.id;
    if (!motoristaOrdemServicoId) {
      console.error("ID da vinculação não encontrado. ordemDetalhes:", ordemDetalhes);
      toast({
        title: "Erro",
        description: "ID da vinculação não encontrado.",
        variant: "destructive",
      });
      return;
    }
    console.log("Usando motoristaOrdemServicoId:", motoristaOrdemServicoId);

    const formData = new FormData();
    formData.append('motoristaOrdemServicoId', motoristaOrdemServicoId.toString());
    formData.append('placaVeiculo', placaSelecionada);
    formData.append('observacoesSaida', observacoesSaida);
    
    fotosSaida.forEach((foto, index) => {
      formData.append(`foto${index + 1}`, foto);
    });

    checklistSaidaMutation.mutate(formData);
  };

  const enviarChecklistChegada = () => {
    if (fotosChegada.length !== 4) {
      toast({
        title: "Fotos incompletas",
        description: "É necessário enviar exatamente 4 fotos de chegada.",
        variant: "destructive",
      });
      return;
    }

    // Usar o ID da vinculação motorista_ordem_servico
    const motoristaOrdemServicoId = ordemDetalhes?.id;
    if (!motoristaOrdemServicoId) {
      toast({
        title: "Erro",
        description: "ID da vinculação não encontrado.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('motoristaOrdemServicoId', motoristaOrdemServicoId.toString());
    formData.append('observacoesChegada', observacoesChegada);
    
    fotosChegada.forEach((foto, index) => {
      formData.append(`foto${index + 1}`, foto);
    });

    checklistChegadaMutation.mutate(formData);
  };

  const voltarDashboard = () => {
    setLocation('/motorista/dashboard');
  };

  if (!motoristaLogado || loadingOrdem) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Erro no fetch:", error);
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Erro: {error.message}</div>
          <Button onClick={() => setLocation('/motorista/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={voltarDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Serviço em Andamento
              </h1>
              {ordemDetalhes && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  OS #{ordemDetalhes.osNumero} - {ordemDetalhes.osFalecido}
                </p>
              )}
            </div>

            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Indicador de progresso */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-4">
            {['placa', 'fotos-saida', 'informacoes', 'fotos-chegada', 'finalizado'].map((etapa, index) => (
              <div key={etapa} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  etapaAtual === etapa 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : index < ['placa', 'fotos-saida', 'informacoes', 'fotos-chegada', 'finalizado'].indexOf(etapaAtual)
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-slate-300 text-slate-400'
                }`}>
                  {index < ['placa', 'fotos-saida', 'informacoes', 'fotos-chegada', 'finalizado'].indexOf(etapaAtual) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                {index < 4 && (
                  <div className={`w-8 h-0.5 ${
                    index < ['placa', 'fotos-saida', 'informacoes', 'fotos-chegada', 'finalizado'].indexOf(etapaAtual)
                      ? 'bg-green-600'
                      : 'bg-slate-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Etapa 1: Informar placa do veículo */}
        {etapaAtual === 'placa' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Informar Placa do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="placa">Placa do Veículo</Label>
                <Input
                  id="placa"
                  type="text"
                  placeholder="ABC1234"
                  value={placaSelecionada}
                  onChange={(e) => setPlacaSelecionada(e.target.value.toUpperCase())}
                  className="h-12 text-lg font-mono tracking-wider"
                />
              </div>

              {loadingVeiculos ? (
                <p className="text-center text-slate-600">Carregando veículos...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {veiculos.map((veiculo: Veiculo) => (
                    <div
                      key={veiculo.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        placaSelecionada === veiculo.placa
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                      onClick={() => setPlacaSelecionada(veiculo.placa)}
                    >
                      <div className="font-medium">{veiculo.placa}</div>
                      <div className="text-sm text-slate-600">
                        {veiculo.marca} {veiculo.modelo} {veiculo.ano}
                      </div>
                      <div className="text-xs text-slate-500">
                        {veiculo.cor} • {veiculo.categoria}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={buscarVeiculoPorPlaca}
                disabled={!placaSelecionada}
                className="w-full"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Confirmar Veículo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Fotos de saída */}
        {etapaAtual === 'fotos-saida' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Checklist de Saída - 4 Fotos Obrigatórias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {veiculoSelecionado && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-300">
                    Veículo: {veiculoSelecionado.marca} {veiculoSelecionado.modelo}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-400">
                    Placa: {veiculoSelecionado.placa} • {veiculoSelecionado.cor}
                  </p>
                </div>
              )}

              <div>
                <Label>Tire 4 fotos do veículo (frontal, traseira, lateral direita, lateral esquerda)</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputSaidaRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={(e) => handleFileChange(e.target.files, 'saida')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputSaidaRef.current?.click()}
                    disabled={fotosSaida.length >= 4}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Tirar Fotos ({fotosSaida.length}/4)
                  </Button>
                </div>
              </div>

              {fotosSaida.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {fotosSaida.map((foto, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Foto de saída ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removerFoto(index, 'saida')}
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="obs-saida">Observações da Saída (opcional)</Label>
                <Textarea
                  id="obs-saida"
                  value={observacoesSaida}
                  onChange={(e) => setObservacoesSaida(e.target.value)}
                  placeholder="Anote qualquer observação sobre o estado do veículo na saída..."
                  rows={3}
                />
              </div>

              <Button
                onClick={enviarChecklistSaida}
                disabled={fotosSaida.length !== 4 || checklistSaidaMutation.isPending}
                className="w-full"
              >
                {checklistSaidaMutation.isPending ? (
                  "Enviando..."
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Confirmar Saída ({fotosSaida.length}/4 fotos)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Etapa 3: Informações da ordem de serviço */}
        {etapaAtual === 'informacoes' && ordemDetalhes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Informações do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-600 dark:text-slate-400">Ordem de Serviço</Label>
                    <p className="font-medium text-lg">#{ordemDetalhes.osNumero}</p>
                  </div>
                  
                  <div>
                    <Label className="text-slate-600 dark:text-slate-400">Falecido(a)</Label>
                    <p className="font-medium">{ordemDetalhes.osFalecido}</p>
                  </div>
                  
                  <div>
                    <Label className="text-slate-600 dark:text-slate-400">Data e Horário</Label>
                    <p className="font-medium">{ordemDetalhes.osDataServico} às {ordemDetalhes.osHorarioServico}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-600 dark:text-slate-400">Local de Retirada</Label>
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {ordemDetalhes.osLocalRetirada}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-slate-600 dark:text-slate-400">Local de Destino</Label>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {ordemDetalhes.osLocalDestino}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-slate-600 dark:text-slate-400">Veículo</Label>
                    <p className="font-medium">{ordemDetalhes.veiculoNome}</p>
                  </div>
                </div>
              </div>

              {ordemDetalhes.observacoes && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Label className="text-amber-800 dark:text-amber-300 font-medium">
                    Observações Importantes:
                  </Label>
                  <p className="text-amber-700 dark:text-amber-400 mt-2">
                    {ordemDetalhes.observacoes}
                  </p>
                </div>
              )}

              <Separator />

              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Realize o serviço conforme as informações acima. 
                  Quando retornar, tire as fotos de chegada para finalizar.
                </p>
                
                <Button
                  onClick={() => setEtapaAtual('fotos-chegada')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Serviço Realizado - Registrar Chegada
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 4: Fotos de chegada */}
        {etapaAtual === 'fotos-chegada' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Checklist de Chegada - 4 Fotos Obrigatórias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Tire 4 fotos do veículo na chegada (frontal, traseira, lateral direita, lateral esquerda)</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputChegadaRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={(e) => handleFileChange(e.target.files, 'chegada')}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputChegadaRef.current?.click()}
                    disabled={fotosChegada.length >= 4}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Tirar Fotos de Chegada ({fotosChegada.length}/4)
                  </Button>
                </div>
              </div>

              {fotosChegada.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {fotosChegada.map((foto, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Foto de chegada ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removerFoto(index, 'chegada')}
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="obs-chegada">Observações da Chegada (opcional)</Label>
                <Textarea
                  id="obs-chegada"
                  value={observacoesChegada}
                  onChange={(e) => setObservacoesChegada(e.target.value)}
                  placeholder="Anote qualquer observação sobre o estado do veículo na chegada..."
                  rows={3}
                />
              </div>

              <Button
                onClick={enviarChecklistChegada}
                disabled={fotosChegada.length !== 4 || checklistChegadaMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {checklistChegadaMutation.isPending ? (
                  "Finalizando..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar Corrida ({fotosChegada.length}/4 fotos)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Etapa 5: Finalizado */}
        {etapaAtual === 'finalizado' && (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Serviço Concluído!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                O checklist foi registrado com sucesso. A corrida foi finalizada.
              </p>
              
              <Button
                onClick={voltarDashboard}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}