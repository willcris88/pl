import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { OrdemServico } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
export function ServiceOrdersList() {
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    numeroOs: "",
    pesquisa: "",
  });
  
  const { toast } = useToast();

  const { data: ordens = [], isLoading } = useQuery<OrdemServico[]>({
    queryKey: ["ordens-servico", filtros],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;
      const searchParams = new URLSearchParams();
      
      if (params.numeroOs) searchParams.append("numeroOs", params.numeroOs);
      if (params.pesquisa) searchParams.append("nomeFalecido", params.pesquisa);
      
      const response = await apiRequest("GET", `/ordens-servico?${searchParams.toString()}`);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/ordens-servico/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens-servico"] });
      toast({
        title: "Sucesso",
        description: "Ordem de serviço excluída com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir ordem de serviço",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta ordem de serviço?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFiltrar = () => {
    queryClient.invalidateQueries({ queryKey: ["/ordens-servico"] });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="secondary">Pendente</Badge>;
      case "em_andamento":
        return <Badge variant="outline">Em Andamento</Badge>;
      case "concluida":
        return <Badge className="bg-success">Concluída</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="numeroOs">Número OS</Label>
              <Input
                id="numeroOs"
                placeholder="Digite o número"
                value={filtros.numeroOs}
                onChange={(e) => setFiltros({ ...filtros, numeroOs: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleFiltrar} className="w-full">
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/ordens-servico/criar">
          <Button className="bg-success hover:bg-success/90">
            <Plus className="mr-2 h-4 w-4" />
            Nova Ordem de Serviço
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Pesquisar..."
            value={filtros.pesquisa}
            onChange={(e) => setFiltros({ ...filtros, pesquisa: e.target.value })}
            className="w-64"
          />
          <Button variant="outline" onClick={handleFiltrar}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">OS</TableHead>
                  <TableHead className="text-muted-foreground">Falecido</TableHead>
                  <TableHead className="text-muted-foreground">Plano</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : ordens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma ordem de serviço encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  ordens.map((ordem) => (
                    <TableRow key={ordem.id} className="hover:bg-primary/50">
                      <TableCell className="text-muted-foreground">{ordem.id}</TableCell>
                      <TableCell className="text-foreground">{ordem.numeroOs}</TableCell>
                      <TableCell className="text-foreground">{ordem.nomeFalecido}</TableCell>
                      <TableCell className="text-muted-foreground">{ordem.plano}</TableCell>
                      <TableCell>{getStatusBadge(ordem.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {ordem.criadoEm ? format(new Date(ordem.criadoEm), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Link to={`/ordens-servico/editar/${ordem.id}`}>
                            <Button size="sm" className="bg-warning hover:bg-warning/90">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(ordem.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
