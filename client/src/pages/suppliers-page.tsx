import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  User,
  FileText,
  Home,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { apiRequest } from "@/lib/queryClient";
import { type Fornecedor, type InserirFornecedor } from "@shared/schema";

export default function SuppliersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Fornecedor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  // Queries
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["/fornecedores"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/fornecedores");
      return response.data;
    },
  });

  // Mutations
  const createSupplierMutation = useMutation({
    mutationFn: async (data: InserirFornecedor) => {
      const response = await apiRequest("POST", "/fornecedores", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/fornecedores"] });
      setIsModalOpen(false);
      setEditingSupplier(null);
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InserirFornecedor> }) => {
      const response = await apiRequest("PUT", `/fornecedores/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/fornecedores"] });
      setIsModalOpen(false);
      setEditingSupplier(null);
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/fornecedores/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/fornecedores"] });
    },
  });

  // Filtrar fornecedores
  const filteredSuppliers = (suppliers as Fornecedor[])?.filter((supplier: Fornecedor) => {
    const matchesSearch = supplier.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.cpfCnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && supplier.status === 1) ||
                         (filterStatus === "inactive" && supplier.status === 0);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: InserirFornecedor = {
      nome: formData.get("nome") as string,
      status: formData.get("status") === "1" ? 1 : 0,
      email: formData.get("email") as string || undefined,
      telefone: formData.get("telefone") as string || undefined,
      celular: formData.get("celular") as string || undefined,
      responsavel: formData.get("responsavel") as string || undefined,
      cep: formData.get("cep") as string || undefined,
      endereco: formData.get("endereco") as string || undefined,
      bairro: formData.get("bairro") as string || undefined,
      cidade: formData.get("cidade") as string || undefined,
      estado: formData.get("estado") as string || undefined,
      numeroEndereco: formData.get("numeroEndereco") ? parseInt(formData.get("numeroEndereco") as string) : 0,
      complemento: formData.get("complemento") as string || undefined,
      cpfCnpj: formData.get("cpfCnpj") as string || undefined,
      discriminacao: formData.get("discriminacao") as string || undefined,
    };

    if (editingSupplier) {
      updateSupplierMutation.mutate({ id: editingSupplier.id, data });
    } else {
      createSupplierMutation.mutate(data);
    }
  };

  const handleEdit = (supplier: Fornecedor) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      deleteSupplierMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-dark">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Fornecedores" />
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Fornecedores" />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Fornecedores</h1>
              </div>
              <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingSupplier(null);
                    setIsModalOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Fornecedor
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-2 border-border shadow-xl"
                  onEscapeKeyDown={(e) => e.preventDefault()}
                  onPointerDownOutside={(e) => e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle>
                      {editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informações Básicas */}
                    <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center text-foreground">
                          <User className="w-5 h-5 mr-2 text-blue-600" />
                          Informações Básicas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome">Nome *</Label>
                            <Input
                              id="nome"
                              name="nome"
                              defaultValue={editingSupplier?.nome || ""}
                              placeholder="Nome do fornecedor"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="responsavel">Responsável</Label>
                            <Input
                              id="responsavel"
                              name="responsavel"
                              defaultValue={editingSupplier?.responsavel || ""}
                              placeholder="Nome do responsável"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                            <Input
                              id="cpfCnpj"
                              name="cpfCnpj"
                              defaultValue={editingSupplier?.cpfCnpj || ""}
                              placeholder="00.000.000/0001-00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={editingSupplier?.status?.toString() || "1"}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Ativo</SelectItem>
                                <SelectItem value="0">Inativo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contato */}
                    <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center text-foreground">
                          <Phone className="w-5 h-5 mr-2 text-green-600" />
                          Contato
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              defaultValue={editingSupplier?.email || ""}
                              placeholder="email@exemplo.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input
                              id="telefone"
                              name="telefone"
                              defaultValue={editingSupplier?.telefone || ""}
                              placeholder="(11) 1234-5678"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="celular">Celular</Label>
                            <Input
                              id="celular"
                              name="celular"
                              defaultValue={editingSupplier?.celular || ""}
                              placeholder="(11) 99999-9999"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Endereço */}
                    <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center text-foreground">
                          <Home className="w-5 h-5 mr-2 text-purple-600" />
                          Endereço
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cep">CEP</Label>
                            <Input
                              id="cep"
                              name="cep"
                              defaultValue={editingSupplier?.cep || ""}
                              placeholder="00000-000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="numeroEndereco">Número</Label>
                            <Input
                              id="numeroEndereco"
                              name="numeroEndereco"
                              type="number"
                              defaultValue={editingSupplier?.numeroEndereco || ""}
                              placeholder="123"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="complemento">Complemento</Label>
                            <Input
                              id="complemento"
                              name="complemento"
                              defaultValue={editingSupplier?.complemento || ""}
                              placeholder="Apto, Sala, etc."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endereco">Endereço</Label>
                          <Input
                            id="endereco"
                            name="endereco"
                            defaultValue={editingSupplier?.endereco || ""}
                            placeholder="Rua, Avenida, etc."
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bairro">Bairro</Label>
                            <Input
                              id="bairro"
                              name="bairro"
                              defaultValue={editingSupplier?.bairro || ""}
                              placeholder="Bairro"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input
                              id="cidade"
                              name="cidade"
                              defaultValue={editingSupplier?.cidade || ""}
                              placeholder="Cidade"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="estado">Estado</Label>
                            <Input
                              id="estado"
                              name="estado"
                              defaultValue={editingSupplier?.estado || ""}
                              placeholder="SP"
                              maxLength={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Observações */}
                    <Card className="border-2 border-border bg-gradient-to-br from-card to-card/80 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center text-foreground">
                          <FileText className="w-5 h-5 mr-2 text-orange-600" />
                          Observações
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label htmlFor="discriminacao">Discriminação</Label>
                          <Input
                            id="discriminacao"
                            name="discriminacao"
                            defaultValue={editingSupplier?.discriminacao || ""}
                            placeholder="Descrição do fornecedor"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-border">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCloseModal}
                        className="px-6 py-2 hover:bg-muted/50"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      >
                        {createSupplierMutation.isPending || updateSupplierMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Salvando...
                          </div>
                        ) : (
                          editingSupplier ? "Atualizar" : "Criar"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filtros e busca */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar fornecedores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de fornecedores */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Fornecedores</CardTitle>
                <CardDescription>
                  {filteredSuppliers.length} fornecedor(es) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum fornecedor encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSuppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{supplier.nome}</div>
                              {supplier.responsavel && (
                                <div className="text-sm text-muted-foreground">
                                  Resp: {supplier.responsavel}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {supplier.cpfCnpj && (
                              <div className="flex items-center text-sm">
                                <Hash className="w-3 h-3 mr-1" />
                                {supplier.cpfCnpj}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {supplier.email && (
                                <div className="flex items-center text-sm">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {supplier.email}
                                </div>
                              )}
                              {supplier.telefone && (
                                <div className="flex items-center text-sm">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {supplier.telefone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {supplier.cidade && supplier.estado && (
                                <div className="flex items-center text-sm">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {supplier.cidade}, {supplier.estado}
                                </div>
                              )}
                              {supplier.bairro && (
                                <div className="text-xs text-muted-foreground">
                                  {supplier.bairro}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={supplier.status === 1 ? "default" : "secondary"}>
                              {supplier.status === 1 ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(supplier)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(supplier.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}