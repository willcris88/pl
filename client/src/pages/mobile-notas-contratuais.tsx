import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobileFab } from "@/components/mobile/mobile-fab";
import { Input } from "@/components/ui/input";
import { Search, FileText, Calendar, DollarSign, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotaContratual {
  id: number;
  numero: string;
  cliente: string;
  servico: string;
  valor: number;
  dataEmissao: string;
  status: string;
  observacoes?: string;
  criadoEm: string;
}

export default function MobileNotasContratuais() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: notas = [], isLoading } = useQuery<NotaContratual[]>({
    queryKey: ['/api/notas-contratuais'],
    queryFn: async () => {
      const response = await fetch('/api/notas-contratuais', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar notas');
      return response.json();
    },
  });

  const filteredNotas = notas.filter(nota =>
    nota.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.servico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'green';
      case 'pendente': return 'yellow';
      case 'cancelado': return 'red';
      default: return 'blue';
    }
  };

  if (isLoading) {
    return (
      <MobileLayout title="Notas Contratuais">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Notas Contratuais">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {notas.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total de Notas
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-900 dark:text-green-100">
              R$ {notas.reduce((acc, nota) => acc + nota.valor, 0).toFixed(2)}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Valor Total
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotas.map((nota) => (
            <MobileCard
              key={nota.id}
              title={`Nota ${nota.numero}`}
              subtitle={nota.cliente}
              badge={nota.status}
              badgeColor={getStatusColor(nota.status)}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FileText className="h-4 w-4" />
                  {nota.servico}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="h-4 w-4" />
                  R$ {nota.valor.toFixed(2)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(nota.dataEmissao), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
                {nota.observacoes && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {nota.observacoes}
                  </div>
                )}
              </div>
            </MobileCard>
          ))}
        </div>
      </div>

      <MobileFab onClick={() => console.log('Criar nota')} />
    </MobileLayout>
  );
}