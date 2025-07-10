import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AddServiceModalProps {
  open: boolean;
  onClose: () => void;
  ordemServicoId: number;
}

export function AddServiceModal({ open, onClose, ordemServicoId }: AddServiceModalProps) {
  const [selectedPrestadora, setSelectedPrestadora] = useState("");
  const [selectedPrestadoraName, setSelectedPrestadoraName] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar prestadoras
  const { data: prestadoras = [], isLoading: loadingPrestadoras } = useQuery({
    queryKey: ['/api/prestadoras'],
    queryFn: async () => {
      console.log("Frontend: Buscando prestadoras...");
      const response = await fetch('/api/prestadoras', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.error("Frontend: Erro na resposta prestadoras:", response.status);
        throw new Error('Erro ao buscar prestadoras');
      }
      const result = await response.json();
      console.log("Frontend: Prestadoras recebidas:", result);
      return result || [];
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/produtos-os", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordemServicoId: data.ordemServicoId,
          tipo: data.tipo,
          nome: data.nome,
          categoria: data.categoria,
          quantidade: data.quantidade,
          valor: data.valor,
        }),
      });
      if (!response.ok) throw new Error("Erro ao criar serviço");
      return response.json();
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas para atualização dinâmica completa
      queryClient.invalidateQueries({ queryKey: ['/produtos-os'] });
      queryClient.invalidateQueries({ queryKey: ['/produtos-os', ordemServicoId] });
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico', ordemServicoId] });
      toast({
        title: "Sucesso",
        description: "Serviço adicionado com sucesso!",
      });
      resetForm();
      onClose();
    },
    onError: (error) => {
      console.error("Erro ao adicionar serviço:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar serviço. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedPrestadora("");
    setSelectedPrestadoraName("");
    setQuantidade("");
    setValor("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPrestadora) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um prestador de serviço.",
        variant: "destructive",
      });
      return;
    }

    const quantidadeNum = quantidade ? parseInt(quantidade) : 1;
    const valorNumerico = valor ? parseFloat(valor.replace(",", ".")) : 0;
    const valorTotalFinal = valorNumerico * quantidadeNum;
    
    createMutation.mutate({
      ordemServicoId,
      tipo: "servico",
      nome: selectedPrestadoraName,
      categoria: "servico",
      quantidade: quantidadeNum,
      valor: valorTotalFinal.toString(), // Enviar valor como string
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <User className="h-5 w-5 text-orange-600" />
            Adicionar Serviço
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="prestadora" className="text-slate-700 dark:text-slate-300">
              Prestador de Serviço *
            </Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                >
                  {selectedPrestadoraName || "Selecione um prestador..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <Command>
                  <CommandInput placeholder="Pesquisar prestador..." className="h-9" />
                  <CommandEmpty>Nenhum prestador encontrado.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {prestadoras.map((prestadora: any) => (
                      <CommandItem
                        key={prestadora.id}
                        value={`${prestadora.nome} ${prestadora.servicos || ''}`}
                        onSelect={() => {
                          setSelectedPrestadora(prestadora.id.toString());
                          setSelectedPrestadoraName(prestadora.nome);
                          setOpenCombobox(false);
                        }}
                        className="text-slate-900 dark:text-white"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedPrestadora === prestadora.id.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div>
                          <div className="font-medium">{prestadora.nome}</div>
                          {prestadora.servicos && (
                            <div className="text-sm text-gray-500">{prestadora.servicos}</div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantidade" className="text-slate-700 dark:text-slate-300">
                Quantidade
              </Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="1"
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
              />
            </div>

            <div>
              <Label htmlFor="valor" className="text-slate-700 dark:text-slate-300">
                Valor (R$)
              </Label>
              <Input
                id="valor"
                type="text"
                value={valor}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  value = (parseInt(value) / 100).toFixed(2);
                  if (value === "0.00") value = "";
                  setValor(value.replace(".", ","));
                }}
                placeholder="0,00 (opcional)"
                className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
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
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}