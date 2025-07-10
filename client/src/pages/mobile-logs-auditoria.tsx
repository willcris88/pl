import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MobileCard } from "@/components/mobile/mobile-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Shield, User, Clock, Database, Edit, Trash, Plus } from "lucide-react";
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
  ip?: string;
  userAgent?: string;
  criadoEm: string;
  usuario?: {
    nome: string;
    email: string;
  };
}

export default function MobileLogsAuditoria() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcao, setFilterAcao] = useState('all');
  const [filterTabela, setFilterTabela] = useState('all');

  const { data: logs = [], isLoading } = useQuery<LogAuditoria[]>({
    queryKey: ['/api/logs-auditoria'],
    queryFn: async () => {
      const response = await fetch('/api/logs-auditoria', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar logs');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.usuario?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.tabela.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.acao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAcao = filterAcao === 'all' || log.acao === filterAcao;
    const matchesTabela = filterTabela === 'all' || log.tabela === filterTabela;
    return matchesSearch && matchesAcao && matchesTabela;
  });

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case 'CREATE': return 'green';
      case 'UPDATE': return 'yellow';
      case 'DELETE': return 'red';
      default: return 'blue';
    }
  };

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case 'CREATE': return <Plus className="h-4 w-4" />;
      case 'UPDATE': return <Edit className="h-4 w-4" />;
      case 'DELETE': return <Trash className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const tabelas = [...new Set(logs.map(log => log.tabela))];
  const acoes = [...new Set(logs.map(log => log.acao))];

  if (isLoading) {
    return (
      <MobileLayout title="Logs de Auditoria">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Logs de Auditoria">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterAcao} onValueChange={setFilterAcao}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {acoes.map(acao => (
                <SelectItem key={acao} value={acao}>{acao}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterTabela} onValueChange={setFilterTabela}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tabela" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {tabelas.map(tabela => (
                <SelectItem key={tabela} value={tabela}>{tabela}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-900 dark:text-green-100">
              {logs.filter(l => l.acao === 'CREATE').length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              Criações
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
              {logs.filter(l => l.acao === 'UPDATE').length}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              Atualizações
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-red-900 dark:text-red-100">
              {logs.filter(l => l.acao === 'DELETE').length}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              Exclusões
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <MobileCard
              key={log.id}
              title={`${log.acao} em ${log.tabela}`}
              subtitle={log.usuario?.nome || 'Usuário desconhecido'}
              badge={log.acao}
              badgeColor={getAcaoColor(log.acao)}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4" />
                  {log.usuario?.email || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  {format(new Date(log.criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
                {log.registroId && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Database className="h-4 w-4" />
                    Registro ID: {log.registroId}
                  </div>
                )}
                {log.ip && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    IP: {log.ip}
                  </div>
                )}
              </div>
            </MobileCard>
          ))}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
          {filteredLogs.length} de {logs.length} logs exibidos
        </div>
      </div>
    </MobileLayout>
  );
}