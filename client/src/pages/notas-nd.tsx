import { useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2, FileText, Calendar, DollarSign, Building, User, FileDown } from "lucide-react";
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
import { NotaNd, InserirNotaNd } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotasNdPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNota, setEditingNota] = useState<NotaNd | null>(null);
  const [formData, setFormData] = useState<Partial<InserirNotaNd>>({});
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar notas ND
  const { data: notasNd = [], isLoading } = useQuery({
    queryKey: ["/api/notas-nd"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/notas-nd");
        if (!response.ok) {
          throw new Error("Erro ao buscar notas ND");
        }
        return await response.json();
      } catch (error) {
        console.error("Erro ao buscar notas ND:", error);
        return [];
      }
    }
  });

  // Estatísticas
  const stats = useMemo(() => {
    const total = notasNd.length;
    const pendentes = notasNd.filter((nota: NotaNd) => nota.status === "pendente").length;
    const pagas = notasNd.filter((nota: NotaNd) => nota.status === "pago").length;
    const canceladas = notasNd.filter((nota: NotaNd) => nota.status === "cancelado").length;
    const valorTotal = notasNd.reduce((sum: number, nota: NotaNd) => sum + parseFloat(nota.valor), 0);

    return { total, pendentes, pagas, canceladas, valorTotal };
  }, [notasNd]);

  // Filtrar notas
  const filteredNotas = useMemo(() => {
    if (!notasNd || !Array.isArray(notasNd)) return [];
    
    return notasNd.filter((nota: NotaNd) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (nota.nomeFalecido || '').toLowerCase().includes(searchLower) ||
        (nota.numeroProcesso || '').toLowerCase().includes(searchLower) ||
        (nota.contratada || '').toLowerCase().includes(searchLower)
      );
    });
  }, [notasNd, searchTerm]);

  // Paginação
  const paginatedNotas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredNotas.slice(start, end);
  }, [filteredNotas, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredNotas.length / itemsPerPage);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: InserirNotaNd) => apiRequest("/api/notas-nd", { method: "POST", body: data }),
    onSuccess: () => {
      toast({ title: "Nota ND criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/notas-nd"] });
      setIsDialogOpen(false);
      setFormData({});
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar nota ND", description: error.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InserirNotaNd> }) =>
      apiRequest(`/api/notas-nd/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      toast({ title: "Nota ND atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/notas-nd"] });
      setIsDialogOpen(false);
      setEditingNota(null);
      setFormData({});
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar nota ND", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/notas-nd/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Nota ND excluída com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/notas-nd"] });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao excluir nota ND", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNota) {
      updateMutation.mutate({ id: editingNota.id, data: formData });
    } else {
      createMutation.mutate(formData as InserirNotaNd);
    }
  };

  const handleEdit = (nota: NotaNd) => {
    setEditingNota(nota);
    setFormData(nota);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta nota ND?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleGeneratePDF = (id: number) => {
    window.open(`/api/notas-nd/${id}/pdf`, '_blank');
  };

  const openDialog = () => {
    setEditingNota(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "secondary" as const },
      pago: { label: "Pago", variant: "default" as const },
      cancelado: { label: "Cancelado", variant: "destructive" as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <MaximizedLayout title="Notas ND">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notas ND</h1>
            <p className="text-muted-foreground">Gestão de Notas de Débito</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Nota ND
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNota ? "Editar Nota ND" : "Nova Nota ND"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroProcesso">Número do Processo</Label>
                    <Input
                      id="numeroProcesso"
                      value={formData.numeroProcesso || ""}
                      onChange={(e) => setFormData({ ...formData, numeroProcesso: e.target.value })}
                      placeholder="Digite o número do processo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data || ""}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="contratada">Empresa Contratada</Label>
                  <Input
                    id="contratada"
                    value={formData.contratada || ""}
                    onChange={(e) => setFormData({ ...formData, contratada: e.target.value })}
                    placeholder="Digite a empresa contratada"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor</Label>
                    <Input
                      id="valor"
                      value={formData.valor || ""}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      placeholder="0,00"
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
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingNota ? "Atualizar" : "Criar"} Nota ND
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.pagas}</div>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.valorTotal.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do falecido, número do processo ou empresa..."
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
                  <th className="text-left p-4 font-semibold">Processo</th>
                  <th className="text-left p-4 font-semibold">Falecido</th>
                  <th className="text-left p-4 font-semibold">Empresa</th>
                  <th className="text-left p-4 font-semibold">Valor</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Data</th>
                  <th className="text-left p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8">
                      Carregando notas ND...
                    </td>
                  </tr>
                ) : paginatedNotas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8">
                      Nenhuma nota ND encontrada
                    </td>
                  </tr>
                ) : (
                  paginatedNotas.map((nota: NotaNd) => (
                    <tr key={nota.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{nota.numeroProcesso}</td>
                      <td className="p-4">{nota.nomeFalecido}</td>
                      <td className="p-4">{nota.contratada}</td>
                      <td className="p-4">R$ {parseFloat(nota.valor).toFixed(2)}</td>
                      <td className="p-4">{getStatusBadge(nota.status)}</td>
                      <td className="p-4">
                        {nota.data ? format(new Date(nota.data), "dd/MM/yyyy", { locale: ptBR }) : '-'}
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