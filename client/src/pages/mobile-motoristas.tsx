import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobileFab } from "@/components/mobile/mobile-fab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Truck, Phone, Mail, User, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Motorista {
  id: number;
  nome: string;
  email: string;
  cnh: string;
  telefone?: string;
  criadoEm: string;
}

interface MotoristaOrdemServico {
  id: number;
  motoristaId: number;
  ordemServicoId: number;
  veiculo: string;
  status: string;
  dataVinculacao: string;
  motorista: Motorista;
  ordemServico: {
    id: number;
    nomeDefunto: string;
    servico: string;
    dataServico: string;
  };
}

export default function MobileMotoristas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'motoristas' | 'vinculos'>('motoristas');

  const { data: motoristas = [], isLoading: loadingMotoristas } = useQuery<Motorista[]>({
    queryKey: ['/api/motoristas'],
    queryFn: async () => {
      const response = await fetch('/api/motoristas', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar motoristas');
      return response.json();
    },
  });

  const { data: vinculos = [], isLoading: loadingVinculos } = useQuery<MotoristaOrdemServico[]>({
    queryKey: ['/api/motoristas-ordem-servico'],
    queryFn: async () => {
      const response = await fetch('/api/motoristas-ordem-servico', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar vínculos');
      return response.json();
    },
  });

  const filteredMotoristas = motoristas.filter(motorista => {
    const matchesSearch = motorista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         motorista.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         motorista.cnh.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredVinculos = vinculos.filter(vinculo => {
    const matchesSearch = vinculo.motorista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vinculo.ordemServico.nomeDefunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vinculo.veiculo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vinculo.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string): "green" | "yellow" | "red" | "blue" => {
    switch (status) {
      case 'concluido': return 'green';
      case 'em_andamento': return 'yellow';
      case 'pendente': return 'red';
      default: return 'blue';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluido': return 'Concluído';
      case 'em_andamento': return 'Em Andamento';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido': return <CheckCircle className="h-4 w-4" />;
      case 'em_andamento': return <Clock className="h-4 w-4" />;
      case 'pendente': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loadingMotoristas || loadingVinculos) {
    return (
      <MobileLayout title="Motoristas">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Motoristas">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('motoristas')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'motoristas'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Motoristas
          </button>
          <button
            onClick={() => setActiveTab('vinculos')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'vinculos'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Vínculos
          </button>
        </div>

        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={activeTab === 'motoristas' ? "Pesquisar motorista..." : "Pesquisar vínculos..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros para vínculos */}
        {activeTab === 'vinculos' && (
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
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          {activeTab === 'motoristas' ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {motoristas.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Total de Motoristas
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                  {vinculos.filter(v => v.status === 'concluido').length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Serviços Concluídos
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <div className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                  {vinculos.filter(v => v.status === 'em_andamento').length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  Em Andamento
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="text-lg font-semibold text-red-900 dark:text-red-100">
                  {vinculos.filter(v => v.status === 'pendente').length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Pendentes
                </div>
              </div>
            </>
          )}
        </div>

        {/* Lista de motoristas */}
        {activeTab === 'motoristas' && (
          <div className="space-y-3">
            {filteredMotoristas.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Nenhum motorista encontrado' : 'Nenhum motorista cadastrado'}
              </div>
            ) : (
              filteredMotoristas.map((motorista) => (
                <MobileCard
                  key={motorista.id}
                  title={motorista.nome}
                  subtitle={`CNH: ${motorista.cnh}`}
                  onClick={() => {
                    // Implementar navegação para detalhes do motorista
                    console.log('Visualizar motorista:', motorista.id);
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{motorista.email}</span>
                    </div>
                    
                    {motorista.telefone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        {motorista.telefone}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Cadastrado em {format(new Date(motorista.criadoEm), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </div>
                </MobileCard>
              ))
            )}
          </div>
        )}

        {/* Lista de vínculos */}
        {activeTab === 'vinculos' && (
          <div className="space-y-3">
            {filteredVinculos.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Nenhum vínculo encontrado' : 'Nenhum vínculo cadastrado'}
              </div>
            ) : (
              filteredVinculos.map((vinculo) => (
                <MobileCard
                  key={vinculo.id}
                  title={vinculo.motorista.nome}
                  subtitle={`${vinculo.ordemServico.nomeDefunto} • ${vinculo.veiculo}`}
                  badge={getStatusLabel(vinculo.status)}
                  badgeColor={getStatusColor(vinculo.status)}
                  onClick={() => {
                    // Implementar navegação para detalhes do vínculo
                    console.log('Visualizar vínculo:', vinculo.id);
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Truck className="h-4 w-4" />
                      <span>{vinculo.veiculo}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      Serviço: {format(new Date(vinculo.ordemServico.dataServico), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      {getStatusIcon(vinculo.status)}
                      <span className="truncate">{vinculo.ordemServico.servico}</span>
                    </div>
                  </div>
                </MobileCard>
              ))
            )}
          </div>
        )}

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
          {activeTab === 'motoristas' 
            ? `${filteredMotoristas.length} de ${motoristas.length} motoristas exibidos`
            : `${filteredVinculos.length} de ${vinculos.length} vínculos exibidos`
          }
        </div>
      </div>

      {/* FAB para criar novo motorista */}
      <MobileFab 
        onClick={() => {
          // Implementar modal ou navegação para criar motorista
          console.log('Criar novo motorista');
        }}
        label="Novo motorista"
      />
    </MobileLayout>
  );
}