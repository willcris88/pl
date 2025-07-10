import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobileFab } from "@/components/mobile/mobile-fab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Heart, Calendar, MapPin, User, Phone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Obito {
  id: number;
  nome: string;
  dataNascimento: string;
  dataObito: string;
  idade?: number;
  sexo: string;
  estadoCivil?: string;
  naturalidade?: string;
  endereco?: string;
  nomePai?: string;
  nomeMae?: string;
  natimorto: boolean;
  criadoEm: string;
}

export default function MobileObitos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSexo, setFilterSexo] = useState('all');
  const [filterNatimorto, setFilterNatimorto] = useState('all');

  const { data: obitos = [], isLoading } = useQuery<Obito[]>({
    queryKey: ['/api/obitos'],
    queryFn: async () => {
      const response = await fetch('/api/obitos', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar óbitos');
      return response.json();
    },
  });

  const filteredObitos = obitos.filter(obito => {
    const matchesSearch = (obito.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (obito.nomePai || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (obito.nomeMae || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSexo = filterSexo === 'all' || obito.sexo === filterSexo;
    const matchesNatimorto = filterNatimorto === 'all' || 
                            (filterNatimorto === 'sim' && obito.natimorto) ||
                            (filterNatimorto === 'nao' && !obito.natimorto);
    return matchesSearch && matchesSexo && matchesNatimorto;
  });

  const calculateAge = (nascimento: string, obito: string) => {
    if (!nascimento || !obito) return 'N/A';
    try {
      const birthDate = new Date(nascimento);
      const deathDate = new Date(obito);
      if (isNaN(birthDate.getTime()) || isNaN(deathDate.getTime())) return 'N/A';
      const age = deathDate.getFullYear() - birthDate.getFullYear();
      return age;
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title="Óbitos">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Óbitos">
      <div className="space-y-4">
        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar por nome ou pais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <Select value={filterSexo} onValueChange={setFilterSexo}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Feminino">Feminino</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterNatimorto} onValueChange={setFilterNatimorto}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="nao">Óbitos</SelectItem>
              <SelectItem value="sim">Natimortos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {obitos.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total de Óbitos
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              {obitos.filter(o => o.natimorto).length}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Natimortos
            </div>
          </div>
        </div>

        {/* Lista de óbitos */}
        <div className="space-y-3">
          {filteredObitos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhum óbito encontrado' : 'Nenhum óbito cadastrado'}
            </div>
          ) : (
            filteredObitos.map((obito) => (
              <MobileCard
                key={obito.id}
                title={obito.nome}
                subtitle={`${obito.sexo} • ${obito.estadoCivil || 'N/A'}`}
                badge={obito.natimorto ? 'Natimorto' : `${calculateAge(obito.dataNascimento, obito.dataObito)} anos`}
                badgeColor={obito.natimorto ? 'purple' : 'blue'}
                onClick={() => {
                  window.location.href = `/obitos/editar/${obito.id}`;
                }}
                onEdit={() => {
                  window.location.href = `/obitos/editar/${obito.id}`;
                }}
                onDelete={async () => {
                  if (confirm('Tem certeza que deseja excluir este óbito?')) {
                    try {
                      const response = await fetch(`/api/obitos/${obito.id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                      });
                      if (response.ok) {
                        window.location.reload();
                      }
                    } catch (error) {
                      alert('Erro ao excluir óbito');
                    }
                  }
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {obito.dataNascimento && !isNaN(new Date(obito.dataNascimento).getTime()) ? 
                        format(new Date(obito.dataNascimento), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'} - {' '}
                      {obito.dataObito && !isNaN(new Date(obito.dataObito).getTime()) ? 
                        format(new Date(obito.dataObito), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                    </span>
                  </div>
                  
                  {obito.naturalidade && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{obito.naturalidade}</span>
                    </div>
                  )}
                  
                  {obito.nomePai && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span className="truncate">Pai: {obito.nomePai}</span>
                    </div>
                  )}
                  
                  {obito.nomeMae && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span className="truncate">Mãe: {obito.nomeMae}</span>
                    </div>
                  )}
                  
                  {obito.endereco && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {obito.endereco}
                    </div>
                  )}
                </div>
              </MobileCard>
            ))
          )}
        </div>

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
          {filteredObitos.length} de {obitos.length} óbitos exibidos
        </div>
      </div>

      {/* FAB para criar novo óbito */}
      <MobileFab 
        onClick={() => window.location.href = '/obitos/criar'}
        label="Novo óbito"
      />
    </MobileLayout>
  );
}