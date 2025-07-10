import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, FileText, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function NotasContratuais() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para buscar todas as notas contratuais
  const { data: notasContratuais = [], isLoading } = useQuery({
    queryKey: ["/api/notas-contratuais"],
    queryFn: async () => {
      const response = await fetch("/api/notas-contratuais");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Mutation para excluir nota contratual
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/notas-contratuais/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notas-contratuais"] });
      queryClient.invalidateQueries({ queryKey: ["/api/produtos-os"] });
      toast({
        title: "Sucesso",
        description: "Nota contratual excluída com sucesso. Produtos liberados para nova geração.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir nota contratual",
        variant: "destructive",
      });
    },
  });

  const filteredNotas = Array.isArray(notasContratuais) ? notasContratuais.filter((nota: any) =>
    nota.numeroNota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.nomeContratante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.ordemServicoId?.toString().includes(searchTerm)
  ) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notas Contratuais
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerenciar todas as notas contratuais do sistema
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lista de Notas Contratuais
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Campo de Pesquisa */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Pesquisar por número da nota, contratante ou OS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Cabeçalho da Tabela */}
                <div className="grid grid-cols-7 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-semibold text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <div>Número NC</div>
                  <div>OS</div>
                  <div>Contratante</div>
                  <div>Valor Total</div>
                  <div>Status</div>
                  <div>Data Criação</div>
                  <div>Ações</div>
                </div>

                {/* Lista de Notas */}
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Carregando...</div>
                  ) : filteredNotas.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma nota contratual encontrada</p>
                    </div>
                  ) : (
                    filteredNotas.map((nota: any) => (
                      <div key={nota.id} className="grid grid-cols-7 gap-4 p-3 bg-white dark:bg-gray-700 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="font-mono font-medium text-blue-600">
                          {nota.numeroNota}
                        </div>
                        
                        <div className="font-mono">
                          OS #{nota.ordemServicoId}
                        </div>
                        
                        <div className="font-medium">
                          {nota.nomeContratante}
                        </div>
                        
                        <div className="font-mono text-green-600">
                          R$ {parseFloat(nota.valorTotal).toFixed(2).replace('.', ',')}
                        </div>
                        
                        <div>
                          <Badge className={getStatusColor(nota.status)}>
                            {nota.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {new Date(nota.criadoEm).toLocaleDateString('pt-BR')}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Nota Contratual</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a nota contratual <strong>{nota.numeroNota}</strong>?
                                  <br /><br />
                                  <span className="text-orange-600 font-medium">
                                    ⚠️ Esta ação irá restaurar a disponibilidade dos produtos para gerar uma nova nota contratual.
                                  </span>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(nota.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}