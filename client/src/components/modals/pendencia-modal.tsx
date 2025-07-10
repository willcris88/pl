import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFormNavigation } from "@/hooks/use-form-navigation";
import type { Pendencia } from "@shared/schema";

interface PendenciaModalProps {
  ordemServicoId: string;
  pendencia?: Pendencia;
  isEditing?: boolean;
  children?: React.ReactNode;
}

const TIPOS_PENDENCIA = [
  "FALTA DOCUMENTACAO",
  "LIBEROU",
  "LIBEROU P/ AESPE",
  "CONTRATOU",
  "CONTRATOU C/ FUNDO",
  "LEVOU",
  "ORNAMENTOU",
  "PAG. DE TAXAS",
  "COMPLETO / IML",
  "COMPLETO / SVO",
  "ACOMPANHOU",
  "RECOLHA",
  "PMB",
  "FECHADO",
  "ACOMPANHAMENTO",
  "COMPLETO"
];

const STATUS_OPCOES = [
  "PENDENTE",
  "EM ANDAMENTO",
  "CONCLUIDO",
  "CANCELADO"
];

export function PendenciaModal({ ordemServicoId, pendencia, isEditing = false, children }: PendenciaModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tipo, setTipo] = useState(pendencia?.tipo || "");
  const [status, setStatus] = useState(pendencia?.status || "PENDENTE");
  const [descricao, setDescricao] = useState(pendencia?.descricao || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formRef } = useFormNavigation();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/ordens-servico/${ordemServicoId}/pendencias`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar cache de pendências e forçar atualização imediata
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico', parseInt(ordemServicoId), 'pendencias'] });
      queryClient.refetchQueries({ queryKey: ['/api/ordens-servico', parseInt(ordemServicoId), 'pendencias'] });
      queryClient.refetchQueries({ queryKey: ['/api/ordens-servico', parseInt(ordemServicoId)] });
      toast({
        title: "Sucesso",
        description: "Pendência criada com sucesso!",
        variant: "default",
      });
      resetForm();
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar pendência. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/ordens-servico/${ordemServicoId}/pendencias/${pendencia?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar cache de pendências e forçar atualização imediata
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico', parseInt(ordemServicoId), 'pendencias'] });
      queryClient.refetchQueries({ queryKey: ['/api/ordens-servico', parseInt(ordemServicoId), 'pendencias'] });
      queryClient.refetchQueries({ queryKey: ['/api/ordens-servico', parseInt(ordemServicoId)] });
      toast({
        title: "Sucesso",
        description: "Pendência atualizada com sucesso!",
        variant: "default",
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar pendência. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTipo("");
    setStatus("PENDENTE");
    setDescricao("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipo) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um tipo de pendência.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      tipo,
      status,
      descricao: descricao || tipo, // Usa o tipo como descrição padrão se não foi fornecida
    };

    if (isEditing && pendencia) {
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
            className="gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <Plus className="h-4 w-4" />
            Nova Pendência
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? "Editar Pendência" : "Adicionar Pendência"}
          </DialogTitle>
        </DialogHeader>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-white">
                Desc. Tipo <span className="text-red-400">*</span>
              </Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {TIPOS_PENDENCIA.map((tipoPendencia) => (
                    <SelectItem 
                      key={tipoPendencia} 
                      value={tipoPendencia}
                      className="text-white hover:bg-slate-700"
                    >
                      {tipoPendencia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">
                Status <span className="text-red-400">*</span>
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Escolha status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {STATUS_OPCOES.map((statusOpcao) => (
                    <SelectItem 
                      key={statusOpcao} 
                      value={statusOpcao}
                      className="text-white hover:bg-slate-700"
                    >
                      {statusOpcao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-white">
              Motorista/Produtos/Documentação
            </Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
              placeholder="Descreva detalhes adicionais..."
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
                isEditing ? "Atualizar" : "Adicionar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}