import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobileFab } from "@/components/mobile/mobile-fab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Building, Phone, Mail, MapPin, User } from "lucide-react";

interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  responsavel?: string;
  status: number;
  discriminacao?: string;
  criadoEm: string;
}

export default function MobileFornecedores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: fornecedores = [], isLoading } = useQuery<Fornecedor[]>({
    queryKey: ['/api/fornecedores'],
    queryFn: async () => {
      const response = await fetch('/api/fornecedores', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar fornecedores');
      return response.json();
    },
  });

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.responsavel?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && fornecedor.status === 1) ||
                         (filterStatus === 'inactive' && fornecedor.status === 0);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: number): "green" | "red" => {
    return status === 1 ? 'green' : 'red';
  };

  const getStatusLabel = (status: number) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  };

  if (isLoading) {
    return (
      <MobileLayout title="Fornecedores">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Fornecedores">
      <div className="space-y-4">
        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar por nome, CNPJ ou responsável..."
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
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {fornecedores.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total de Fornecedores
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-900 dark:text-green-100">
              {fornecedores.filter(f => f.status === 1).length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Ativos
            </div>
          </div>
        </div>

        {/* Lista de fornecedores */}
        <div className="space-y-3">
          {filteredFornecedores.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
            </div>
          ) : (
            filteredFornecedores.map((fornecedor) => (
              <MobileCard
                key={fornecedor.id}
                title={fornecedor.nome}
                subtitle={fornecedor.cnpj}
                badge={getStatusLabel(fornecedor.status)}
                badgeColor={getStatusColor(fornecedor.status)}
                onClick={() => {
                  window.location.href = `/fornecedores/editar/${fornecedor.id}`;
                }}
                onEdit={() => {
                  window.location.href = `/fornecedores/editar/${fornecedor.id}`;
                }}
                onDelete={async () => {
                  if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
                    try {
                      const response = await fetch(`/api/fornecedores/${fornecedor.id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                      });
                      if (response.ok) {
                        window.location.reload();
                      }
                    } catch (error) {
                      alert('Erro ao excluir fornecedor');
                    }
                  }
                }}
              >
                <div className="space-y-2">
                  {fornecedor.responsavel && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      {fornecedor.responsavel}
                    </div>
                  )}
                  
                  {fornecedor.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      {fornecedor.telefone}
                    </div>
                  )}
                  
                  {fornecedor.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{fornecedor.email}</span>
                    </div>
                  )}
                  
                  {(fornecedor.endereco || fornecedor.cidade) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">
                        {fornecedor.endereco}
                        {fornecedor.bairro && `, ${fornecedor.bairro}`}
                        {fornecedor.cidade && `, ${fornecedor.cidade}`}
                      </span>
                    </div>
                  )}
                  
                  {fornecedor.discriminacao && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      {fornecedor.discriminacao}
                    </div>
                  )}
                </div>
              </MobileCard>
            ))
          )}
        </div>

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
          {filteredFornecedores.length} de {fornecedores.length} fornecedores exibidos
        </div>
      </div>

      {/* FAB para criar novo fornecedor */}
      <MobileFab 
        onClick={() => {
          window.location.href = '/fornecedores/criar';
        }}
        label="Novo fornecedor"
      />
    </MobileLayout>
  );
}