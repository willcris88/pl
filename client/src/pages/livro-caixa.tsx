import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Filter, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/responsive-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';

// Tipos TypeScript
interface LivroCaixa {
  id: number;
  data_movimento: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  categoria?: string;
  metodo_pagamento?: string;
  observacoes?: string;
  usuario_id?: number;
  ordem_servico_id?: number;
  created_at: string;
}

// Schema de validação com formato brasileiro
const livroCaixaSchema = z.object({
  data_movimento: z.string().min(1, 'Data é obrigatória'),
  tipo: z.enum(['entrada', 'saida']),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.string().min(1, 'Valor é obrigatório'),
  categoria: z.string().optional(),
  metodo_pagamento: z.string().optional(),
  observacoes: z.string().optional(),
});

type LivroCaixaForm = z.infer<typeof livroCaixaSchema>;

// Função para formatar valor em Real brasileiro
const formatarValor = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(valor);
};

// Função para converter string de valor para número
const converterValor = (valorString: string): number => {
  return parseFloat(valorString.replace(/[^\d,]/g, '').replace(',', '.'));
};

export default function LivroCaixa() {
  const queryClient = useQueryClient();
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState<LivroCaixa | null>(null);

  // Query para buscar dados
  const { data: lancamentos = [], isLoading } = useQuery({
    queryKey: ['/api/livro-caixa'],
  });

  // Mutation para criar
  const criarMutation = useMutation({
    mutationFn: async (dados: LivroCaixaForm) => {
      const payload = {
        ...dados,
        valor: converterValor(dados.valor),
      };
      return apiRequest('/api/livro-caixa', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/livro-caixa'] });
      setModalAberto(false);
      form.reset();
    },
  });

  // Mutation para atualizar
  const atualizarMutation = useMutation({
    mutationFn: async (dados: LivroCaixaForm & { id: number }) => {
      const payload = {
        ...dados,
        valor: converterValor(dados.valor),
      };
      return apiRequest(`/api/livro-caixa/${dados.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/livro-caixa'] });
      setModalAberto(false);
      setItemEditando(null);
      form.reset();
    },
  });

  // Mutation para excluir
  const excluirMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/livro-caixa/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/livro-caixa'] });
    },
  });

  // Form
  const form = useForm<LivroCaixaForm>({
    resolver: zodResolver(livroCaixaSchema),
    defaultValues: {
      data_movimento: format(new Date(), 'yyyy-MM-dd'),
      tipo: 'entrada',
      descricao: '',
      valor: '',
      categoria: '',
      metodo_pagamento: '',
      observacoes: '',
    },
  });

  // Efeito para popular form quando editando
  useEffect(() => {
    if (itemEditando) {
      form.reset({
        data_movimento: itemEditando.data_movimento,
        tipo: itemEditando.tipo,
        descricao: itemEditando.descricao,
        valor: itemEditando.valor.toString().replace('.', ','),
        categoria: itemEditando.categoria || '',
        metodo_pagamento: itemEditando.metodo_pagamento || '',
        observacoes: itemEditando.observacoes || '',
      });
    }
  }, [itemEditando, form]);

  // Função para submeter form
  const onSubmit = (dados: LivroCaixaForm) => {
    if (itemEditando) {
      atualizarMutation.mutate({ ...dados, id: itemEditando.id });
    } else {
      criarMutation.mutate(dados);
    }
  };

  // Filtrar dados
  const lancamentosFiltrados = lancamentos.filter((item: LivroCaixa) => {
    const matchTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;
    const matchCategoria = filtroCategoria === 'todas' || item.categoria === filtroCategoria;
    const matchBusca = busca === '' || 
      item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (item.categoria && item.categoria.toLowerCase().includes(busca.toLowerCase()));
    
    return matchTipo && matchCategoria && matchBusca;
  });

  // Calcular totais
  const totalEntradas = lancamentosFiltrados
    .filter((item: LivroCaixa) => item.tipo === 'entrada')
    .reduce((acc, item) => acc + item.valor, 0);

  const totalSaidas = lancamentosFiltrados
    .filter((item: LivroCaixa) => item.tipo === 'saida')
    .reduce((acc, item) => acc + item.valor, 0);

  const saldoAtual = totalEntradas - totalSaidas;

  // Categorias únicas
  const categoriasUnicas = Array.from(
    new Set(lancamentos.map((item: LivroCaixa) => item.categoria).filter(Boolean))
  );

  // Abrir modal para novo item
  const abrirModalNovo = () => {
    setItemEditando(null);
    form.reset({
      data_movimento: format(new Date(), 'yyyy-MM-dd'),
      tipo: 'entrada',
      descricao: '',
      valor: '',
      categoria: '',
      metodo_pagamento: '',
      observacoes: '',
    });
    setModalAberto(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (item: LivroCaixa) => {
    setItemEditando(item);
    setModalAberto(true);
  };

  return (
    <ResponsiveLayout>
      <div className="p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Livro Caixa
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Controle financeiro de entradas e saídas
            </p>
          </div>
          <Button onClick={abrirModalNovo} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Lançamento
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatarValor(totalEntradas)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatarValor(totalSaidas)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatarValor(saldoAtual)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lançamentos</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {lancamentosFiltrados.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categoriasUnicas.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setBusca('');
                  setFiltroTipo('todos');
                  setFiltroCategoria('todas');
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lancamentosFiltrados.map((item: LivroCaixa) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(new Date(item.data_movimento), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.tipo === 'entrada' ? 'default' : 'destructive'}
                            className={item.tipo === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {item.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.descricao}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.categoria || 'Sem categoria'}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-medium ${item.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                          {formatarValor(item.valor)}
                        </TableCell>
                        <TableCell>
                          {item.metodo_pagamento || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirModalEditar(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => excluirMutation.mutate(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {lancamentosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Nenhum lançamento encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {itemEditando ? 'Editar Lançamento' : 'Novo Lançamento'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="data_movimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data do Movimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="entrada">Entrada</SelectItem>
                            <SelectItem value="saida">Saída</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Descrição do lançamento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="0,00" 
                            {...field}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length > 2) {
                                value = value.replace(/(\d)(\d{2})$/, '$1,$2');
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <FormControl>
                          <Input placeholder="Categoria" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="metodo_pagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                          <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                          <SelectItem value="Transferência">Transferência</SelectItem>
                          <SelectItem value="Boleto Bancário">Boleto Bancário</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações adicionais..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setModalAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={criarMutation.isPending || atualizarMutation.isPending}
                  >
                    {criarMutation.isPending || atualizarMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveLayout>
  );
}