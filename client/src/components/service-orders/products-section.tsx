import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Plus, Car, User, Search, Trash2, FileText } from "lucide-react";
import { AddProductModal } from "./add-product-modal";
import { AddVehicleModal } from "./add-vehicle-modal";
import { AddServiceModal } from "./add-service-modal";
import { NotaContratualModal } from "./nota-contratual-modal";
import { VincularMotoristaModal } from "./vincular-motorista-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProductsSectionProps {
  ordemServicoId: number;
}

export function ProductsSection({ ordemServicoId }: ProductsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showNotaContratual, setShowNotaContratual] = useState(false);
  const [showVincularMotorista, setShowVincularMotorista] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para buscar produtos da OS com atualização automática
  const { data: produtosOs = [], isLoading } = useQuery({
    queryKey: ['/produtos-os', ordemServicoId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/produtos-os?ordemServicoId=${ordemServicoId}`);
      return response.data;
    },
    refetchInterval: 1000, // Atualizar a cada 1 segundo automaticamente
    refetchIntervalInBackground: true, // Continuar atualizando mesmo em background
    refetchOnWindowFocus: true, // Atualizar quando a janela ganhar foco
    staleTime: 0, // Considerar dados sempre desatualizados para forçar refetch
    cacheTime: 0, // Não fazer cache dos dados
  });

  // Query para buscar dados completos da ordem de serviço
  const { data: ordemServico } = useQuery({
    queryKey: ['/api/ordens-servico', ordemServicoId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/ordens-servico/${ordemServicoId}`);
      return response.data;
    },
    enabled: !!ordemServicoId,
  });

  // Query para buscar motoristas vinculados
  const { data: motoristasVinculados = [] } = useQuery({
    queryKey: ['/api/motoristas-ordem-servico', ordemServicoId],
    queryFn: async () => {
      const response = await fetch(`/api/motoristas-ordem-servico?ordemServicoId=${ordemServicoId}`, {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!ordemServicoId,
  });

  // Mutation para excluir produto da OS
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/produtos-os/${id}`);
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas para atualização dinâmica completa
      queryClient.invalidateQueries({ queryKey: ['/produtos-os'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico'] });
      queryClient.refetchQueries({ queryKey: ['/produtos-os', ordemServicoId] });
      queryClient.refetchQueries({ queryKey: ['/api/ordens-servico', ordemServicoId] });
      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao remover produto",
        variant: "destructive",
      });
    },
  });

  const filteredItems = produtosOs.filter((item: any) => {
    // Garantir que os campos existem antes de filtrar
    const nome = item.produtoNome || item.produtoId?.toString() || '';
    const categoria = item.produtoCategoria || '';
    return nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
           categoria.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'produto': return <Package className="h-4 w-4" />;
      case 'veiculo': return <Car className="h-4 w-4" />;
      case 'servico': return <User className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'produto': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'veiculo': return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case 'servico': return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length && filteredItems.length > 0) {
      // Desmarcar todos
      setSelectedItems(new Set());
    } else {
      // Marcar todos
      const allIds = new Set(filteredItems.map((item: any) => item.id));
      setSelectedItems(allIds);
    }
  };

  const handleItemSelect = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Função para verificar se o produto pode ser excluído (não tem motorista vinculado)
  const canDeleteProduct = (productId: number) => {
    return !motoristasVinculados.some((motorista: any) => motorista.veiculoProdutoId === productId);
  };

  // Função para verificar se um veículo já tem motorista vinculado
  const vehicleHasDriver = (vehicleId: number) => {
    return motoristasVinculados.some((motorista: any) => motorista.veiculoProdutoId === vehicleId);
  };

  return (
    <>
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Produtos e Serviços
          </CardTitle>
          <p className="text-blue-100 text-sm">Adicione itens - motorista - serviços</p>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Botão Gerar Nota Contratual */}
          <div className="mb-6">
            <Button 
              type="button"
              onClick={() => {
                // Verificar se há produtos indisponíveis
                const produtosIndisponiveis = produtosOs.filter(p => p.disponivel === false || p.numeroNc);
                if (produtosIndisponiveis.length > 0) {
                  toast({
                    title: "Produtos Indisponíveis",
                    description: `Alguns produtos já possuem nota contratual: ${produtosIndisponiveis.map(p => p.numeroNc).filter(Boolean).join(', ')}`,
                    variant: "destructive",
                  });
                  return;
                }
                if (produtosOs.length === 0) {
                  toast({
                    title: "Nenhum Produto",
                    description: "Adicione produtos antes de gerar a nota contratual",
                    variant: "destructive",
                  });
                  return;
                }
                setShowNotaContratual(true);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
              size="lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              Gerar Nota Contratual
            </Button>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Adicionar produtos
            </Button>
            
            <Button
              onClick={() => setShowAddVehicle(true)}
              className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              variant="outline"
            >
              <Car className="h-4 w-4" />
              Adicionar Veículos
            </Button>
            
            <Button
              onClick={() => setShowAddService(true)}
              className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30"
              variant="outline"
            >
              <User className="h-4 w-4" />
              Adicionar Serviços
            </Button>
          </div>

          {/* Campo de Pesquisa */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Cabeçalho da Tabela */}
          <div className="grid grid-cols-9 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-semibold text-sm text-gray-600 dark:text-gray-300 mb-4">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="rounded"
                checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                onChange={handleSelectAll}
              />
              ID
            </div>
            <div>ITEM</div>
            <div>CATEGORIA</div>
            <div>Qty</div>
            <div>Valor Unit.</div>
            <div>Valor Total</div>
            <div>Status/NC</div>
            <div>Fornecedor</div>
            <div>Ações</div>
          </div>

          {/* Lista de Itens */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum registro encontrado</p>
              </div>
            ) : (
              filteredItems.map((item: any, index: number) => (
                <div key={`produto-${item.id}-${index}`} className={`grid grid-cols-9 gap-4 p-3 rounded-lg border hover:shadow-md transition-shadow ${item.disponivel === false ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleItemSelect(item.id)}
                    />
                    <span className="text-sm font-mono">{item.id}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getTipoIcon(item.tipo || 'produto')}
                    <span className="font-medium">
                      {item.nome || item.produtoNome || `Item #${item.produtoId || item.id}`}
                    </span>
                  </div>
                  
                  <div>
                    <Badge className={getTipoBadgeColor(item.tipo || 'produto')}>
                      {item.tipo || 'produto'}
                    </Badge>
                  </div>
                  
                  <div className="font-mono">
                    {item.quantidade}
                  </div>
                  
                  <div className="font-mono text-blue-600">
                    R$ {(parseFloat(item.valor || '0') / (item.quantidade || 1)).toFixed(2).replace('.', ',')}
                  </div>
                  
                  <div className="font-mono text-green-600">
                    R$ {parseFloat(item.valor || '0').toFixed(2).replace('.', ',')}
                  </div>
                  
                  <div className="text-sm">
                    {item.disponivel === false && item.numeroNc ? (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        NC: {item.numeroNc.replace('NC', '')}
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Disponível
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    -
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Botão Vincular Motorista - só para veículos */}
                    {(item.categoria === 'transporte' || item.tipo === 'veiculo') && (
                      <Button
                        onClick={() => {
                          setSelectedVehicleId(item.id);
                          setShowVincularMotorista(true);
                        }}
                        size="sm"
                        variant="ghost"
                        className={`${vehicleHasDriver(item.id) 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                        }`}
                        title={vehicleHasDriver(item.id) ? "Motorista já vinculado" : "Vincular Motorista"}
                        disabled={vehicleHasDriver(item.id)}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Só mostra botão de exclusão se não há motorista vinculado */}
                    {canDeleteProduct(item.id) && (
                      <Button
                        onClick={() => deleteMutation.mutate(item.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={item.disponivel === false}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Mostra ícone de alerta se produto não pode ser excluído por ter motorista vinculado */}
                    {!canDeleteProduct(item.id) && (
                      <div 
                        className="flex items-center text-yellow-500 px-2 py-1 rounded"
                        title="Não é possível excluir: produto tem motorista vinculado"
                      >
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <AddProductModal
        open={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        ordemServicoId={ordemServicoId}
      />
      
      <AddVehicleModal
        open={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        ordemServicoId={ordemServicoId}
      />

      <AddServiceModal
        open={showAddService}
        onClose={() => setShowAddService(false)}
        ordemServicoId={ordemServicoId}
      />

      {showNotaContratual && ordemServico && (
        <NotaContratualModal
          isOpen={showNotaContratual}
          onClose={() => setShowNotaContratual(false)}
          ordemServico={ordemServico}
          produtos={produtosOs}
        />
      )}

      <VincularMotoristaModal
        open={showVincularMotorista}
        onClose={() => {
          setShowVincularMotorista(false);
          setSelectedVehicleId(null);
        }}
        vehicleId={selectedVehicleId}
        ordemServicoId={ordemServicoId}
      />


    </>
  );
}