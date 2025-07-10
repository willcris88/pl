import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Produto, InserirProduto, Fornecedor } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MaximizedLayout } from "@/components/layout/maximized-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Filter,
  Building2,
  X,
} from "lucide-react";

// Tipo para produto com fornecedores
type ProdutoComFornecedores = Produto & {
  fornecedores: Array<{
    id: number;
    fornecedorId: number;
    fornecedorNome: string;
    preco: number;
    codigoFornecedor?: string;
    tempoEntrega?: number;
    observacoes?: string;
  }>;
};

export default function ProductsPageNew() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProdutoComFornecedores | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedSuppliers, setSelectedSuppliers] = useState<Array<{
    fornecedorId: number;
    preco: number;
    codigoFornecedor?: string;
    tempoEntrega?: number;
    observacoes?: string;
  }>>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para produtos
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/produtos"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/produtos");
      return response.data;
    },
    retry: false,
  });

  // Query para fornecedores
  const { data: suppliers } = useQuery({
    queryKey: ["/fornecedores"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/fornecedores");
      return response.data;
    },
    retry: false,
  });

  // Mutation para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (data: InserirProduto) => {
      const response = await apiRequest("POST", "/produtos", data);
      const product = response.data;
      
      // Adicionar fornecedores se houver
      for (const supplier of selectedSuppliers) {
        await apiRequest("POST", `/produtos/${product.id}/fornecedores`, supplier);
      }
      
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/produtos"] });
      resetForm();
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar produto
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InserirProduto>) => {
      const product = await apiRequest("PATCH", `/produtos/${id}`, data);
      
      // Substituir todos os fornecedores de uma vez usando a nova rota PUT
      if (selectedSuppliers.length > 0) {
        await apiRequest("PUT", `/produtos/${id}/fornecedores`, selectedSuppliers);
      } else {
        // Se não há fornecedores selecionados, limpar todos
        await apiRequest("PUT", `/produtos/${id}/fornecedores`, []);
      }
      
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/produtos"] });
      resetForm();
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar produto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/produtos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/produtos"] });
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Extrair e processar o preço em formato brasileiro
    const precoStr = formData.get("preco") as string;
    const preco = precoStr ? parseFloat(precoStr.replace(/[^0-9,]/g, '').replace(',', '.')) || 0 : 0;
    
    const data: InserirProduto = {
      nome: formData.get("nome") as string,
      descricao: formData.get("descricao") as string || undefined,
      categoria: formData.get("categoria") as string || "geral",
      preco: preco,
      codigoInterno: formData.get("codigoInterno") as string || undefined,
      estoqueAtual: formData.get("estoqueAtual") ? parseInt(formData.get("estoqueAtual") as string) : 0,
      unidadeMedida: formData.get("unidadeMedida") as string || undefined,
      estoqueMinimo: formData.get("estoqueMinimo") ? parseInt(formData.get("estoqueMinimo") as string) : 0,
      observacoes: formData.get("observacoes") as string || undefined,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEdit = (product: ProdutoComFornecedores) => {
    setEditingProduct(product);
    // Carregar fornecedores existentes do produto
    const existingSuppliers = product.fornecedores.map(f => ({
      fornecedorId: f.fornecedorId,
      preco: f.preco,
      codigoFornecedor: f.codigoFornecedor || "",
      tempoEntrega: f.tempoEntrega,
      observacoes: f.observacoes || ""
    }));
    setSelectedSuppliers(existingSuppliers);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setSelectedSuppliers([]);
    setShowModal(false);
  };

  const filteredProducts = (products as ProdutoComFornecedores[])?.filter((product: ProdutoComFornecedores) => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.codigoInterno?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.categoria === filterCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <MaximizedLayout title="Produtos">
      <div className="p-6">
          <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Produtos</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie o catálogo de produtos</p>
          </div>
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingProduct(null); setSelectedSuppliers([]); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Layout compacto de duas colunas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="nome" className="text-sm font-medium">Nome do Produto *</Label>
                    <Input
                      id="nome"
                      name="nome"
                      defaultValue={editingProduct?.nome || ""}
                      placeholder="Ex: Coroa de Flores"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="categoria" className="text-sm font-medium">Categoria</Label>
                      <Select name="categoria" defaultValue={editingProduct?.categoria || "geral"}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geral">Geral</SelectItem>
                          <SelectItem value="flores">Flores</SelectItem>
                          <SelectItem value="caixoes">Caixões</SelectItem>
                          <SelectItem value="urnas">Urnas</SelectItem>
                          <SelectItem value="velas">Velas</SelectItem>
                          <SelectItem value="decoracao">Decoração</SelectItem>
                          <SelectItem value="servicos">Serviços</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="unidadeMedida" className="text-sm font-medium">Unidade</Label>
                      <Select name="unidadeMedida" defaultValue={editingProduct?.unidadeMedida || "peca"}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="peca">Peça</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="m">Metro</SelectItem>
                          <SelectItem value="m2">M²</SelectItem>
                          <SelectItem value="litro">Litro</SelectItem>
                          <SelectItem value="hora">Hora</SelectItem>
                          <SelectItem value="servico">Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="estoqueAtual" className="text-sm font-medium">Estoque</Label>
                      <Input
                        id="estoqueAtual"
                        name="estoqueAtual"
                        type="number"
                        min="0"
                        defaultValue={editingProduct?.estoqueAtual || 0}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estoqueMinimo" className="text-sm font-medium">Mínimo</Label>
                      <Input
                        id="estoqueMinimo"
                        name="estoqueMinimo"
                        type="number"
                        min="0"
                        defaultValue={editingProduct?.estoqueMinimo || 0}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="codigoInterno" className="text-sm font-medium">Código Interno</Label>
                    <Input
                      id="codigoInterno"
                      name="codigoInterno"
                      defaultValue={editingProduct?.codigoInterno || ""}
                      placeholder="Ex: CF001"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preco" className="text-sm font-medium">Preço Base</Label>
                    <Input
                      id="preco"
                      name="preco"
                      type="text"
                      placeholder="R$ 0,00"
                      defaultValue={editingProduct?.preco ? `R$ ${editingProduct.preco.toFixed(2).replace('.', ',')}` : ""}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9,]/g, '');
                        if (value.includes(',')) {
                          const parts = value.split(',');
                          if (parts.length > 2) {
                            value = parts[0] + ',' + parts[1].substring(0, 2);
                          }
                        }
                        e.target.value = value ? `R$ ${value}` : '';
                      }}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao" className="text-sm font-medium">Descrição</Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      defaultValue={editingProduct?.descricao || ""}
                      placeholder="Descrição do produto"
                      rows={2}
                      className="mt-1 resize-none"
                    />
                  </div>


                </div>
              </div>

              {/* Fornecedores */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <Label className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Fornecedores</Label>
                </div>
                
                <div className="space-y-3">
                  {/* Fornecedores selecionados */}
                  {selectedSuppliers.map((supplier, index) => (
                    <div key={index} className="p-3 border border-blue-200 dark:border-gray-700 rounded-lg bg-blue-50 dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {(suppliers as any[])?.find((s: any) => s.id === supplier.fornecedorId)?.nome || `Fornecedor ${supplier.fornecedorId}`}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSuppliers(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-gray-700 dark:text-gray-300">Preço</Label>
                          <Input
                            type="text"
                            placeholder="R$ 0,00"
                            value={supplier.preco ? `R$ ${supplier.preco.toFixed(2).replace('.', ',')}` : ''}
                            onChange={(e) => {
                              let value = e.target.value.replace(/[^0-9,]/g, '');
                              if (value.includes(',')) {
                                const parts = value.split(',');
                                if (parts.length > 2) {
                                  value = parts[0] + ',' + parts[1].substring(0, 2);
                                }
                              }
                              const numericValue = parseFloat(value.replace(',', '.')) || 0;
                              const newSuppliers = [...selectedSuppliers];
                              newSuppliers[index].preco = numericValue;
                              setSelectedSuppliers(newSuppliers);
                              e.target.value = value ? `R$ ${value}` : '';
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-700 dark:text-gray-300">Código</Label>
                          <Input
                            value={supplier.codigoFornecedor || ""}
                            onChange={(e) => {
                              const newSuppliers = [...selectedSuppliers];
                              newSuppliers[index].codigoFornecedor = e.target.value;
                              setSelectedSuppliers(newSuppliers);
                            }}
                            placeholder="Opcional"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Botão para adicionar fornecedor */}
                  <Select
                    onValueChange={(value) => {
                      const fornecedorId = parseInt(value);
                      if (!selectedSuppliers.find(s => s.fornecedorId === fornecedorId)) {
                        setSelectedSuppliers(prev => [...prev, {
                          fornecedorId,
                          preco: 0,
                          codigoFornecedor: "",
                          tempoEntrega: undefined,
                          observacoes: ""
                        }]);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Adicionar fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {(suppliers as any[])?.filter((supplier: any) => 
                        !selectedSuppliers.find(s => s.fornecedorId === supplier.id)
                      ).map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createProductMutation.isPending || updateProductMutation.isPending ? "Salvando..." : editingProduct ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="geral">Geral</SelectItem>
              <SelectItem value="flores">Flores</SelectItem>
              <SelectItem value="caixoes">Caixões</SelectItem>
              <SelectItem value="urnas">Urnas</SelectItem>
              <SelectItem value="velas">Velas</SelectItem>
              <SelectItem value="decoracao">Decoração</SelectItem>
              <SelectItem value="servicos">Serviços</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de produtos */}
      {productsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando produtos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Nenhum produto encontrado</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {searchTerm || filterCategory !== "all" 
              ? "Tente ajustar os filtros de busca"
              : "Comece criando seu primeiro produto"
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.nome}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {product.categoria}
                    </span>
                  </div>
                  {product.descricao && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{product.descricao}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {product.codigoInterno && (
                      <span>Código: {product.codigoInterno}</span>
                    )}
                    <span>Estoque: {product.estoqueAtual || 0}</span>
                    <span>Fornecedores: {product.fornecedores.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
          </div>
      </div>
    </MaximizedLayout>
  );
}