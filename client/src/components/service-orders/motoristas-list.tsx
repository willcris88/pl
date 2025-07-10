import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, FileText, MapPin } from "lucide-react";

interface MotoristasListProps {
  ordemServicoId: number;
}

interface MotoristaVinculado {
  id: number;
  ordemServicoId: number;
  motoristaId: number;
  veiculoProdutoId: number | null;
  horaSaida: string | null;
  horaChegada: string | null;
  status: string;
  observacoes: string | null;
  criadoEm: string;
  motoristaNome: string;
  motoristaSobrenome: string;
  motoristaEmail: string | null;
  motoristaTelefone: string | null;
  motoristaCnh: string | null;
  veiculoNome: string | null;
  veiculoCategoria: string | null;
}

export function MotoristasList({ ordemServicoId }: MotoristasListProps) {
  const { data: motoristasVinculados = [], isLoading } = useQuery({
    queryKey: ['/api/motoristas-ordem-servico', ordemServicoId],
    queryFn: async () => {
      const response = await fetch(`/api/motoristas-ordem-servico?ordemServicoId=${ordemServicoId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Erro ao buscar motoristas vinculados");
      return response.json();
    },
    enabled: !!ordemServicoId,
  });

  if (motoristasVinculados.length === 0 && !isLoading) {
    return null; // Não mostra nada se não há motoristas vinculados
  }

  const formatarDataHora = (data: string | null) => {
    if (!data) return "Não definido";
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'concluido':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'agendado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="mt-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          <User className="h-5 w-5 text-blue-600" />
          Motoristas Vinculados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-slate-600 dark:text-slate-400">Carregando motoristas...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {motoristasVinculados.map((vinculo: MotoristaVinculado) => (
              <div 
                key={vinculo.id} 
                className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      {vinculo.motoristaNome} {vinculo.motoristaSobrenome}
                    </span>
                  </div>
                  <Badge className={getStatusColor(vinculo.status)}>
                    {vinculo.status === 'em_andamento' && 'Em Andamento'}
                    {vinculo.status === 'concluido' && 'Concluído'}
                    {vinculo.status === 'agendado' && 'Agendado'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {/* Informações do Motorista */}
                  <div className="space-y-1">
                    {vinculo.motoristaTelefone && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span>📱</span>
                        <span>{vinculo.motoristaTelefone}</span>
                      </div>
                    )}
                    {vinculo.motoristaCnh && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span>🆔</span>
                        <span>CNH: {vinculo.motoristaCnh}</span>
                      </div>
                    )}
                    {vinculo.veiculoNome && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span>{vinculo.veiculoNome}</span>
                      </div>
                    )}
                  </div>

                  {/* Horários */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>Saída: {formatarDataHora(vinculo.horaSaida)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>Chegada: {formatarDataHora(vinculo.horaChegada)}</span>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {vinculo.observacoes && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <FileText className="h-3 w-3 mt-0.5" />
                      <span>{vinculo.observacoes}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}