import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, User, DollarSign } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ServicoMotorista } from "../../../../shared/schema";

interface AddVehicleModalProps {
  open: boolean;
  onClose: () => void;
  ordemServicoId: number;
}

export function AddVehicleModal({ open, onClose, ordemServicoId }: AddVehicleModalProps) {
  const [servicoMotoristaId, setServicoMotoristaId] = useState<string>("");
  const [servicoSelecionado, setServicoSelecionado] = useState<ServicoMotorista | null>(null);
  const [valor, setValor] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar serviços de motorista
  const { data: servicosMotorista = [], isLoading: loadingServicos } = useQuery({
    queryKey: ['/api/servicos-motorista'],
    queryFn: async () => {
      console.log("Frontend: Buscando serviços de motorista...");
      const response = await fetch('/api/servicos-motorista', {
        credentials: 'include'
      });
      console.log("Frontend: Response status:", response.status);
      if (!response.ok) {
        console.error("Frontend: Erro na resposta:", response.status, response.statusText);
        throw new Error('Erro ao buscar serviços de motorista');
      }
      const result = await response.json();
      console.log("Frontend: Serviços recebidos:", result);
      return result || [];
    },
    enabled: open,
  });

  // Função para quando selecionar um serviço
  const handleServicoChange = (servicoId: string) => {
    setServicoMotoristaId(servicoId);
    const servico = servicosMotorista.find((s: ServicoMotorista) => s.id === parseInt(servicoId));
    if (servico) {
      setServicoSelecionado(servico);
      setValor(servico.valorPadrao ? servico.valorPadrao.toString() : "");
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/produtos-os', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao adicionar serviço de veículo');
      return response.json();
    },
    onSuccess: () => {
      // Invalidar as queries corretas (sem /api/) para coincidir com products-section
      queryClient.invalidateQueries({ queryKey: ['/produtos-os'] });
      queryClient.invalidateQueries({ queryKey: ['/produtos-os', ordemServicoId] });
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico', ordemServicoId] });
      toast({
        title: "Sucesso",
        description: "Serviço de veículo adicionado com sucesso!",
      });
      resetForm();
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao adicionar serviço:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar serviço de veículo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setServicoMotoristaId("");
    setServicoSelecionado(null);
    setValor("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!servicoMotoristaId || !servicoSelecionado) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um serviço de motorista.",
        variant: "destructive",
      });
      return;
    }

    const valorNumerico = valor ? parseFloat(valor) : (servicoSelecionado?.valorPadrao ? parseFloat(servicoSelecionado.valorPadrao) : 0);

    const dados = {
      ordemServicoId,
      tipo: 'veiculo',
      nome: servicoSelecionado.nome,
      categoria: 'Veículo/Motorista',
      quantidade: 1,
      valor: valorNumerico.toString(), // Enviar valor como string
    };
    
    createMutation.mutate(dados);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Car className="h-5 w-5 text-purple-600" />
            Adicionar Veículo / Transporte
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Serviço de Motorista */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Serviço de Motorista *
            </Label>
            <Select value={servicoMotoristaId} onValueChange={handleServicoChange} disabled={loadingServicos}>
              <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                <SelectValue placeholder={loadingServicos ? "Carregando serviços..." : "Selecione um serviço de motorista"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                {servicosMotorista && servicosMotorista.length > 0 ? (
                  servicosMotorista.map((servico: ServicoMotorista) => (
                    <SelectItem 
                      key={servico.id} 
                      value={servico.id.toString()}
                      className="text-slate-900 dark:text-white"
                    >
                      {servico.nome} - R$ {parseFloat(servico.valorPadrao || '0').toFixed(2)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    {loadingServicos ? "Carregando..." : "Nenhum serviço encontrado"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {servicoSelecionado && servicoSelecionado.descricao && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {servicoSelecionado.descricao}
              </p>
            )}
          </div>

          {/* Valor (Opcional) */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor do Serviço (R$) - Opcional
            </Label>
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              min="0"
              step="0.01"
              placeholder={servicoSelecionado?.valorPadrao ? `Padrão: R$ ${parseFloat(servicoSelecionado.valorPadrao).toFixed(2)}` : "0,00"}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Se deixar em branco, será usado o valor padrão do serviço
            </p>
          </div>



          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-lg"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Associando..." : "Associar Veículo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}