import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileLayout } from '@/components/mobile/mobile-layout';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { useElegantDialogs } from '@/hooks/use-elegant-dialogs';

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  codigoInterno: string;
  preco: number;
  estoque: number;
  fornecedorId: number;
  descricao: string;
}

interface Fornecedor {
  id: number;
  nome: string;
}

export default function MobileEditarProduto() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produto, setProduto] = useState<Produto>({
    id: 0,
    nome: '',
    categoria: '',
    codigoInterno: '',
    preco: 0,
    estoque: 0,
    fornecedorId: 0,
    descricao: ''
  });

  const isEditing = params.id !== 'novo';

  useEffect(() => {
    fetchFornecedores();
    if (isEditing) {
      fetchProduto();
    }
  }, [params.id]);

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFornecedores(data);
      }
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

  const fetchProduto = async () => {
    try {
      if (params.id === 'novo') return; // Não buscar se for criação
      
      const response = await fetch(`/api/produtos/${params.id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProduto(data);
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/produtos/${params.id}` : '/api/produtos';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(produto),
        credentials: 'include'
      });

      if (response.ok) {
        setLocation('/produtos');
      } else {
        alert('Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Produto, value: string | number) => {
    setProduto(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MobileLayout title={isEditing ? 'Editar Produto' : 'Novo Produto'}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/produtos')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold">
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
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
                  value={produto.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select 
                  value={produto.categoria} 
                  onValueChange={(value) => handleChange('categoria', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urnas">Urnas</SelectItem>
                    <SelectItem value="Flores">Flores</SelectItem>
                    <SelectItem value="Velas">Velas</SelectItem>
                    <SelectItem value="Ornamentos">Ornamentos</SelectItem>
                    <SelectItem value="Paramentos">Paramentos</SelectItem>
                    <SelectItem value="Diversos">Diversos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="codigoInterno">Código Interno</Label>
                <Input
                  id="codigoInterno"
                  value={produto.codigoInterno}
                  onChange={(e) => handleChange('codigoInterno', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Preço e Estoque */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-green-600 dark:text-green-400">
              Preço e Estoque
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={produto.preco}
                  onChange={(e) => handleChange('preco', parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="estoque">Estoque</Label>
                <Input
                  id="estoque"
                  type="number"
                  value={produto.estoque}
                  onChange={(e) => handleChange('estoque', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Fornecedor */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Fornecedor
            </h2>
            <div>
              <Label htmlFor="fornecedorId">Fornecedor</Label>
              <Select 
                value={produto.fornecedorId ? produto.fornecedorId.toString() : ''} 
                onValueChange={(value) => handleChange('fornecedorId', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((fornecedor) => (
                    <SelectItem key={fornecedor.id} value={fornecedor.id.toString()}>
                      {fornecedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-orange-600 dark:text-orange-400">
              Descrição
            </h2>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={produto.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
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
              onClick={() => setLocation('/produtos')}
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