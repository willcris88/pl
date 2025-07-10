import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Produto, InserirProduto, Fornecedor } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  DollarSign,
  X,
  Package2,
  AlertCircle
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

export default function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProdutoComFornecedores | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [selectedSuppliers, setSelectedSuppliers] = useState<Array<{
    fornecedorId: number;
    preco: number;
    codigoFornecedor?: string;
    tempoEntrega?: number;
    observacoes?: string;
  }>>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar produtos
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/produtos"],
    retry: false,
  });

  // Buscar fornecedores
  const { data: suppliers } = useQuery({
    queryKey: ["/fornecedores"],
    retry: false,
  });

  // Mutation para criar produto
  const createProductMutation = useMutation({
    mutationFn: async (data: InserirProduto) => {
      const product = await apiRequest("/produtos", "POST", data);
      
      // Adicionar fornecedores se houver
      for (const supplier of selectedSuppliers) {
        await apiRequest(`/api/produtos/${product.id}/fornecedores`, "POST", supplier);
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
      return await apiRequest(`/api/produtos/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/produtos"] });
      setEditingProduct(null);
      setShowModal(false);
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

  // Mutation para excluir produto
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/produtos/${id}`, "DELETE");
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

  // Filtrar produtos
  const filteredProducts = (products as ProdutoComFornecedores[])?.filter((product: ProdutoComFornecedores) => {
    const matchesSearch = product.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.codigoInterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || product.categoria === filterCategory;
    const matchesSupplier = filterSupplier === "all" || 
      (product.fornecedores && product.fornecedores.some((f: any) => f.fornecedorId?.toString() === filterSupplier));
    
    return matchesSearch && matchesCategory && matchesSupplier;
  }) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: InserirProduto = {
      nome: formData.get("nome") as string,
      descricao: formData.get("descricao") as string || undefined,
      categoria: formData.get("categoria") as string || "geral",
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

  // Obter categorias únicas
  const categories = [...new Set(filteredProducts.map(p => p.categoria).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos e serviços
          </p>
        </div>
        <Dialog open={showModal} onOpenChange={(open) => !open && resetForm()}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader className="pb-3">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Informações Básicas */}
              <Card className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-600">
                  <CardTitle className="text-lg text-blue-700 dark:text-blue-300 font-semibold">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Produto *</Label>
                      <Input
                        id="nome"
                        name="nome"
                        defaultValue={editingProduct?.nome || ""}
                        placeholder="Ex: Coroa de Flores"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codigoInterno">Código Interno</Label>
                      <Input
                        id="codigoInterno"
                        name="codigoInterno"
                        defaultValue={editingProduct?.codigoInterno || ""}
                        placeholder="Ex: CF001"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      defaultValue={editingProduct?.descricao || ""}
                      placeholder="Descrição detalhada do produto"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select name="categoria" defaultValue={editingProduct?.categoria || "geral"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geral">Geral</SelectItem>
                          <SelectItem value="flores">Flores</SelectItem>
                          <SelectItem value="urnas">Urnas</SelectItem>
                          <SelectItem value="vestuario">Vestuário</SelectItem>
                          <SelectItem value="acessorios">Acessórios</SelectItem>
                          <SelectItem value="servicos">Serviços</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
                      <Select name="unidadeMedida" defaultValue={editingProduct?.unidadeMedida || "peca"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="peca">Peça</SelectItem>
                          <SelectItem value="kg">Quilograma</SelectItem>
                          <SelectItem value="m">Metro</SelectItem>
                          <SelectItem value="m2">Metro Quadrado</SelectItem>
                          <SelectItem value="litro">Litro</SelectItem>
                          <SelectItem value="hora">Hora</SelectItem>
                          <SelectItem value="servico">Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estoque */}
              <Card className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-600">
                  <CardTitle className="text-lg text-green-700 dark:text-green-300 font-semibold">Controle de Estoque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estoqueAtual">Estoque Atual</Label>
                      <Input
                        id="estoqueAtual"
                        name="estoqueAtual"
                        type="number"
                        min="0"
                        defaultValue={editingProduct?.estoqueAtual || 0}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                      <Input
                        id="estoqueMinimo"
                        name="estoqueMinimo"
                        type="number"
                        min="0"
                        defaultValue={editingProduct?.estoqueMinimo || 0}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fornecedores */}
              <Card className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                <CardHeader className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-gray-200 dark:border-gray-600">
                  <CardTitle className="text-lg text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Fornecedores
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Fornecedores selecionados */}
                    {selectedSuppliers.map((supplier, index) => (
                      <div key={index} className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">
                            {(suppliers as Fornecedor[])?.find(s => s.id === supplier.fornecedorId)?.nome || `Fornecedor ${supplier.fornecedorId}`}
                          </h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSuppliers(prev => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preço</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={supplier.preco}
                              onChange={(e) => {
                                const newSuppliers = [...selectedSuppliers];
                                newSuppliers[index].preco = parseFloat(e.target.value) || 0;
                                setSelectedSuppliers(newSuppliers);
                              }}
                              placeholder="0.00"
                              className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Código do Fornecedor</Label>
                            <Input
                              value={supplier.codigoFornecedor || ""}
                              onChange={(e) => {
                                const newSuppliers = [...selectedSuppliers];
                                newSuppliers[index].codigoFornecedor = e.target.value;
                                setSelectedSuppliers(newSuppliers);
                              }}
                              placeholder="Código opcional"
                              className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
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
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor para adicionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {(suppliers as Fornecedor[])?.filter(supplier => 
                          !selectedSuppliers.find(s => s.fornecedorId === supplier.id)
                        ).map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              <Card className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                <CardHeader className="bg-orange-50 dark:bg-orange-900/20 border-b border-gray-200 dark:border-gray-600">
                  <CardTitle className="text-lg text-orange-700 dark:text-orange-300 font-semibold">Observações</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações Gerais</Label>
                    <Textarea
                      id="observacoes"
                      name="observacoes"
                      defaultValue={editingProduct?.observacoes || ""}
                      placeholder="Informações adicionais sobre o produto"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="px-6 py-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {createProductMutation.isPending || updateProductMutation.isPending ? "Salvando..." : editingProduct ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category?.charAt(0).toUpperCase() + category?.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSupplier} onValueChange={setFilterSupplier}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os fornecedores</SelectItem>
                {(suppliers as Fornecedor[])?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <div className="grid gap-6">
        {isLoadingProducts ? (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="mt-2 text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                {searchTerm || filterCategory !== "all" || filterSupplier !== "all" 
                  ? "Nenhum produto encontrado com os filtros aplicados."
                  : "Nenhum produto cadastrado."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package2 className="h-5 w-5 text-blue-600" />
                        {product.nome}
                      </CardTitle>
                      {product.codigoInterno && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Código: {product.codigoInterno}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        type="button"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.descricao}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {product.categoria?.charAt(0).toUpperCase() + product.categoria?.slice(1)}
                      </Badge>
                      {product.unidadeMedida && (
                        <Badge variant="outline">
                          {product.unidadeMedida}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Estoque Atual</p>
                        <p className="font-medium">{product.estoqueAtual || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Estoque Mínimo</p>
                        <p className="font-medium">{product.estoqueMinimo || 0}</p>
                      </div>
                    </div>

                    {product.fornecedores && product.fornecedores.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Fornecedores:</p>
                        <div className="space-y-1">
                          {product.fornecedores.map((fornecedor) => (
                            <div key={fornecedor.id} className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">{fornecedor.fornecedorNome}</span>
                              <span className="font-medium">R$ {fornecedor.preco}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.observacoes && (
                      <div>
                        <p className="text-sm font-medium mb-1">Observações:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}