import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, FileText, Calendar, MapPin, ArrowRight, Car, Clock } from "lucide-react";

interface VincularMotoristaModalProps {
  open: boolean;
  onClose: () => void;
  vehicleId: number | null;
  ordemServicoId: number;
}

interface Motorista {
  id: number;
  nome: string;
  sobrenome: string;
  telefone?: string;
  email?: string;
  cnh?: string;
  observacoes?: string;
}

export function VincularMotoristaModal({ open, onClose, vehicleId, ordemServicoId }: VincularMotoristaModalProps) {
  const [motoristaId, setMotoristaId] = useState("");
  const [dataServico, setDataServico] = useState("");
  const [horaServico, setHoraServico] = useState("");
  const [localOrigem, setLocalOrigem] = useState("");
  const [localDestino, setLocalDestino] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados da ordem de serviço
  const { data: ordemServico } = useQuery({
    queryKey: ['/api/ordens-servico', ordemServicoId],
    queryFn: async () => {
      const response = await fetch(`/api/ordens-servico/${ordemServicoId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Erro ao buscar ordem de serviço");
      return response.json();
    },
    enabled: !!ordemServicoId && open,
  });

  // Buscar dados do veículo
  const { data: veiculo } = useQuery({
    queryKey: ['/api/produtos-os', vehicleId],
    queryFn: async () => {
      const response = await fetch(`/api/produtos-os?ordemServicoId=${ordemServicoId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Erro ao buscar veículo");
      const produtos = await response.json();
      return produtos.find((p: any) => p.id === vehicleId);
    },
    enabled: !!vehicleId && open,
  });

  // Query para buscar motoristas disponíveis
  const { data: motoristas = [], isLoading: loadingMotoristas, error: errorMotoristas } = useQuery({
    queryKey: ['/api/motoristas'],
    queryFn: async () => {
      console.log("Frontend: Buscando motoristas...");
      const response = await fetch("/api/motoristas", {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error("Frontend: Erro na resposta motoristas:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Frontend: Texto do erro:", errorText);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      console.log("Frontend: Motoristas recebidos:", result);
      
      // Se a resposta tem uma estrutura com data, extrair os dados
      if (result && result.data && Array.isArray(result.data)) {
        return result.data;
      }
      
      // Se for diretamente um array
      if (Array.isArray(result)) {
        return result;
      }
      
      console.warn("Frontend: Resposta não é um array:", result);
      return [];
    },
    enabled: open,
    retry: 1,
  });

  const vincularMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/motoristas-ordem-servico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Motorista vinculado com sucesso!",
      });
      
      // Invalidar cache para atualizar listas
      queryClient.invalidateQueries({ queryKey: ['/api/motoristas-ordem-servico'] });
      queryClient.invalidateQueries({ queryKey: ['/produtos-os'] });
      
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      console.error("Erro ao vincular motorista:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao vincular motorista",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setMotoristaId("");
    setDataServico("");
    setHoraServico("");
    setLocalOrigem("");
    setLocalDestino("");
    setTipoVeiculo("");
    setObservacoes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motoristaId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um motorista.",
        variant: "destructive",
      });
      return;
    }
    
    vincularMutation.mutate({
      ordemServicoId,
      motoristaId: parseInt(motoristaId),
      veiculoProdutoId: vehicleId,
      dataServico,
      horaServico,
      localOrigem,
      localDestino,
      tipoVeiculo,
      observacoes: observacoes || null,
    });
  };

  if (!vehicleId) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Vincular Motorista ao Veículo
          </DialogTitle>
        </DialogHeader>

        {/* Informações Básicas da OS */}
        {ordemServico && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    OS #{ordemServico.numeroOs}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    {ordemServico.nomeFalecido}
                  </p>
                </div>
                {veiculo && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                    {veiculo.nome}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Motorista */}
          <div className="space-y-2">
            <Label htmlFor="motorista" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Motorista *
            </Label>
            {loadingMotoristas ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-slate-600 dark:text-slate-400">Carregando motoristas...</span>
              </div>
            ) : errorMotoristas ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-red-600 dark:text-red-400">Erro: {errorMotoristas.message}</span>
              </div>
            ) : motoristas.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-slate-600 dark:text-slate-400">Nenhum motorista encontrado</span>
              </div>
            ) : (
              <Select value={motoristaId} onValueChange={setMotoristaId}>
                <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                  <SelectValue placeholder="Selecione um motorista" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-60">
                  {motoristas.map((motorista: Motorista) => (
                    <SelectItem key={motorista.id} value={motorista.id.toString()} className="text-slate-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">{motorista.nome} {motorista.sobrenome}</span>
                        {motorista.telefone && (
                          <span className="text-sm text-slate-600 dark:text-slate-400">{motorista.telefone}</span>
                        )}
                        {motorista.cnh && (
                          <span className="text-xs text-slate-500 dark:text-slate-500">CNH: {motorista.cnh}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {motoristas.length === 0 && !loadingMotoristas && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Nenhum motorista ativo encontrado. Cadastre motoristas primeiro.
              </p>
            )}
          </div>

          {/* Informações do Serviço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data do Serviço */}
            <div className="space-y-2">
              <Label htmlFor="dataServico" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data do Serviço
              </Label>
              <Input
                id="dataServico"
                type="date"
                value={dataServico}
                onChange={(e) => setDataServico(e.target.value)}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
              />
            </div>

            {/* Hora do Serviço */}
            <div className="space-y-2">
              <Label htmlFor="horaServico" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora do Serviço
              </Label>
              <Input
                id="horaServico"
                type="time"
                value={horaServico}
                onChange={(e) => setHoraServico(e.target.value)}
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>

          {/* Locais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local de Origem */}
            <div className="space-y-2">
              <Label htmlFor="localOrigem" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                De: Local de Origem
              </Label>
              <Input
                id="localOrigem"
                value={localOrigem}
                onChange={(e) => setLocalOrigem(e.target.value)}
                placeholder="Ex: Hospital Santa Casa - São Paulo/SP"
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
              />
            </div>

            {/* Local de Destino */}
            <div className="space-y-2">
              <Label htmlFor="localDestino" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Para: Local de Destino
              </Label>
              <Input
                id="localDestino"
                value={localDestino}
                onChange={(e) => setLocalDestino(e.target.value)}
                placeholder="Ex: Cemitério da Paz - Vila Nova"
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>

          {/* Tipo de Veículo */}
          <div className="space-y-2">
            <Label htmlFor="tipoVeiculo" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Tipo de Veículo
            </Label>
            <Input
              id="tipoVeiculo"
              value={tipoVeiculo}
              onChange={(e) => setTipoVeiculo(e.target.value)}
              placeholder="Ex: Translado Intermunicipal"
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre o serviço (opcional)"
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white resize-none"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={vincularMutation.isPending || !motoristaId}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {vincularMutation.isPending ? "Vinculando..." : "Vincular Motorista"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}