import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileLayout } from '@/components/mobile/mobile-layout';
import { ArrowLeft, Save, Users } from 'lucide-react';

interface Prestadora {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  responsavel: string;
  ativo: boolean;
  observacoes: string;
}

export default function MobileEditarPrestadora() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [prestadora, setPrestadora] = useState<Prestadora>({
    id: 0,
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    responsavel: '',
    ativo: true,
    observacoes: ''
  });

  const isEditing = params.id !== 'novo';

  useEffect(() => {
    if (isEditing) {
      fetchPrestadora();
    }
  }, [params.id]);

  const fetchPrestadora = async () => {
    try {
      if (params.id === 'novo') return; // Não buscar se for criação
      
      const response = await fetch(`/api/prestadoras/${params.id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPrestadora(data);
      }
    } catch (error) {
      console.error('Erro ao buscar prestadora:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/prestadoras/${params.id}` : '/api/prestadoras';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prestadora),
        credentials: 'include'
      });

      if (response.ok) {
        setLocation('/prestadoras');
      } else {
        alert('Erro ao salvar prestadora');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar prestadora');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Prestadora, value: string | boolean) => {
    setPrestadora(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MobileLayout title={isEditing ? 'Editar Prestadora' : 'Nova Prestadora'}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/prestadoras')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold">
              {isEditing ? 'Editar Prestadora' : 'Nova Prestadora'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-blue-600 dark:text-blue-400">
              Informações Básicas
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={prestadora.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={prestadora.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ativo">Status</Label>
                <Select 
                  value={prestadora.ativo !== undefined ? (prestadora.ativo ? 'true' : 'false') : 'true'} 
                  onValueChange={(value) => handleChange('ativo', value === 'true')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativa</SelectItem>
                    <SelectItem value="false">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-green-600 dark:text-green-400">
              Contato
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={prestadora.responsavel}
                  onChange={(e) => handleChange('responsavel', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={prestadora.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={prestadora.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Endereço
            </h2>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={prestadora.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-orange-600 dark:text-orange-400">
              Observações
            </h2>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={prestadora.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/prestadoras')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
}