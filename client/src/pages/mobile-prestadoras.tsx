import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobileFab } from "@/components/mobile/mobile-fab";
import { Input } from "@/components/ui/input";
import { Search, Building, Phone, Mail, MapPin, User } from "lucide-react";

interface Prestadora {
  id: number;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  responsavel?: string;
  ativo: boolean;
  criadoEm: string;
}

export default function MobilePrestadoras() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: prestadoras = [], isLoading } = useQuery<Prestadora[]>({
    queryKey: ['/api/prestadoras'],
    queryFn: async () => {
      const response = await fetch('/api/prestadoras', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar prestadoras');
      return response.json();
    },
  });

  const filteredPrestadoras = prestadoras.filter(prestadora =>
    prestadora.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestadora.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestadora.responsavel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <MobileLayout title="Prestadoras">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Prestadoras">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar prestadoras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {prestadoras.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total de Prestadoras
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-900 dark:text-green-100">
              {prestadoras.filter(p => p.ativo).length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Ativas
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredPrestadoras.map((prestadora) => (
            <MobileCard
              key={prestadora.id}
              title={prestadora.nome}
              subtitle={prestadora.cnpj}
              badge={prestadora.ativo ? 'Ativa' : 'Inativa'}
              badgeColor={prestadora.ativo ? 'green' : 'red'}
              onClick={() => {
                window.location.href = `/prestadoras/editar/${prestadora.id}`;
              }}
              onEdit={() => {
                window.location.href = `/prestadoras/editar/${prestadora.id}`;
              }}
              onDelete={async () => {
                if (confirm('Tem certeza que deseja excluir esta prestadora?')) {
                  try {
                    const response = await fetch(`/api/prestadoras/${prestadora.id}`, {
                      method: 'DELETE',
                      credentials: 'include'
                    });
                    if (response.ok) {
                      window.location.reload();
                    }
                  } catch (error) {
                    alert('Erro ao excluir prestadora');
                  }
                }
              }}
            >
              <div className="space-y-2">
                {prestadora.responsavel && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    {prestadora.responsavel}
                  </div>
                )}
                {prestadora.telefone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    {prestadora.telefone}
                  </div>
                )}
                {prestadora.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    {prestadora.email}
                  </div>
                )}
                {prestadora.endereco && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {prestadora.endereco}
                  </div>
                )}
              </div>
            </MobileCard>
          ))}
        </div>
      </div>

      <MobileFab onClick={() => window.location.href = '/prestadoras/criar'} />
    </MobileLayout>
  );
}