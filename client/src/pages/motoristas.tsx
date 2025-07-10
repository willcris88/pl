import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Users, Plus, Edit, Trash2, Phone, CreditCard, Calendar } from "lucide-react";

interface Motorista {
  id: number;
  nome: string;
  sobrenome: string;
  telefone?: string;
  email?: string;
  cnh?: string;
  validadeCnh?: string;
  ativo: boolean;
  observacoes?: string;
  criadoEm: string;
}

export default function MotoristasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState<Motorista | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    telefone: "",
    email: "",
    cnh: "",
    validadeCnh: "",
    observacoes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar motoristas
  const { data: motoristas = [], isLoading } = useQuery({
    queryKey: ['/api/motoristas'],
    queryFn: async () => {
      const response = await fetch("/api/motoristas", {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Erro ao buscar motoristas");
      return response.json();
    },
  });

  // Mutation para criar/editar motorista
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingMotorista ? `/api/motoristas/${editingMotorista.id}` : "/api/motoristas";
      const method = editingMotorista ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("Erro ao salvar motorista");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: `Motorista ${editingMotorista ? 'atualizado' : 'criado'} com sucesso!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/motoristas'] });
      closeModal();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar motorista",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar motorista
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/motoristas/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Erro ao excluir motorista");
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Motorista excluído com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/motoristas'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir motorista",
        variant: "destructive",
      });
    },
  });

  const openModal = (motorista?: Motorista) => {
    if (motorista) {
      setEditingMotorista(motorista);
      setFormData({
        nome: motorista.nome,
        sobrenome: motorista.sobrenome,
        telefone: motorista.telefone || "",
        email: motorista.email || "",
        cnh: motorista.cnh || "",
        validadeCnh: motorista.validadeCnh ? motorista.validadeCnh.split('T')[0] : "",
        observacoes: motorista.observacoes || "",
      });
    } else {
      setEditingMotorista(null);
      setFormData({
        nome: "",
        sobrenome: "",
        telefone: "",
        email: "",
        cnh: "",
        validadeCnh: "",
        observacoes: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMotorista(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      ativo: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este motorista?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dados do Motorista
                </h1>
              </div>
              <Button
                onClick={() => openModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Motorista
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <span>Carregando motoristas...</span>
              </div>
            ) : (
              <div className="grid gap-4">
                {motoristas.map((motorista: Motorista) => (
                  <Card key={motorista.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {motorista.nome} {motorista.sobrenome}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {motorista.telefone && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Phone className="h-4 w-4" />
                                <span>Tel: {motorista.telefone}</span>
                              </div>
                            )}
                            
                            {motorista.cnh && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <CreditCard className="h-4 w-4" />
                                <span>CNH: {motorista.cnh}</span>
                              </div>
                            )}
                            
                            {motorista.validadeCnh && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Calendar className="h-4 w-4" />
                                <span>Validade: {new Date(motorista.validadeCnh).toLocaleDateString('pt-BR')}</span>
                              </div>
                            )}
                          </div>
                          
                          {motorista.observacoes && (
                            <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm">
                              {motorista.observacoes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(motorista)}
                            className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(motorista.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Modal de Criação/Edição */}
            <Dialog open={isModalOpen} onOpenChange={closeModal}>
              <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">
                    {editingMotorista ? "Editar Motorista" : "Novo Motorista"}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sobrenome">Sobrenome *</Label>
                      <Input
                        id="sobrenome"
                        value={formData.sobrenome}
                        onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cnh">CNH</Label>
                      <Input
                        id="cnh"
                        value={formData.cnh}
                        onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="validadeCnh">Validade CNH</Label>
                      <Input
                        id="validadeCnh"
                        type="date"
                        value={formData.validadeCnh}
                        onChange={(e) => setFormData({ ...formData, validadeCnh: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={closeModal}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}