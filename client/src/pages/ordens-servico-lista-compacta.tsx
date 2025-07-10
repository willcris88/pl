import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Link } from "wouter";
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

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

const ITEMS_PER_PAGE = 50;

const statusColors = {
  'pendente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'em_andamento': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'finalizado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export default function OrdensServicoListaCompacta() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: ordens = [], isLoading, error } = useQuery<OrdemServico[]>({
    queryKey: ["/api/ordens-servico"],
    queryFn: async () => {
      const response = await fetch("/api/ordens-servico");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      return response.json();
    },
  });

  // Filtrar ordens baseado na busca
  const filteredOrdens = useMemo(() => {
    if (!searchTerm) return ordens;
    
    const searchLower = searchTerm.toLowerCase();
    return ordens.filter(ordem => 
      ordem.numeroOs.toLowerCase().includes(searchLower) ||
      ordem.nomeFalecido.toLowerCase().includes(searchLower) ||
      ordem.contratante.toLowerCase().includes(searchLower)
    );
  }, [ordens, searchTerm]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredOrdens.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOrdens = filteredOrdens.slice(startIndex, endIndex);

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pendente': 'Pendente',
      'em_andamento': 'Em Andamento',
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

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
          <div className="container mx-auto px-6 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-foreground">
                Ordens de Serviço
              </h1>
              <Link to="/ordens-servico/criar">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Ordem
                </Button>
              </Link>
            </div>
            
            {/* Busca e estatísticas */}
            <div className="flex gap-4 items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por número OS, falecido ou contratante..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {searchTerm ? (
                  <>Mostrando {filteredOrdens.length} de {ordens.length}</>
                ) : (
                  <>Total: {ordens.length} ordens</>
                )}
              </div>
            </div>

            {/* Tabela compacta */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nº OS
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Falecido
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contratante
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Plano
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentOrdens.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'Nenhuma ordem encontrada para esta busca' : 'Nenhuma ordem de serviço encontrada'}
                        </td>
                      </tr>
                    ) : (
                      currentOrdens.map((ordem) => (
                        <tr key={ordem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-foreground">
                            {ordem.numeroOs}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-48 truncate">
                            {ordem.nomeFalecido}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-48 truncate">
                            {ordem.contratante}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-32 truncate">
                            {ordem.plano}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge 
                              variant="secondary" 
                              className={`${statusColors[ordem.status as keyof typeof statusColors] || statusColors.pendente} text-xs`}
                            >
                              {formatStatus(ordem.status)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(ordem.dataFalecimento)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Link to={`/ordens-servico/${ordem.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Visualizar">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </Link>
                              <Link to={`/ordens-servico/editar/${ordem.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </Link>
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
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredOrdens.length)} de {filteredOrdens.length} resultados
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}