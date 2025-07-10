import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { 
  Search,
  Plus,
  Edit,
  Eye,
  FileText,
  Calendar,
  User,
  Phone
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function OrdensServicoLista() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: ordens = [], isLoading, error } = useQuery<OrdemServico[]>({
    queryKey: ["/api/ordens-servico"],
    select: (data) => data || [],
    retry: 3
  });

  console.log("Debug ordens-servico:", { ordens, isLoading, error });

  const filteredOrdens = ordens.filter(ordem =>
    ordem.numeroOs.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.nomeFalecido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.contratante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'finalizado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-background">
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-background">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-foreground mb-8">
              Ordens de Serviço
            </h1>
            <div className="space-y-6">
              {/* Cabeçalho com busca e ação */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
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

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{ordens.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {ordens.filter(o => o.status === 'em_andamento').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Finalizadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {ordens.filter(o => o.status === 'finalizado').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {ordens.filter(o => o.status === 'pendente').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Ordens */}
        <div className="space-y-4">
          {filteredOrdens.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem de serviço cadastrada'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm 
                    ? 'Tente ajustar os termos de busca ou criar uma nova ordem.'
                    : 'Comece criando sua primeira ordem de serviço.'
                  }
                </p>
                {!searchTerm && (
                  <Link to="/ordens-servico/criar">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Ordem
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredOrdens.map((ordem) => (
              <Card key={ordem.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Informações principais */}
                    <div className="lg:col-span-6">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            OS #{ordem.numeroOs}
                          </h3>
                          <Badge className={getStatusColor(ordem.status)}>
                            {ordem.status?.replace('_', ' ').toUpperCase() || 'INDEFINIDO'}
                          </Badge>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Falecido:</span>
                            <span>{ordem.nomeFalecido}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Contratante:</span>
                            <span>{ordem.contratante}</span>
                          </div>
                          {ordem.telefoneResponsavel && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{ordem.telefoneResponsavel}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Informações secundárias */}
                    <div className="lg:col-span-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>
                          <span className="font-medium">Plano:</span> {ordem.plano}
                        </div>
                        <div>
                          <span className="font-medium">Falecimento:</span> {formatDate(ordem.dataFalecimento)}
                        </div>
                        <div>
                          <span className="font-medium">Criado em:</span> {formatDate(ordem.criadoEm)}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="lg:col-span-2 flex justify-end">
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
                </CardContent>
              </Card>
            ))
          )}

          {/* Mostra total de resultados filtrados */}
          {searchTerm && filteredOrdens.length > 0 && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Mostrando {filteredOrdens.length} de {ordens.length} ordens de serviço
            </div>
          )}
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}