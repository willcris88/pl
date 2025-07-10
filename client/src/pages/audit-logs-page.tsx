import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  Shield, 
  Clock, 
  User, 
  Activity, 
  Search,
  Filter,
  Calendar,
  Database,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LogAuditoria {
  id: number;
  usuarioId: number;
  acao: string;
  tabela: string;
  registroId?: number;
  dadosAnteriores?: any;
  dadosNovos?: any;
  detalhes?: string;
  enderecoIp?: string;
  userAgent?: string;
  criadoEm: string;
  usuario?: {
    nome: string;
    email: string;
  };
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: logs, isLoading, refetch } = useQuery<LogAuditoria[]>({
    queryKey: ["/logs-auditoria"],
    refetchInterval: 30000, // Atualiza automaticamente a cada 30 segundos
  });

  const getActionIcon = (acao: string) => {
    switch (acao) {
      case 'CREATE':
        return <Plus className="h-4 w-4" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4" />;
      case 'LOGIN':
        return <LogIn className="h-4 w-4" />;
      case 'LOGOUT':
        return <LogOut className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (acao: string) => {
    switch (acao) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
      case 'LOGIN':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'LOGOUT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border border-gray-200 dark:border-gray-800';
    }
  };

  const getTableDisplayName = (tabela: string) => {
    const tableNames: { [key: string]: string } = {
      'usuarios': 'Usuários',
      'ordens_servico': 'Ordens de Serviço',
      'pendencias': 'Pendências',
      'motoristas': 'Motoristas',
      'produtos': 'Produtos',
      'documentos': 'Documentos',
      'contratos': 'Contratos'
    };
    return tableNames[tabela] || tabela;
  };

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.detalhes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === "" || log.acao === selectedAction;
    const matchesTable = selectedTable === "" || log.tabela === selectedTable;
    
    return matchesSearch && matchesAction && matchesTable;
  });

  const uniqueActions = logs ? 
    logs.reduce((acc: string[], log) => {
      if (!acc.includes(log.acao)) acc.push(log.acao);
      return acc;
    }, []) : [];
  
  const uniqueTables = logs ? 
    logs.reduce((acc: string[], log) => {
      if (!acc.includes(log.tabela)) acc.push(log.tabela);
      return acc;
    }, []) : [];

  // Resetar página quando filtros mudarem
  const resetPaginationOnFilter = () => {
    setCurrentPage(1);
  };

  // Paginação
  const totalPages = Math.ceil((filteredLogs?.length || 0) / itemsPerPage);
  const paginatedLogs = filteredLogs?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-0 lg:ml-64">
          <Header title="Logs de Auditoria" />
          
          <main className="p-6 space-y-6">
            {/* Filtros */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Filtros de Auditoria
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="ml-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por usuário ou detalhes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="pl-10 w-full h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Todas as ações</option>
                    {uniqueActions.map(action => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Database className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="pl-10 w-full h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Todas as tabelas</option>
                    {uniqueTables.map(table => (
                      <option key={table} value={table}>
                        {getTableDisplayName(table)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Lista de Logs */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-6">
                <Activity className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Histórico de Atividades
                </h2>
                <Badge variant="secondary" className="ml-auto">
                  {filteredLogs?.length || 0} registros
                </Badge>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-500"></div>
                    <span>Carregando logs...</span>
                  </div>
                </div>
              ) : paginatedLogs && paginatedLogs.length > 0 ? (
                <div className="space-y-4">
                  {paginatedLogs.map((log) => (
                    <Card key={log.id} className="p-5 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors">
                      <div className="space-y-4">
                        {/* Header com ação e timestamp */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getActionColor(log.acao)} shadow-sm`}>
                              {getActionIcon(log.acao)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getActionColor(log.acao)}>
                                {log.acao}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getTableDisplayName(log.tabela)}
                              </Badge>
                              {log.registroId && (
                                <Badge variant="secondary" className="text-xs">
                                  ID: {log.registroId}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                            <Clock className="h-4 w-4" />
                            {format(new Date(log.criadoEm), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                          </div>
                        </div>
                        
                        {/* Detalhes da ação */}
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium px-1">
                          {log.detalhes || `Ação ${log.acao} na tabela ${getTableDisplayName(log.tabela)}`}
                        </p>
                        
                        {/* Informações técnicas */}
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="font-medium">Usuário ID:</span> {log.usuarioId}
                          </div>
                          
                          {log.enderecoIp && (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                              <span className="font-medium">IP:</span> {log.enderecoIp}
                            </div>
                          )}
                          
                          {log.userAgent && (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium">Navegador:</span> 
                              <span className="ml-1">
                                {log.userAgent.includes('curl') ? 'API/Sistema' : 
                                 log.userAgent.includes('Chrome') ? 'Google Chrome' :
                                 log.userAgent.includes('Firefox') ? 'Mozilla Firefox' :
                                 log.userAgent.includes('Safari') ? 'Safari' : 'Navegador'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum log de auditoria encontrado</p>
                </div>
              )}
              
              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Página {currentPage} de {totalPages} • {filteredLogs?.length || 0} registros
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}