import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobileFab } from "@/components/mobile/mobile-fab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, FileText, Calendar, User, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrdemServico {
  id: number;
  nomeDefunto: string;
  servico: string;
  dataServico: string;
  horaServico?: string;
  status: string;
  endereco?: string;
  telefone?: string;
  valorTotal?: number;
  criadoEm: string;
}

export default function MobileOrdensServico() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: ordens = [], isLoading } = useQuery<OrdemServico[]>({
    queryKey: ['/api/ordens-servico'],
    queryFn: async () => {
      const response = await fetch('/api/ordens-servico', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar ordens');
      return response.json();
    },
  });

  const filteredOrdens = ordens.filter(ordem => {
    const matchesSearch = (ordem.nomeDefunto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ordem.servico || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ordem.responsavel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ordem.endereco || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ordem.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string): "green" | "yellow" | "red" | "blue" | "gray" => {
    switch (status) {
      case 'concluido': return 'green';
      case 'em_andamento': return 'yellow';
      case 'pendente': return 'red';
      case 'cancelado': return 'gray';
      default: return 'blue';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluido': return 'Concluído';
      case 'em_andamento': return 'Em Andamento';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title="Ordens de Serviço">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Ordens de Serviço">
      <div className="space-y-4">
        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar por nome ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {ordens.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total de Ordens
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-900 dark:text-green-100">
              {ordens.filter(o => o.status === 'concluido').length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Concluídas
            </div>
          </div>
        </div>

        {/* Lista de ordens */}
        <div className="space-y-3">
          {filteredOrdens.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem de serviço cadastrada'}
            </div>
          ) : (
            filteredOrdens.map((ordem) => (
              <MobileCard
                key={ordem.id}
                title={ordem.nomeDefunto}
                subtitle={ordem.servico}
                badge={getStatusLabel(ordem.status)}
                badgeColor={getStatusColor(ordem.status)}
                onClick={() => window.location.href = `/ordens-servico/editar/${ordem.id}`}
                onEdit={() => window.location.href = `/ordens-servico/editar/${ordem.id}`}
                onDelete={async () => {
                  if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
                    try {
                      const response = await fetch(`/api/ordens-servico/${ordem.id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                      });
                      if (response.ok) {
                        window.location.reload();
                      }
                    } catch (error) {
                      alert('Erro ao excluir ordem');
                    }
                  }
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {ordem.dataServico ? format(new Date(ordem.dataServico), 'dd/MM/yyyy', { locale: ptBR }) : 'Data não informada'}
                    {ordem.horaServico && ` às ${ordem.horaServico}`}
                  </div>
                  
                  {ordem.endereco && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{ordem.endereco}</span>
                    </div>
                  )}
                  
                  {ordem.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      {ordem.telefone}
                    </div>
                  )}
                  
                  {ordem.valorTotal && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Valor Total:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        R$ {ordem.valorTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                </div>
              </MobileCard>
            ))
          )}
        </div>

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
          {filteredOrdens.length} de {ordens.length} ordens exibidas
        </div>
      </div>

      {/* FAB para criar nova ordem */}
      <MobileFab 
        onClick={() => window.location.href = '/ordens-servico/criar'}
        label="Nova ordem"
      />
    </MobileLayout>
  );
}