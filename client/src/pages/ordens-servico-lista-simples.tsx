import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Link } from "wouter";
import { Search, Plus, Edit, Eye, User, Phone, Calendar, Clock } from "lucide-react";

interface OrdemServico {
  id: number;
  numeroOs: string;
  nomeFalecido: string;
  plano: string;
  contratante: string;
  dataFalecimento: string | null;
  status: string;
  telefoneResponsavel: string;
  criadoEm: string;
}

export default function OrdensServicoListaSimples() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: ordens = [], isLoading, error } = useQuery<OrdemServico[]>({
    queryKey: ["/api/ordens-servico"],
    queryFn: async () => {
      console.log("Fazendo requisição para ordens de serviço...");
      const response = await fetch("/api/ordens-servico");
      console.log("Status da resposta:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log("Dados recebidos:", data);
      return data;
    },
  });

  console.log("Estado da query:", { ordens, isLoading, error });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-foreground mb-8">
                Ordens de Serviço
              </h1>
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-foreground mb-8">
                Ordens de Serviço
              </h1>
              <div className="text-center text-red-600 dark:text-red-400">
                Erro ao carregar ordens: {error.message}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-foreground mb-8">
              Ordens de Serviço
            </h1>
            
            {/* Cabeçalho com busca */}
            <div className="flex gap-4 justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por número OS, falecido ou contratante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Link to="/ordens-servico/criar">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Ordem de Serviço
                </Button>
              </Link>
            </div>

            {/* Lista de ordens */}
            <div className="space-y-4">
              {ordens.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhuma ordem de serviço encontrada
                </div>
              ) : (
                ordens.map((ordem) => (
                  <div key={ordem.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground">
                          {ordem.numeroOs}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {ordem.nomeFalecido}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Contratante: {ordem.contratante}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Plano: {ordem.plano}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Status: {ordem.status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/ordens-servico/${ordem.id}`}>
                          <Button variant="outline" size="sm" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/ordens-servico/editar/${ordem.id}`}>
                          <Button variant="outline" size="sm" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total de ordens */}
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Total: {ordens.length} ordens de serviço
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}