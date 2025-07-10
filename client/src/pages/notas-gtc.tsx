import { useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2, FileText, Calendar, DollarSign, Building, User, FileDown, Truck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MaximizedLayout } from "@/components/layout/maximized-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { NotaGtc, InserirNotaGtc } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotasGtcPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<NotaGtc | null>(null);
  const [formData, setFormData] = useState<Partial<InserirNotaGtc>>({});
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar notas GTC
  const { data: notasGtc = [], isLoading } = useQuery({
    queryKey: ["/api/notas-gtc"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/notas-gtc");
        if (!response.ok) {
          throw new Error("Erro ao buscar notas GTC");
        }
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar notas GTC:", error);
        return [];
      }
    }
  });

  // Estatísticas
  const stats = useMemo(() => {
    const total = notasGtc.length;
    const ativas = notasGtc.filter((nota: NotaGtc) => nota.status === "ativo").length;
    const canceladas = notasGtc.filter((nota: NotaGtc) => nota.status === "cancelado").length;
    const finalizadas = notasGtc.filter((nota: NotaGtc) => nota.status === "finalizado").length;

    return { total, ativas, canceladas, finalizadas };
  }, [notasGtc]);

  // Filtrar notas
  const filteredNotas = useMemo(() => {
    if (!notasGtc || !Array.isArray(notasGtc)) return [];
    
    return notasGtc.filter((nota: NotaGtc) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (nota.nomeFalecido || '').toLowerCase().includes(searchLower) ||
        (nota.numeroDeclaracao || '').toLowerCase().includes(searchLower) ||
        (nota.empresaTransportador || '').toLowerCase().includes(searchLower) ||
        (nota.agenteFunerario || '').toLowerCase().includes(searchLower)
      );
    });
  }, [notasGtc, searchTerm]);

  // Paginação
  const paginatedNotas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredNotas.slice(start, end);
  }, [filteredNotas, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredNotas.length / itemsPerPage);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: InserirNotaGtc) => apiRequest("/api/notas-gtc", { method: "POST", body: data }),
    onSuccess: () => {
      toast({ title: "Nota GTC criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/notas-gtc"] });
      setIsDialogOpen(false);
      setFormData({});
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar nota GTC", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InserirNotaGtc> }) =>
      apiRequest(`/api/notas-gtc/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      toast({ title: "Nota GTC atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/notas-gtc"] });
      setIsDialogOpen(false);
      setEditingNota(null);
      setFormData({});
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar nota GTC", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/notas-gtc/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Nota GTC excluída com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/notas-gtc"] });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao excluir nota GTC", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNota) {
      updateMutation.mutate({ id: editingNota.id, data: formData });
    } else {
      createMutation.mutate(formData as InserirNotaGtc);
    }
  };

  const handleEdit = (nota: NotaGtc) => {
    setEditingNota(nota);
    setFormData(nota);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta nota GTC?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleGeneratePDF = (id: number) => {
    window.open(`/api/notas-gtc/${id}/pdf`, '_blank');
  };

  const openDialog = () => {
    setEditingNota(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: "Ativo", variant: "default" as const },
      cancelado: { label: "Cancelado", variant: "destructive" as const },
      finalizado: { label: "Finalizado", variant: "secondary" as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <MaximizedLayout title="Notas GTC">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notas GTC</h1>
            <p className="text-muted-foreground">Gestão de Guias de Transporte de Cadáver</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Nota GTC
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNota ? "Editar Nota GTC" : "Nova Nota GTC"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seção: Dados Básicos */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-4">📋 Dados Básicos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numeroDeclaracao">Número da Declaração</Label>
                      <Input
                        id="numeroDeclaracao"
                        value={formData.numeroDeclaracao || ""}
                        onChange={(e) => setFormData({ ...formData, numeroDeclaracao: e.target.value })}
                        placeholder="Digite o número da declaração"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataTransporte">Data do Transporte</Label>
                      <Input
                        id="dataTransporte"
                        type="date"
                        value={formData.dataTransporte || ""}
                        onChange={(e) => setFormData({ ...formData, dataTransporte: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status || ""} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                          <SelectItem value="finalizado">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Seção: Dados do Falecido */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-4">👤 Dados do Falecido</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeFalecido">Nome do Falecido</Label>
                      <Input
                        id="nomeFalecido"
                        value={formData.nomeFalecido || ""}
                        onChange={(e) => setFormData({ ...formData, nomeFalecido: e.target.value })}
                        placeholder="Digite o nome do falecido"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpfFalecido">CPF do Falecido</Label>
                      <Input
                        id="cpfFalecido"
                        value={formData.cpfFalecido || ""}
                        onChange={(e) => setFormData({ ...formData, cpfFalecido: e.target.value })}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={formData.dataNascimento || ""}
                        onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataFalecimento">Data de Falecimento</Label>
                      <Input
                        id="dataFalecimento"
                        type="date"
                        value={formData.dataFalecimento || ""}
                        onChange={(e) => setFormData({ ...formData, dataFalecimento: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Dados do Transporte */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-4">🚚 Dados do Transporte</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="localFalecimento">Local do Falecimento</Label>
                      <Input
                        id="localFalecimento"
                        value={formData.localFalecimento || ""}
                        onChange={(e) => setFormData({ ...formData, localFalecimento: e.target.value })}
                        placeholder="Digite o local do falecimento"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="localRetiradaObito">Local de Retirada</Label>
                      <Input
                        id="localRetiradaObito"
                        value={formData.localRetiradaObito || ""}
                        onChange={(e) => setFormData({ ...formData, localRetiradaObito: e.target.value })}
                        placeholder="Digite o local de retirada"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="destinoCorpo">Destino do Corpo</Label>
                    <Input
                      id="destinoCorpo"
                      value={formData.destinoCorpo || ""}
                      onChange={(e) => setFormData({ ...formData, destinoCorpo: e.target.value })}
                      placeholder="Digite o destino do corpo"
                      required
                    />
                  </div>
                </div>

                {/* Seção: Empresa Transportadora */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-4">🏢 Empresa Transportadora</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="empresaTransportador">Razão Social</Label>
                      <Input
                        id="empresaTransportador"
                        value={formData.empresaTransportador || ""}
                        onChange={(e) => setFormData({ ...formData, empresaTransportador: e.target.value })}
                        placeholder="Digite a razão social"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnpjTransportador">CNPJ</Label>
                      <Input
                        id="cnpjTransportador"
                        value={formData.cnpjTransportador || ""}
                        onChange={(e) => setFormData({ ...formData, cnpjTransportador: e.target.value })}
                        placeholder="00.000.000/0000-00"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="municipioTransportador">Município</Label>
                    <Input
                      id="municipioTransportador"
                      value={formData.municipioTransportador || ""}
                      onChange={(e) => setFormData({ ...formData, municipioTransportador: e.target.value })}
                      placeholder="Digite o município"
                      required
                    />
                  </div>
                </div>

                {/* Seção: Agente Funerário e Veículo */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-4">👨‍💼 Agente Funerário e Veículo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agenteFunerario">Agente Funerário</Label>
                      <Input
                        id="agenteFunerario"
                        value={formData.agenteFunerario || ""}
                        onChange={(e) => setFormData({ ...formData, agenteFunerario: e.target.value })}
                        placeholder="Digite o nome do agente"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rcCpfCnjAgente">RG/CPF/CNJ do Agente</Label>
                      <Input
                        id="rcCpfCnjAgente"
                        value={formData.rcCpfCnjAgente || ""}
                        onChange={(e) => setFormData({ ...formData, rcCpfCnjAgente: e.target.value })}
                        placeholder="Digite o documento do agente"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="placaCarro">Placa do Veículo</Label>
                      <Input
                        id="placaCarro"
                        value={formData.placaCarro || ""}
                        onChange={(e) => setFormData({ ...formData, placaCarro: e.target.value })}
                        placeholder="ABC-1234"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modeloCarro">Modelo do Veículo</Label>
                      <Input
                        id="modeloCarro"
                        value={formData.modeloCarro || ""}
                        onChange={(e) => setFormData({ ...formData, modeloCarro: e.target.value })}
                        placeholder="Digite o modelo do veículo"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Observações */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-4">📝 Observações</h3>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes || ""}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Digite observações adicionais"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingNota ? "Atualizar" : "Criar"} Nota GTC
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativas</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.ativas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.finalizadas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.canceladas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do falecido, declaração, empresa ou agente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Tabela */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">Declaração</th>
                  <th className="text-left p-4 font-semibold">Falecido</th>
                  <th className="text-left p-4 font-semibold">Empresa</th>
                  <th className="text-left p-4 font-semibold">Agente</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Data</th>
                  <th className="text-left p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8">
                      Carregando notas GTC...
                    </td>
                  </tr>
                ) : paginatedNotas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8">
                      Nenhuma nota GTC encontrada
                    </td>
                  </tr>
                ) : (
                  paginatedNotas.map((nota: NotaGtc) => (
                    <tr key={nota.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{nota.numeroDeclaracao}</td>
                      <td className="p-4">{nota.nomeFalecido}</td>
                      <td className="p-4">{nota.empresaTransportador}</td>
                      <td className="p-4">{nota.agenteFunerario}</td>
                      <td className="p-4">{getStatusBadge(nota.status)}</td>
                      <td className="p-4">
                        {nota.dataTransporte ? format(new Date(nota.dataTransporte), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(nota)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGeneratePDF(nota.id)}
                            className="h-8 w-8 p-0"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(nota.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="px-4 py-2">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </MaximizedLayout>
  );
}