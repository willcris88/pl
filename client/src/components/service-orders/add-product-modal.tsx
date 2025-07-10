import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Package } from "lucide-react";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  ordemServicoId: number;
}

export function AddProductModal({ open, onClose, ordemServicoId }: AddProductModalProps) {
  const [selectedProduto, setSelectedProduto] = useState<string>("");
  const [selectedFornecedor, setSelectedFornecedor] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("1");
  const [valorUnitario, setValorUnitario] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const queryClient = useQueryClient();

  // Query para produtos
  const { data: produtos = [] } = useQuery({
    queryKey: ['/produtos'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/produtos");
      return response.data;
    },
    enabled: open,
  });

  // Query para fornecedores do produto selecionado
  const { data: fornecedores = [] } = useQuery({
    queryKey: ['/produtos', selectedProduto, 'fornecedores'],
    queryFn: async () => {
      const response = await apiRequest("GET", `/produtos/${selectedProduto}/fornecedores`);
      return response.data;
    },
    enabled: !!selectedProduto,
  });

  // Limpar formulário quando abrir
  useEffect(() => {
    if (open) {
      setSelectedProduto("");
      setSelectedFornecedor("");
      setQuantidade("1");
      setValorUnitario("");
    }
  }, [open]);

  // Atualizar valor quando produto for selecionado
  useEffect(() => {
    if (selectedProduto) {
      const produto = produtos.find((p: any) => p.id.toString() === selectedProduto);
      if (produto && produto.preco) {
        setValorUnitario(`R$ ${produto.preco.toFixed(2).replace('.', ',')}`);
      }
    }
  }, [selectedProduto, produtos]);

  // Atualizar valor quando fornecedor for selecionado
  useEffect(() => {
    if (selectedFornecedor && fornecedores.length > 0) {
      const fornecedor = fornecedores.find((f: any) => f.fornecedorId.toString() === selectedFornecedor);
      if (fornecedor && fornecedor.preco) {
        const preco = Number(fornecedor.preco) || 0;
        setValorUnitario(`R$ ${preco.toFixed(2).replace('.', ',')}`);
      }
    }
  }, [selectedFornecedor, fornecedores]);

  const handleSubmit = async () => {
    if (!selectedProduto || !selectedFornecedor || !quantidade || !valorUnitario) {
      return;
    }

    setLoading(true);
    try {
      const produto = produtos.find((p: any) => p.id.toString() === selectedProduto);
      const valorNumerico = parseFloat(valorUnitario.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
      const valorTotal = (parseFloat(quantidade) * valorNumerico).toFixed(2);

      const response = await apiRequest('POST', '/produtos-os', {
        ordemServicoId,
        tipo: 'produto',
        produtoId: parseInt(selectedProduto),
        fornecedorId: parseInt(selectedFornecedor),
        nome: produto?.nome || '',
        categoria: produto?.categoria || 'produto',
        quantidade: parseFloat(quantidade),
        valor: valorTotal, // Enviar valor total como string formatada
      });

      // Invalidar todas as queries relacionadas para atualização dinâmica completa
      queryClient.invalidateQueries({ queryKey: ['/produtos-os'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico'] });
      queryClient.refetchQueries({ queryKey: ['/produtos-os', ordemServicoId] });
      queryClient.refetchQueries({ queryKey: ['/api/ordens-servico', ordemServicoId] });
      alert('Produto adicionado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const valorTotal = quantidade && valorUnitario
    ? (parseFloat(quantidade) * parseFloat(valorUnitario.replace(/[^0-9,]/g, '').replace(',', '.'))).toFixed(2).replace('.', ',')
    : "0,00";

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Adicionar Produto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Select Produto */}
          <div className="space-y-2">
            <Label htmlFor="produto">Produto</Label>
            <Select value={selectedProduto} onValueChange={setSelectedProduto}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {produtos.map((produto: any) => (
                  <SelectItem key={produto.id} value={produto.id.toString()}>
                    {produto.nome} - {produto.categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select Fornecedor */}
          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Select 
              value={selectedFornecedor} 
              onValueChange={setSelectedFornecedor}
              disabled={!selectedProduto}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedProduto ? "Selecione um fornecedor" : "Primeiro selecione um produto"} />
              </SelectTrigger>
              <SelectContent>
                {fornecedores.map((fornecedor: any) => (
                  <SelectItem key={fornecedor.fornecedorId} value={fornecedor.fornecedorId.toString()}>
                    {fornecedor.fornecedorNome} - R$ {Number(fornecedor.preco || 0).toFixed(2).replace('.', ',')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inputs de Quantidade e Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.01"
                min="0"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor Unitário</Label>
              <Input
                id="valor"
                type="text"
                value={valorUnitario}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9,]/g, '');
                  if (value.includes(',')) {
                    const parts = value.split(',');
                    if (parts.length > 2) {
                      value = parts[0] + ',' + parts[1].substring(0, 2);
                    }
                  }
                  setValorUnitario(value ? `R$ ${value}` : '');
                }}
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          {/* Valor Total */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Valor Total:</span>
              <span className="text-xl font-bold text-green-600">R$ {valorTotal}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={!selectedProduto || !selectedFornecedor || !quantidade || !valorUnitario || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Adicionando..." : "Adicionar Produto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}