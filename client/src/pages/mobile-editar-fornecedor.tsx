import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileLayout } from '@/components/mobile/mobile-layout';
import { ArrowLeft, Save, Building } from 'lucide-react';
import { useElegantDialogs } from '@/hooks/use-elegant-dialogs';

interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  responsavel: string;
  celular: string;
  status: number;
  observacoes: string;
}

export default function MobileEditarFornecedor() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [fornecedor, setFornecedor] = useState<Fornecedor>({
    id: 0,
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    responsavel: '',
    celular: '',
    status: 1,
    observacoes: ''
  });

  const isEditing = params.id !== 'novo';

  useEffect(() => {
    if (isEditing) {
      fetchFornecedor();
    }
  }, [params.id]);

  const fetchFornecedor = async () => {
    try {
      if (params.id === 'novo') return; // Não buscar se for criação
      
      const response = await fetch(`/api/fornecedores/${params.id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFornecedor(data);
      }
    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/fornecedores/${params.id}` : '/api/fornecedores';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fornecedor),
        credentials: 'include'
      });

      if (response.ok) {
        setLocation('/fornecedores');
      } else {
        alert('Erro ao salvar fornecedor');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar fornecedor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Fornecedor, value: string | number) => {
    setFornecedor(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MobileLayout title={isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/fornecedores')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold">
              {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
                  value={fornecedor.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={fornecedor.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={fornecedor.status ? fornecedor.status.toString() : '1'} 
                  onValueChange={(value) => handleChange('status', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ativo</SelectItem>
                    <SelectItem value="0">Inativo</SelectItem>
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
                  value={fornecedor.responsavel}
                  onChange={(e) => handleChange('responsavel', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={fornecedor.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={fornecedor.celular}
                  onChange={(e) => handleChange('celular', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={fornecedor.email}
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={fornecedor.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={fornecedor.bairro}
                  onChange={(e) => handleChange('bairro', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={fornecedor.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={fornecedor.estado}
                    onChange={(e) => handleChange('estado', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={fornecedor.cep}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  className="mt-1"
                />
              </div>
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
                value={fornecedor.observacoes}
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
              onClick={() => setLocation('/fornecedores')}
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