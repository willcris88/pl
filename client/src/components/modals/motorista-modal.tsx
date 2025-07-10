import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, User } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFormNavigation } from "@/hooks/use-form-navigation";
import type { Motorista } from "@shared/schema";

interface MotoristaModalProps {
  ordemServicoId: string;
  motorista?: Motorista;
  isEditing?: boolean;
  children?: React.ReactNode;
}

export function MotoristaModal({ ordemServicoId, motorista, isEditing = false, children }: MotoristaModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState(motorista?.nome || "");
  const [telefone, setTelefone] = useState(motorista?.telefone || "");
  const [veiculo, setVeiculo] = useState(motorista?.veiculo || "");
  const [observacoes, setObservacoes] = useState(motorista?.observacoes || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formRef } = useFormNavigation();

  // Buscar motoristas cadastrados no sistema
  const { data: motoristasDisponiveis } = useQuery({
    queryKey: ["motoristas"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/motoristas");
      return response.data;
    },
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/ordens-servico/${ordemServicoId}/motoristas`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens-servico", ordemServicoId, "motoristas"] });
      toast({
        title: "Sucesso",
        description: "Motorista vinculado com sucesso!",
        variant: "default",
      });
      resetForm();
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao vincular motorista. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/ordens-servico/${ordemServicoId}/motoristas/${motorista?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens-servico", ordemServicoId, "motoristas"] });
      toast({
        title: "Sucesso",
        description: "Motorista atualizado com sucesso!",
        variant: "default",
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar motorista. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNome("");
    setTelefone("");
    setVeiculo("");
    setObservacoes("");
  };

  const handleMotoristaSelect = (motoristaId: string) => {
    const motoristaSelecionado = motoristasDisponiveis?.find((m: any) => m.id.toString() === motoristaId);
    if (motoristaSelecionado) {
      setNome(motoristaSelecionado.nome);
      setTelefone(motoristaSelecionado.telefone || "");
      setVeiculo(motoristaSelecionado.veiculo || "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o nome do motorista.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      nome: nome.trim(),
      telefone: telefone.trim(),
      veiculo: veiculo.trim(),
      observacoes: observacoes.trim(),
    };

    if (isEditing && motorista) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && !isEditing) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            type="button"
            className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Plus className="h-4 w-4" />
            Novo Motorista
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? "Editar Motorista" : "Vincular Motorista"}
          </DialogTitle>
        </DialogHeader>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de motorista cadastrado */}
          {!isEditing && motoristasDisponiveis && motoristasDisponiveis.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white">
                Selecionar Motorista Cadastrado
              </Label>
              <Select onValueChange={handleMotoristaSelect}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Escolha um motorista cadastrado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {motoristasDisponiveis.map((m: any) => (
                    <SelectItem 
                      key={m.id} 
                      value={m.id.toString()}
                      className="text-white hover:bg-slate-700"
                    >
                      {m.nome} - {m.telefone || "Sem telefone"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="border-t border-slate-700 pt-4">
            <Label className="text-slate-400 text-sm">
              Ou preencha manualmente:
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-white">
                Nome do Motorista <span className="text-red-400">*</span>
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-white">
                Telefone
              </Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="veiculo" className="text-white">
              Veículo
            </Label>
            <Input
              id="veiculo"
              value={veiculo}
              onChange={(e) => setVeiculo(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
              placeholder="Marca, modelo, placa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-white">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                isEditing ? "Atualizar" : "Vincular"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}