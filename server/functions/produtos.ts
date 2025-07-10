/**
 * FUNÇÕES DE PRODUTOS
 * 
 * Este arquivo contém todas as funções relacionadas ao gerenciamento de produtos:
 * - Validações de produtos e preços
 * - Formatação de valores monetários
 * - Processamento de estoque
 * - Cálculos de custos e margens
 * 
 * COMO USAR:
 * import { validarProduto, formatarPreco } from '../functions/produtos';
 * 
 * MANUTENÇÃO:
 * - Para validações: adicionar função com prefixo 'validar'
 * - Para formatações: adicionar função com prefixo 'formatar'
 * - Para processamento: adicionar função com prefixo 'processar'
 * - Para cálculos: adicionar função com prefixo 'calcular'
 */

import { InserirProduto, Produto } from "@shared/schema";

/**
 * VALIDAÇÕES DE PRODUTOS
 */

export function validarProduto(dados: InserirProduto): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.push('Nome do produto é obrigatório e deve ter pelo menos 2 caracteres');
  }

  if (!dados.categoria || dados.categoria.trim().length < 2) {
    erros.push('Categoria do produto é obrigatória');
  }

  if (dados.preco !== undefined && dados.preco < 0) {
    erros.push('Preço do produto não pode ser negativo');
  }

  if (dados.estoque !== undefined && dados.estoque < 0) {
    erros.push('Estoque do produto não pode ser negativo');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarCodigoInterno(codigo: string): boolean {
  // Validar formato: letras, números e traços, mínimo 3 caracteres
  const regex = /^[A-Za-z0-9-]{3,20}$/;
  return regex.test(codigo);
}

export function validarEstoque(estoque: number, estoqueMinimo: number = 0): { valido: boolean; alerta?: string } {
  if (estoque < 0) {
    return { valido: false };
  }

  if (estoque <= estoqueMinimo) {
    return { 
      valido: true, 
      alerta: 'Estoque baixo - necessário reposição' 
    };
  }

  return { valido: true };
}

/**
 * FORMATAÇÕES DE PRODUTOS
 */

export function formatarPreco(preco: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(preco);
}

export function formatarCodigoProduto(codigo: string): string {
  return codigo.toUpperCase().trim();
}

export function formatarNomeProduto(nome: string): string {
  return nome
    .trim()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
}

/**
 * PROCESSAMENTO DE PRODUTOS
 */

export function processarDadosProduto(dados: InserirProduto): InserirProduto {
  return {
    ...dados,
    nome: formatarNomeProduto(dados.nome),
    categoria: dados.categoria.trim(),
    codigoInterno: dados.codigoInterno ? formatarCodigoProduto(dados.codigoInterno) : undefined,
    descricao: dados.descricao?.trim() || '',
    preco: dados.preco || 0,
    estoque: dados.estoque || 0
  };
}

export function processarStatusProduto(produto: Produto): {
  status: 'ativo' | 'inativo' | 'esgotado';
  cor: 'green' | 'gray' | 'red';
  mensagem: string;
} {
  if (!produto.ativo) {
    return {
      status: 'inativo',
      cor: 'gray',
      mensagem: 'Produto inativo'
    };
  }

  if (produto.estoque <= 0) {
    return {
      status: 'esgotado',
      cor: 'red',
      mensagem: 'Produto esgotado'
    };
  }

  return {
    status: 'ativo',
    cor: 'green',
    mensagem: 'Produto disponível'
  };
}

/**
 * CÁLCULOS DE PRODUTOS
 */

export function calcularValorTotalEstoque(produtos: Produto[]): number {
  return produtos.reduce((total, produto) => {
    return total + (produto.preco * produto.estoque);
  }, 0);
}

export function calcularMargemLucro(precoVenda: number, precoCusto: number): number {
  if (precoCusto === 0) return 0;
  return ((precoVenda - precoCusto) / precoCusto) * 100;
}

export function calcularPrecoComDesconto(preco: number, percentualDesconto: number): number {
  return preco * (1 - percentualDesconto / 100);
}

export function calcularQuantidadeMinima(vendaMedia: number, tempoReposicao: number = 7): number {
  // Calcular estoque de segurança baseado na venda média
  return Math.ceil(vendaMedia * tempoReposicao * 1.2); // 20% de margem de segurança
}

/**
 * UTILITÁRIOS DE PRODUTOS
 */

export function gerarCodigoInterno(categoria: string, sequencial: number): string {
  const prefixo = categoria.substring(0, 3).toUpperCase();
  const numero = sequencial.toString().padStart(4, '0');
  return `${prefixo}-${numero}`;
}

export function buscarProdutosPorCategoria(produtos: Produto[], categoria: string): Produto[] {
  return produtos.filter(produto => 
    produto.categoria.toLowerCase().includes(categoria.toLowerCase())
  );
}

export function buscarProdutosPorNome(produtos: Produto[], nome: string): Produto[] {
  return produtos.filter(produto => 
    produto.nome.toLowerCase().includes(nome.toLowerCase())
  );
}