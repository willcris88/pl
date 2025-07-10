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
  ChevronsRight,
  ChevronDown,
  FileText,
  Clipboard
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Obito {
  id: number;
  nome: string;
  sexo: string;
  nascimento: string | null;
  falecimento: string | null;
  naturalidade: string | null;
  estado_civil: string | null;
  profissao: string | null;
  nome_pai: string | null;
  nome_mae: string | null;
  endereco: string | null;
  criadoEm: string;
  atualizadoEm: string;
  natimorto: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function ObitosListaCompacta() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAtaModalOpen, setIsAtaModalOpen] = useState(false);
  const [selectedObitoId, setSelectedObitoId] = useState<number | null>(null);
  const [ataProcedimento, setAtaProcedimento] = useState({
    dataProcedimento: "",
    horaProcedimento: "",
    tecnicoResponsavel: ""
  });

  const { data: obitos = [], isLoading, error } = useQuery<Obito[]>({
    queryKey: ["/api/obitos"],
    queryFn: async () => {
      const response = await fetch("/api/obitos");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      return response.json();
    },
  });

  // Filtrar óbitos baseado na busca
  const filteredObitos = useMemo(() => {
    if (!searchTerm) return obitos;
    
    const searchLower = searchTerm.toLowerCase();
    return obitos.filter(obito => 
      obito.nome.toLowerCase().includes(searchLower) ||
      (obito.nome_pai && obito.nome_pai.toLowerCase().includes(searchLower)) ||
      (obito.nome_mae && obito.nome_mae.toLowerCase().includes(searchLower)) ||
      (obito.naturalidade && obito.naturalidade.toLowerCase().includes(searchLower))
    );
  }, [obitos, searchTerm]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredObitos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentObitos = filteredObitos.slice(startIndex, endIndex);

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

  const calculateAge = (nascimento: string | null, falecimento: string | null) => {
    if (!nascimento || !falecimento) return 'N/A';
    try {
      const nasc = new Date(nascimento);
      const falec = new Date(falecimento);
      const age = falec.getFullYear() - nasc.getFullYear();
      const monthDiff = falec.getMonth() - nasc.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && falec.getDate() < nasc.getDate())) {
        return `${age - 1} anos`;
      }
      return `${age} anos`;
    } catch {
      return 'N/A';
    }
  };

  // Função para gerar declaração de óbito
  const gerarDeclaracaoObito = (obitoId: number) => {
    try {
      // Abrir PDF em nova aba
      const url = `/api/obitos/${obitoId}/declaracao-pdf`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Erro ao gerar declaração de óbito:', error);
    }
  };

  // Função para abrir modal Ata de Somatoconservação
  const handleOpenAtaModal = (obitoId: number) => {
    setSelectedObitoId(obitoId);
    setAtaProcedimento({
      dataProcedimento: new Date().toISOString().split('T')[0],
      horaProcedimento: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      tecnicoResponsavel: ""
    });
    setIsAtaModalOpen(true);
  };

  // Função para gerar Ata de Somatoconservação
  const handleGerarAta = async () => {
    if (!selectedObitoId || !ataProcedimento.tecnicoResponsavel.trim()) {
      return;
    }

    try {
      const params = new URLSearchParams({
        dataProcedimento: ataProcedimento.dataProcedimento,
        horaProcedimento: ataProcedimento.horaProcedimento,
        tecnicoResponsavel: ataProcedimento.tecnicoResponsavel
      });

      const url = `/api/ata-somatoconservacao/${selectedObitoId}?${params.toString()}`;
      
      // Fechar modal imediatamente
      setIsAtaModalOpen(false);
      
      // Abrir PDF em nova aba após fechar modal
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 100);
      
    } catch (error) {
      console.error('Erro ao gerar Ata de Somatoconservação:', error);
    }
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
                Óbitos
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
                Óbitos
              </h1>
              <div className="text-center text-red-600 dark:text-red-400">
                Erro ao carregar óbitos: {error.message}
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
                Óbitos
              </h1>
              <Link to="/obitos/criar">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Óbito
                </Button>
              </Link>
            </div>
            
            {/* Busca e estatísticas */}
            <div className="flex gap-4 items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, pais ou naturalidade..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {searchTerm ? (
                  <>Mostrando {filteredObitos.length} de {obitos.length}</>
                ) : (
                  <>Total: {obitos.length} óbitos</>
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
                        Nome
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sexo
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Idade
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data Falecimento
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Naturalidade
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentObitos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'Nenhum óbito encontrado para esta busca' : 'Nenhum óbito encontrado'}
                        </td>
                      </tr>
                    ) : (
                      currentObitos.map((obito) => (
                        <tr key={obito.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-foreground max-w-48 truncate">
                            {obito.nome}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {obito.sexo || 'N/I'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {calculateAge(obito.nascimento, obito.falecimento)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(obito.falecimento)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-32 truncate">
                            {obito.naturalidade || 'N/I'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                obito.natimorto 
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              }`}
                            >
                              {obito.natimorto ? 'Natimorto' : 'Normal'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              {/* Dropdown de documentos para cada item */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Documentos">
                                    <FileText className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem 
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => gerarDeclaracaoObito(obito.id)}
                                  >
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span>Impressão de óbito</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => handleOpenAtaModal(obito.id)}
                                  >
                                    <Clipboard className="h-4 w-4 text-red-600" />
                                    <span>Ata somatoconservação</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
                              <Link to={`/obitos/${obito.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Visualizar">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </Link>
                              <Link to={`/obitos/editar/${obito.id}`}>
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
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredObitos.length)} de {filteredObitos.length} resultados
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

      {/* Modal Ata de Somatoconservação */}
      {isAtaModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setIsAtaModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ata de Somatoconservação
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                Informe a data e hora do procedimento realizado
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Card principal com fundo elegante */}
              <div className="border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        📅 Data do Procedimento
                      </label>
                      <input
                        type="date"
                        value={ataProcedimento.dataProcedimento}
                        onChange={(e) => setAtaProcedimento(prev => ({ ...prev, dataProcedimento: e.target.value }))}
                        className="w-full h-11 px-3 border border-blue-200 dark:border-blue-700 rounded-md focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        🕐 Hora do Procedimento
                      </label>
                      <input
                        type="time"
                        value={ataProcedimento.horaProcedimento}
                        onChange={(e) => setAtaProcedimento(prev => ({ ...prev, horaProcedimento: e.target.value }))}
                        className="w-full h-11 px-3 border border-blue-200 dark:border-blue-700 rounded-md focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      👨‍⚕️ Técnico Responsável
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do técnico responsável pelo procedimento"
                      value={ataProcedimento.tecnicoResponsavel}
                      onChange={(e) => setAtaProcedimento(prev => ({ ...prev, tecnicoResponsavel: e.target.value }))}
                      className="w-full h-11 px-3 border border-blue-200 dark:border-blue-700 rounded-md focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAtaModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGerarAta}
                  disabled={!ataProcedimento.tecnicoResponsavel.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Clipboard className="w-4 h-4" />
                  Gerar Ata
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}