import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobileFab } from "@/components/mobile/mobile-fab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Package, DollarSign, Building, BarChart3 } from "lucide-react";

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  codigoInterno?: string;
  descricao?: string;
  fornecedorId?: number;
  fornecedor?: {
    id: number;
    nome: string;
  };
  criadoEm: string;
}

export default function MobileProdutos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [filterEstoque, setFilterEstoque] = useState('all');

  const { data: produtos = [], isLoading } = useQuery<Produto[]>({
    queryKey: ['/api/produtos'],
    queryFn: async () => {
      const response = await fetch('/api/produtos', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      return response.json();
    },
  });

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = (produto.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (produto.categoria || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (produto.codigoInterno || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = filterCategoria === 'all' || produto.categoria === filterCategoria;
    const matchesEstoque = filterEstoque === 'all' || 
                          (filterEstoque === 'low' && (produto.estoque || 0) < 10) ||
                          (filterEstoque === 'medium' && (produto.estoque || 0) >= 10 && (produto.estoque || 0) < 50) ||
                          (filterEstoque === 'high' && (produto.estoque || 0) >= 50);
    return matchesSearch && matchesCategoria && matchesEstoque;
  });

  const categorias = [...new Set(produtos.map(p => p.categoria || 'Sem categoria'))];

  const getEstoqueColor = (estoque: number): "green" | "yellow" | "red" => {
    if (estoque >= 50) return 'green';
    if (estoque >= 10) return 'yellow';
    return 'red';
  };

  const getEstoqueLabel = (estoque: number) => {
    if (estoque >= 50) return 'Alto';
    if (estoque >= 10) return 'Médio';
    return 'Baixo';
  };

  if (isLoading) {
    return (
      <MobileLayout title="Produtos">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Produtos">
      <div className="space-y-4">
        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar por nome, categoria ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categorias.map(categoria => (
                <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterEstoque} onValueChange={setFilterEstoque}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Estoque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="low">Baixo</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {produtos.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total de Produtos
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              {produtos.filter(p => (p.estoque || 0) < 10).length}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Estoque Baixo
            </div>
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="space-y-3">
          {filteredProdutos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </div>
          ) : (
            filteredProdutos.map((produto) => (
              <MobileCard
                key={produto.id}
                title={produto.nome}
                subtitle={`${produto.categoria} ${produto.codigoInterno ? `• ${produto.codigoInterno}` : ''}`}
                badge={`${produto.estoque || 0} un.`}
                badgeColor={getEstoqueColor(produto.estoque || 0)}
                onClick={() => {
                  window.location.href = `/produtos/editar/${produto.id}`;
                }}
                onEdit={() => {
                  window.location.href = `/produtos/editar/${produto.id}`;
                }}
                onDelete={async () => {
                  if (confirm('Tem certeza que deseja excluir este produto?')) {
                    try {
                      const response = await fetch(`/api/produtos/${produto.id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                      });
                      if (response.ok) {
                        window.location.reload();
                      }
                    } catch (error) {
                      alert('Erro ao excluir produto');
                    }
                  }
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">
                        R$ {(produto.preco || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getEstoqueLabel(produto.estoque || 0)}
                      </span>
                    </div>
                  </div>
                  
                  {produto.fornecedor && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Building className="h-4 w-4" />
                      <span className="truncate">{produto.fornecedor.nome}</span>
                    </div>
                  )}
                  
                  {produto.descricao && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      {produto.descricao}
                    </div>
                  )}
                </div>
              </MobileCard>
            ))
          )}
        </div>

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
          {filteredProdutos.length} de {produtos.length} produtos exibidos
        </div>
      </div>

      {/* FAB para criar novo produto */}
      <MobileFab 
        onClick={() => {
          window.location.href = '/produtos/criar';
        }}
        label="Novo produto"
      />
    </MobileLayout>
  );
}