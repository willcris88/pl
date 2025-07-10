import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Car, ArrowLeft, CheckCircle, MapPin, Calendar, User, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type EtapaServico = 'veiculo' | 'fotos-saida' | 'informacoes' | 'fotos-chegada' | 'finalizado';

export default function MotoristaServicoSimples() {
  const [, params] = useRoute("/motorista/servico/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const ordemId = params?.id;

  const [etapaAtual, setEtapaAtual] = useState<EtapaServico>('veiculo');
  const [ordemDetalhes, setOrdemDetalhes] = useState(null);
  const [veiculos, setVeiculos] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState('');
  const [fotosSaida, setFotosSaida] = useState<File[]>([]);
  const [fotosChegada, setFotosChegada] = useState<File[]>([]);
  const [observacoesSaida, setObservacoesSaida] = useState('');
  const [observacoesChegada, setObservacoesChegada] = useState('');
  
  const fileInputSaidaRef = useRef<HTMLInputElement>(null);
  const fileInputChegadaRef = useRef<HTMLInputElement>(null);

  console.log("=== COMPONENTE CARREGADO ===");
  console.log("ordemId:", ordemId);

  useEffect(() => {
    if (!ordemId) return;
    
    // Buscar dados da API e veículos
    const fetchDados = async () => {
      try {
        // Buscar detalhes da ordem
        const responseOrdem = await fetch(`/api/motorista/ordem-detalhes/${ordemId}`, {
          credentials: 'include'
        });
        
        if (responseOrdem.ok) {
          const data = await responseOrdem.json();
          console.log("Dados da API:", data);
          setOrdemDetalhes(data);
          
          // Determinar etapa baseada no estado dos checklists
          if (data.checklistChegadaFeito) {
            setEtapaAtual('finalizado');
          } else if (data.checklistSaidaFeito) {
            setEtapaAtual('informacoes');
          } else {
            setEtapaAtual('veiculo');
          }
        } else {
          console.log("API não encontrou dados, usando mock");
          setOrdemDetalhes({
            id: parseInt(ordemId),
            osNumero: "54",
            osFalecido: "João Silva",
            osLocalRetirada: "Hospital Central",
            osLocalDestino: "Cemitério Municipal", 
            osDataServico: "2025-07-08",
            osHorarioServico: "14:00"
          });
        }

        // Buscar veículos disponíveis
        const responseVeiculos = await fetch('/api/motorista/veiculos', {
          credentials: 'include'
        });
        
        if (responseVeiculos.ok) {
          const dadosVeiculos = await responseVeiculos.json();
          setVeiculos(dadosVeiculos);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setOrdemDetalhes({
          id: parseInt(ordemId),
          osNumero: "54", 
          osFalecido: "João Silva",
          osLocalRetirada: "Hospital Central",
          osLocalDestino: "Cemitério Municipal",
          osDataServico: "2025-07-08",
          osHorarioServico: "14:00"
        });
      }
    };

    fetchDados();
  }, [ordemId]);

  const handleFotoSaida = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const novasFotos = Array.from(e.target.files);
      setFotosSaida(prev => [...prev, ...novasFotos]);
    }
  };

  const handleFotoChegada = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const novasFotos = Array.from(e.target.files);
      setFotosChegada(prev => [...prev, ...novasFotos]);
    }
  };

  const enviarChecklistSaida = async () => {
    if (fotosSaida.length < 4) {
      toast({
        title: "Fotos insuficientes",
        description: "Necessário pelo menos 4 fotos de saída",
        variant: "destructive"
      });
      return;
    }

    const veiculoEscolhido = veiculos.find(v => v.id.toString() === veiculoSelecionado);
    const placaVeiculo = veiculoEscolhido?.placa || '';

    const formData = new FormData();
    formData.append('motoristaOrdemServicoId', ordemId);
    formData.append('placaVeiculo', placaVeiculo);
    formData.append('observacoesSaida', observacoesSaida);
    
    fotosSaida.forEach((foto, index) => {
      formData.append(`foto${index + 1}`, foto);
    });

    try {
      const response = await fetch('/api/motorista/checklist-saida', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Checklist de saída enviado!",
          description: "Fotos registradas com sucesso"
        });
        setEtapaAtual('informacoes');
      } else {
        throw new Error("Erro no servidor");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar checklist",
        variant: "destructive"
      });
    }
  };

  const enviarChecklistChegada = async () => {
    if (fotosChegada.length < 4) {
      toast({
        title: "Fotos insuficientes", 
        description: "Necessário pelo menos 4 fotos de chegada",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('motoristaOrdemServicoId', ordemId);
    formData.append('observacoesChegada', observacoesChegada);
    
    fotosChegada.forEach((foto, index) => {
      formData.append(`foto${index + 1}`, foto);
    });

    try {
      const response = await fetch('/api/motorista/checklist-chegada', {
        method: 'POST', 
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Serviço finalizado!",
          description: "Checklist de chegada enviado com sucesso"
        });
        setEtapaAtual('finalizado');
      } else {
        throw new Error("Erro no servidor");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao finalizar serviço",
        variant: "destructive"
      });
    }
  };

  if (!ordemId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div>ID da ordem não encontrado</div>
      </div>
    );
  }

  if (!ordemDetalhes) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Car className="h-8 w-8 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Botão Voltar para Início */}
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={() => setLocation('/motorista/dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Voltar para Início
          </Button>
        </div>
        
        {/* Header com informações da ordem */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">OS #{ordemDetalhes.osNumero}</CardTitle>
                <p className="text-slate-600 dark:text-slate-400">{ordemDetalhes.osFalecido}</p>
              </div>
              <Badge variant="secondary">
                {etapaAtual === 'finalizado' ? 'Concluído' : 'Em Andamento'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{ordemDetalhes.osDataServico} às {ordemDetalhes.osHorarioServico}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>De: {ordemDetalhes.osLocalRetirada}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>Para: {ordemDetalhes.osLocalDestino}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Etapa: Seleção de veículo */}
        {etapaAtual === 'veiculo' && (
          <Card>
            <CardHeader>
              <CardTitle>Seleção do Veículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="veiculo">Escolha o Veículo</Label>
                <Select value={veiculoSelecionado} onValueChange={setVeiculoSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {veiculos.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id.toString()}>
                        {veiculo.marca} {veiculo.modelo} - {veiculo.placa} ({veiculo.ano})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {veiculoSelecionado && (
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                  {(() => {
                    const veiculo = veiculos.find(v => v.id.toString() === veiculoSelecionado);
                    return (
                      <div>
                        <h3 className="font-semibold">{veiculo?.marca} {veiculo?.modelo}</h3>
                        <p className="text-sm text-slate-600">Placa: {veiculo?.placa}</p>
                        <p className="text-sm text-slate-600">Ano: {veiculo?.ano}</p>
                        <p className="text-sm text-slate-600">Categoria: {veiculo?.categoria}</p>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              <Button 
                onClick={() => setEtapaAtual('fotos-saida')}
                className="w-full"
                disabled={!veiculoSelecionado}
              >
                Confirmar Veículo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Etapa: Fotos de saída */}
        {etapaAtual === 'fotos-saida' && (
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Saída</CardTitle>
              <p className="text-sm text-slate-600">Tire 4 fotos obrigatórias do veículo</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputSaidaRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFotoSaida}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputSaidaRef.current?.click()}
                className="w-full"
                variant="outline"
              >
                <Camera className="h-4 w-4 mr-2" />
                Tirar Fotos ({fotosSaida.length}/4)
              </Button>

              {fotosSaida.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {fotosSaida.map((foto, index) => (
                    <div key={index} className="aspect-video bg-slate-200 rounded-md overflow-hidden">
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Foto de saída ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="obs-saida">Observações (opcional)</Label>
                <Textarea
                  id="obs-saida"
                  value={observacoesSaida}
                  onChange={(e) => setObservacoesSaida(e.target.value)}
                  placeholder="Adicione observações sobre o estado do veículo..."
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEtapaAtual('veiculo')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={enviarChecklistSaida}
                  className="flex-1"
                  disabled={fotosSaida.length < 4}
                >
                  Confirmar Saída
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa: Informações do serviço */}
        {etapaAtual === 'informacoes' && (
          <Card>
            <CardHeader>
              <CardTitle>Serviço em Andamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Saída Confirmada</h3>
                <p className="text-slate-600 mb-6">
                  Dirija-se ao local de destino com segurança
                </p>
                <Button onClick={() => setEtapaAtual('fotos-chegada')}>
                  Chegou ao Destino
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa: Fotos de chegada */}
        {etapaAtual === 'fotos-chegada' && (
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Chegada</CardTitle>
              <p className="text-sm text-slate-600">Tire 4 fotos obrigatórias de chegada</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputChegadaRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFotoChegada}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputChegadaRef.current?.click()}
                className="w-full"
                variant="outline"
              >
                <Camera className="h-4 w-4 mr-2" />
                Tirar Fotos ({fotosChegada.length}/4)
              </Button>

              {fotosChegada.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {fotosChegada.map((foto, index) => (
                    <div key={index} className="aspect-video bg-slate-200 rounded-md overflow-hidden">
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Foto de chegada ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="obs-chegada">Observações (opcional)</Label>
                <Textarea
                  id="obs-chegada"
                  value={observacoesChegada}
                  onChange={(e) => setObservacoesChegada(e.target.value)}
                  placeholder="Adicione observações sobre a chegada..."
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEtapaAtual('informacoes')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={enviarChecklistChegada}
                  className="flex-1"
                  disabled={fotosChegada.length < 4}
                >
                  Finalizar Serviço
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa: Finalizado */}
        {etapaAtual === 'finalizado' && (
          <Card>
            <CardHeader>
              <CardTitle>Serviço Concluído</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Parabéns!</h3>
                <p className="text-slate-600 mb-6">
                  Serviço finalizado com sucesso
                </p>
                <Button onClick={() => setLocation('/motorista/dashboard')}>
                  Voltar ao Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}