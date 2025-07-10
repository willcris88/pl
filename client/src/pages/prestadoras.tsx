import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, User, Phone, Mail, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Prestadora {
  id: number;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  numeroEndereco?: string;
  complemento?: string;
  servicos?: string;

  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export default function PrestadorasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrestadora, setEditingPrestadora] = useState<Prestadora | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    numeroEndereco: "",
    complemento: "",
    servicos: "",

    ativo: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: prestadoras = [], isLoading } = useQuery({
    queryKey: ['/api/prestadoras'],
    queryFn: () => apiRequest('GET', '/prestadoras').then(response => response.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('Dados a serem enviados:', data);
      return apiRequest('POST', '/prestadoras', data);
    },
    onSuccess: (response) => {
      console.log('Prestadora criada com sucesso:', response.data);
      queryClient.invalidateQueries({ queryKey: ['/api/prestadoras'] });
      toast({ title: "Sucesso", description: "Prestadora criada com sucesso!" });
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      console.error('Erro completo ao criar prestadora:', error);
      console.error('Response data:', error.response?.data);
      toast({ 
        title: "Erro", 
        description: error.response?.data?.details || "Erro ao criar prestadora", 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PATCH', `/prestadoras/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prestadoras'] });
      toast({ title: "Sucesso", description: "Prestadora atualizada com sucesso!" });
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar prestadora:', error);
      toast({ title: "Erro", description: "Erro ao atualizar prestadora", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/prestadoras/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prestadoras'] });
      toast({ title: "Sucesso", description: "Prestadora excluída com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao excluir prestadora", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      cnpj: "",
      telefone: "",
      email: "",
      endereco: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      numeroEndereco: "",
      complemento: "",
      servicos: "",

      ativo: true,
    });
    setEditingPrestadora(null);
    setIsModalOpen(false);
  };

  const handleEdit = (prestadora: Prestadora) => {
    setEditingPrestadora(prestadora);
    setFormData({
      nome: prestadora.nome,
      cnpj: prestadora.cnpj || "",
      telefone: prestadora.telefone || "",
      email: prestadora.email || "",
      endereco: prestadora.endereco || "",
      bairro: prestadora.bairro || "",
      cidade: prestadora.cidade || "",
      estado: prestadora.estado || "",
      cep: prestadora.cep || "",
      numeroEndereco: prestadora.numeroEndereco || "",
      complemento: prestadora.complemento || "",
      servicos: prestadora.servicos || "",

      ativo: prestadora.ativo,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    if (!formData.endereco.trim()) {
      toast({ title: "Erro", description: "Rua é obrigatória", variant: "destructive" });
      return;
    }

    if (!formData.numeroEndereco.trim()) {
      toast({ title: "Erro", description: "Número é obrigatório", variant: "destructive" });
      return;
    }

    if (!formData.bairro.trim()) {
      toast({ title: "Erro", description: "Bairro é obrigatório", variant: "destructive" });
      return;
    }

    if (!formData.cidade.trim()) {
      toast({ title: "Erro", description: "Cidade é obrigatória", variant: "destructive" });
      return;
    }

    if (!formData.estado.trim()) {
      toast({ title: "Erro", description: "Estado é obrigatório", variant: "destructive" });
      return;
    }

    if (!formData.cep.trim()) {
      toast({ title: "Erro", description: "CEP é obrigatório", variant: "destructive" });
      return;
    }

    if (editingPrestadora) {
      updateMutation.mutate({ id: editingPrestadora.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredPrestadoras = prestadoras.filter((prestadora: Prestadora) =>
    prestadora.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prestadora.servicos && prestadora.servicos.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (prestadora.email && prestadora.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prestadoras</h1>
                <p className="text-gray-600 dark:text-gray-400">Gerencie prestadores de serviços</p>
              </div>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Prestadora
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Lista de Prestadoras
                </CardTitle>
                <div className="relative max-w-sm">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar prestadoras..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : filteredPrestadoras.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma prestadora encontrada
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredPrestadoras.map((prestadora: Prestadora) => (
                      <div key={prestadora.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{prestadora.nome}</h3>
                              <Badge variant={prestadora.ativo ? "default" : "secondary"}>
                                {prestadora.ativo ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                              {prestadora.cnpj && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">CNPJ:</span>
                                  {prestadora.cnpj}
                                </div>
                              )}
                              {prestadora.telefone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  {prestadora.telefone}
                                </div>
                              )}
                              {prestadora.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  {prestadora.email}
                                </div>
                              )}
                              {prestadora.endereco && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span className="text-sm">
                                    {prestadora.endereco}
                                    {prestadora.numeroEndereco && `, ${prestadora.numeroEndereco}`}
                                    {prestadora.complemento && `, ${prestadora.complemento}`}
                                    {prestadora.bairro && ` - ${prestadora.bairro}`}
                                    {prestadora.cidade && `, ${prestadora.cidade}`}
                                    {prestadora.estado && `/${prestadora.estado}`}
                                    {prestadora.cep && ` - ${prestadora.cep}`}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {prestadora.servicos && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Serviços:
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {prestadora.servicos}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(prestadora)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(prestadora.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrestadora ? "Editar Prestadora" : "Nova Prestadora"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome da prestadora"
                required
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            {/* Seção de Endereço */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Endereço Completo</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endereco">Rua *</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Nome da rua"
                  />
                </div>
                
                <div>
                  <Label htmlFor="numeroEndereco">Número *</Label>
                  <Input
                    id="numeroEndereco"
                    value={formData.numeroEndereco}
                    onChange={(e) => setFormData({ ...formData, numeroEndereco: e.target.value })}
                    placeholder="123"
                  />
                </div>
                
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    placeholder="Apto, sala, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    placeholder="Nome do bairro"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Nome da cidade"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>

            {/* Seção de Serviços */}
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-sm text-blue-700 dark:text-blue-300">Serviços e Valores</h3>
              
              <div>
                <Label htmlFor="servicos">Serviços Oferecidos</Label>
                <Textarea
                  id="servicos"
                  value={formData.servicos}
                  onChange={(e) => setFormData({ ...formData, servicos: e.target.value })}
                  placeholder="Descreva os serviços oferecidos..."
                  rows={3}
                />
              </div>
              

            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {editingPrestadora ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}