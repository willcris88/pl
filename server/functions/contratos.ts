/**
 * FUNÇÕES DE CONTRATOS
 * 
 * Este arquivo contém todas as funções relacionadas ao gerenciamento de contratos:
 * - Validações de contratos e valores
 * - Formatação de números e datas
 * - Processamento de status e prazos
 * - Cálculos financeiros e jurídicos
 * 
 * COMO USAR:
 * import { validarContrato, calcularValorTotal } from '../functions/contratos';
 * 
 * MANUTENÇÃO:
 * - Para validações: adicionar função com prefixo 'validar'
 * - Para formatações: adicionar função com prefixo 'formatar'
 * - Para processamento: adicionar função com prefixo 'processar'
 * - Para cálculos: adicionar função com prefixo 'calcular'
 */

import { InserirContrato, Contrato } from "@shared/schema";

/**
 * TIPOS E CONSTANTES
 */

export const STATUS_CONTRATO = [
  'RASCUNHO',
  'EM_ANALISE',
  'APROVADO',
  'ASSINADO',
  'EM_EXECUCAO',
  'CONCLUIDO',
  'CANCELADO',
  'SUSPENSO'
] as const;

export const TIPOS_CONTRATO = [
  'SERVICO_FUNERAL',
  'FORNECIMENTO',
  'PRESTACAO_SERVICO',
  'LOCACAO',
  'MANUTENCAO',
  'OUTROS'
] as const;

/**
 * VALIDAÇÕES DE CONTRATOS
 */

export function validarContrato(dados: InserirContrato): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!dados.numero || dados.numero.trim().length < 3) {
    erros.push('Número do contrato é obrigatório');
  }

  if (!dados.valor || dados.valor <= 0) {
    erros.push('Valor do contrato deve ser maior que zero');
  }

  if (!dados.ordemServicoId || dados.ordemServicoId <= 0) {
    erros.push('ID da ordem de serviço é obrigatório');
  }

  if (dados.dataInicio && dados.dataFim) {
    const inicio = new Date(dados.dataInicio);
    const fim = new Date(dados.dataFim);
    
    if (fim <= inicio) {
      erros.push('Data final deve ser posterior à data inicial');
    }
  }

  if (dados.valorEntrada && dados.valorEntrada > dados.valor) {
    erros.push('Valor de entrada não pode ser maior que o valor total');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarNumeroContrato(numero: string): boolean {
  // Formato: letras, números e traços, mínimo 3 caracteres
  const regex = /^[A-Za-z0-9-]{3,20}$/;
  return regex.test(numero);
}

export function validarStatusContrato(status: string): boolean {
  return STATUS_CONTRATO.includes(status as any);
}

/**
 * FORMATAÇÕES DE CONTRATOS
 */

export function formatarNumeroContrato(numero: string): string {
  return numero.toUpperCase().trim();
}

export function formatarValorContrato(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

export function formatarStatusContrato(status: string): {
  label: string;
  cor: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
} {
  switch (status.toUpperCase()) {
    case 'RASCUNHO':
      return { label: 'Rascunho', cor: 'gray' };
    case 'EM_ANALISE':
      return { label: 'Em Análise', cor: 'blue' };
    case 'APROVADO':
      return { label: 'Aprovado', cor: 'green' };
    case 'ASSINADO':
      return { label: 'Assinado', cor: 'green' };
    case 'EM_EXECUCAO':
      return { label: 'Em Execução', cor: 'blue' };
    case 'CONCLUIDO':
      return { label: 'Concluído', cor: 'green' };
    case 'CANCELADO':
      return { label: 'Cancelado', cor: 'red' };
    case 'SUSPENSO':
      return { label: 'Suspenso', cor: 'yellow' };
    default:
      return { label: 'Rascunho', cor: 'gray' };
  }
}

export function formatarDataContrato(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(data);
}

/**
 * PROCESSAMENTO DE CONTRATOS
 */

export function processarDadosContrato(dados: InserirContrato): InserirContrato {
  return {
    ...dados,
    numero: formatarNumeroContrato(dados.numero),
    status: dados.status || 'RASCUNHO',
    tipo: dados.tipo || 'SERVICO_FUNERAL',
    observacoes: dados.observacoes?.trim() || '',
    clausulasEspeciais: dados.clausulasEspeciais?.trim() || ''
  };
}

export function processarStatusAutomatico(contrato: Contrato): string {
  const hoje = new Date();
  
  // Se tem data de fim e passou, deve ser concluído ou vencido
  if (contrato.dataFim) {
    const fimDate = new Date(contrato.dataFim);
    if (fimDate < hoje && contrato.status === 'EM_EXECUCAO') {
      return 'CONCLUIDO';
    }
  }
  
  // Se está assinado e tem data de início, deve estar em execução
  if (contrato.status === 'ASSINADO' && contrato.dataInicio) {
    const inicioDate = new Date(contrato.dataInicio);
    if (inicioDate <= hoje) {
      return 'EM_EXECUCAO';
    }
  }
  
  return contrato.status;
}

/**
 * CÁLCULOS DE CONTRATOS
 */

export function calcularValorRestante(contrato: Contrato): number {
  const valorPago = contrato.valorEntrada || 0;
  return contrato.valor - valorPago;
}

export function calcularPercentualPago(contrato: Contrato): number {
  if (contrato.valor === 0) return 0;
  const valorPago = contrato.valorEntrada || 0;
  return (valorPago / contrato.valor) * 100;
}

export function calcularDiasRestantes(contrato: Contrato): number | null {
  if (!contrato.dataFim) return null;
  
  const hoje = new Date();
  const fimDate = new Date(contrato.dataFim);
  const diffMs = fimDate.getTime() - hoje.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function calcularDuracaoContrato(contrato: Contrato): number | null {
  if (!contrato.dataInicio || !contrato.dataFim) return null;
  
  const inicio = new Date(contrato.dataInicio);
  const fim = new Date(contrato.dataFim);
  const diffMs = fim.getTime() - inicio.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function calcularValorMedioPorDia(contrato: Contrato): number | null {
  const duracao = calcularDuracaoContrato(contrato);
  if (!duracao || duracao === 0) return null;
  
  return contrato.valor / duracao;
}

export function calcularMultaPorAtraso(
  contrato: Contrato, 
  diasAtraso: number, 
  percentualMulta: number = 2
): number {
  return contrato.valor * (percentualMulta / 100) * diasAtraso;
}

/**
 * UTILITÁRIOS DE CONTRATOS
 */

export function buscarContratosPorStatus(contratos: Contrato[], status: string): Contrato[] {
  return contratos.filter(contrato => 
    contrato.status.toLowerCase() === status.toLowerCase()
  );
}

export function buscarContratosVencendo(contratos: Contrato[], dias: number = 30): Contrato[] {
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);
  
  return contratos.filter(contrato => {
    if (!contrato.dataFim || contrato.status === 'CONCLUIDO' || contrato.status === 'CANCELADO') {
      return false;
    }
    
    const fimDate = new Date(contrato.dataFim);
    return fimDate <= limite && fimDate >= new Date();
  });
}

export function buscarContratosAtivos(contratos: Contrato[]): Contrato[] {
  return contratos.filter(contrato => 
    ['EM_EXECUCAO', 'ASSINADO', 'APROVADO'].includes(contrato.status)
  );
}

export function ordenarContratosPorValor(contratos: Contrato[], crescente: boolean = false): Contrato[] {
  return contratos.sort((a, b) => {
    return crescente ? a.valor - b.valor : b.valor - a.valor;
  });
}

export function gerarNumeroContrato(prefixo: string = 'CNT', sequencial: number): string {
  const ano = new Date().getFullYear();
  const numero = sequencial.toString().padStart(4, '0');
  return `${prefixo}-${ano}-${numero}`;
}

export function gerarRelatorioContratos(contratos: Contrato[]) {
  const ativos = buscarContratosAtivos(contratos);
  const vencendo = buscarContratosVencendo(contratos);
  const valorTotal = contratos.reduce((acc, contrato) => acc + contrato.valor, 0);
  const valorPago = contratos.reduce((acc, contrato) => acc + (contrato.valorEntrada || 0), 0);
  
  return {
    total: contratos.length,
    ativos: ativos.length,
    concluidos: contratos.filter(c => c.status === 'CONCLUIDO').length,
    cancelados: contratos.filter(c => c.status === 'CANCELADO').length,
    vencendoEm30Dias: vencendo.length,
    valorTotalContratos: valorTotal,
    valorTotalPago: valorPago,
    valorTotalRestante: valorTotal - valorPago,
    percentualPago: valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0
  };
}