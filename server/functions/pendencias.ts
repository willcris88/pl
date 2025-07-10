/**
 * FUNÇÕES DE PENDÊNCIAS
 * 
 * Este arquivo contém todas as funções relacionadas ao gerenciamento de pendências:
 * - Validações de pendências e prazos
 * - Formatação de tipos e status
 * - Processamento de prioridades
 * - Cálculos de tempo e alertas
 * 
 * COMO USAR:
 * import { validarPendencia, calcularDiasAtraso } from '../functions/pendencias';
 * 
 * MANUTENÇÃO:
 * - Para validações: adicionar função com prefixo 'validar'
 * - Para formatações: adicionar função com prefixo 'formatar'
 * - Para processamento: adicionar função com prefixo 'processar'
 * - Para cálculos: adicionar função com prefixo 'calcular'
 */

import { InserirPendencia, Pendencia } from "@shared/schema";

/**
 * TIPOS E CONSTANTES
 */

export const TIPOS_PENDENCIA = [
  'Documentação',
  'Pagamento',
  'Autorização',
  'Contrato',
  'Produto',
  'Serviço',
  'Transporte',
  'Comunicação',
  'Outros'
] as const;

export const STATUS_PENDENCIA = [
  'PENDENTE',
  'EM_ANDAMENTO',
  'CONCLUIDA',
  'CANCELADA',
  'ATRASADA'
] as const;

export const PRIORIDADES = [
  'BAIXA',
  'MEDIA',
  'ALTA',
  'URGENTE'
] as const;

/**
 * VALIDAÇÕES DE PENDÊNCIAS
 */

export function validarPendencia(dados: InserirPendencia): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!dados.tipo || dados.tipo.trim().length < 2) {
    erros.push('Tipo da pendência é obrigatório');
  }

  if (!dados.descricao || dados.descricao.trim().length < 5) {
    erros.push('Descrição da pendência é obrigatória e deve ter pelo menos 5 caracteres');
  }

  if (!dados.ordemServicoId || dados.ordemServicoId <= 0) {
    erros.push('ID da ordem de serviço é obrigatório');
  }

  if (dados.prazo) {
    const prazoDate = new Date(dados.prazo);
    const hoje = new Date();
    
    if (prazoDate < hoje) {
      erros.push('Prazo não pode ser anterior à data atual');
    }
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarTipoPendencia(tipo: string): boolean {
  return TIPOS_PENDENCIA.includes(tipo as any);
}

export function validarStatusPendencia(status: string): boolean {
  return STATUS_PENDENCIA.includes(status as any);
}

/**
 * FORMATAÇÕES DE PENDÊNCIAS
 */

export function formatarTipoPendencia(tipo: string): string {
  return tipo
    .trim()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
}

export function formatarStatusPendencia(status: string): {
  label: string;
  cor: 'gray' | 'blue' | 'green' | 'red' | 'yellow';
} {
  switch (status.toUpperCase()) {
    case 'PENDENTE':
      return { label: 'Pendente', cor: 'gray' };
    case 'EM_ANDAMENTO':
      return { label: 'Em Andamento', cor: 'blue' };
    case 'CONCLUIDA':
      return { label: 'Concluída', cor: 'green' };
    case 'CANCELADA':
      return { label: 'Cancelada', cor: 'red' };
    case 'ATRASADA':
      return { label: 'Atrasada', cor: 'red' };
    default:
      return { label: 'Pendente', cor: 'gray' };
  }
}

export function formatarPrioridade(prioridade: string): {
  label: string;
  cor: 'green' | 'yellow' | 'orange' | 'red';
} {
  switch (prioridade.toUpperCase()) {
    case 'BAIXA':
      return { label: 'Baixa', cor: 'green' };
    case 'MEDIA':
      return { label: 'Média', cor: 'yellow' };
    case 'ALTA':
      return { label: 'Alta', cor: 'orange' };
    case 'URGENTE':
      return { label: 'Urgente', cor: 'red' };
    default:
      return { label: 'Média', cor: 'yellow' };
  }
}

/**
 * PROCESSAMENTO DE PENDÊNCIAS
 */

export function processarDadosPendencia(dados: InserirPendencia): InserirPendencia {
  return {
    ...dados,
    tipo: formatarTipoPendencia(dados.tipo),
    descricao: dados.descricao.trim(),
    status: dados.status || 'PENDENTE',
    prioridade: dados.prioridade || 'MEDIA',
    usuario: dados.usuario?.trim() || '',
    observacoes: dados.observacoes?.trim() || ''
  };
}

export function processarStatusAutomatico(pendencia: Pendencia): string {
  const hoje = new Date();
  
  // Se tem prazo e está vencido, marcar como atrasada
  if (pendencia.prazo) {
    const prazoDate = new Date(pendencia.prazo);
    if (prazoDate < hoje && pendencia.status !== 'CONCLUIDA' && pendencia.status !== 'CANCELADA') {
      return 'ATRASADA';
    }
  }
  
  return pendencia.status;
}

export function processarPrioridadeAutomatica(pendencia: Pendencia): string {
  // Aumentar prioridade se está próximo do prazo
  if (pendencia.prazo) {
    const diasRestantes = calcularDiasRestantes(new Date(pendencia.prazo));
    
    if (diasRestantes <= 0) {
      return 'URGENTE';
    } else if (diasRestantes <= 1) {
      return 'ALTA';
    } else if (diasRestantes <= 3) {
      return 'MEDIA';
    }
  }
  
  return pendencia.prioridade || 'MEDIA';
}

/**
 * CÁLCULOS DE PENDÊNCIAS
 */

export function calcularDiasRestantes(prazo: Date): number {
  const hoje = new Date();
  const diffMs = prazo.getTime() - hoje.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function calcularDiasAtraso(prazo: Date): number {
  const hoje = new Date();
  const diffMs = hoje.getTime() - prazo.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function calcularTempoMedioConclusao(pendencias: Pendencia[]): number {
  const concluidas = pendencias.filter(p => p.status === 'CONCLUIDA' && p.criadoEm && p.atualizadoEm);
  
  if (concluidas.length === 0) return 0;
  
  const tempos = concluidas.map(p => {
    const inicio = new Date(p.criadoEm!);
    const fim = new Date(p.atualizadoEm!);
    return (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24); // dias
  });
  
  return tempos.reduce((acc, tempo) => acc + tempo, 0) / tempos.length;
}

export function calcularTaxaConclusao(pendencias: Pendencia[]): number {
  if (pendencias.length === 0) return 0;
  
  const concluidas = pendencias.filter(p => p.status === 'CONCLUIDA').length;
  return (concluidas / pendencias.length) * 100;
}

/**
 * UTILITÁRIOS DE PENDÊNCIAS
 */

export function buscarPendenciasPorTipo(pendencias: Pendencia[], tipo: string): Pendencia[] {
  return pendencias.filter(pendencia => 
    pendencia.tipo.toLowerCase().includes(tipo.toLowerCase())
  );
}

export function buscarPendenciasPorStatus(pendencias: Pendencia[], status: string): Pendencia[] {
  return pendencias.filter(pendencia => 
    pendencia.status.toLowerCase() === status.toLowerCase()
  );
}

export function buscarPendenciasAtrasadas(pendencias: Pendencia[]): Pendencia[] {
  const hoje = new Date();
  
  return pendencias.filter(pendencia => {
    if (!pendencia.prazo || pendencia.status === 'CONCLUIDA' || pendencia.status === 'CANCELADA') {
      return false;
    }
    
    const prazoDate = new Date(pendencia.prazo);
    return prazoDate < hoje;
  });
}

export function buscarPendenciasUrgentes(pendencias: Pendencia[]): Pendencia[] {
  const hoje = new Date();
  
  return pendencias.filter(pendencia => {
    if (!pendencia.prazo || pendencia.status === 'CONCLUIDA' || pendencia.status === 'CANCELADA') {
      return false;
    }
    
    const diasRestantes = calcularDiasRestantes(new Date(pendencia.prazo));
    return diasRestantes <= 1; // Próximas 24 horas
  });
}

export function ordenarPendenciasPorPrioridade(pendencias: Pendencia[]): Pendencia[] {
  const ordemPrioridade = { 'URGENTE': 0, 'ALTA': 1, 'MEDIA': 2, 'BAIXA': 3 };
  
  return pendencias.sort((a, b) => {
    const prioridadeA = ordemPrioridade[a.prioridade as keyof typeof ordemPrioridade] ?? 2;
    const prioridadeB = ordemPrioridade[b.prioridade as keyof typeof ordemPrioridade] ?? 2;
    return prioridadeA - prioridadeB;
  });
}

export function gerarRelatorioPendencias(pendencias: Pendencia[]) {
  return {
    total: pendencias.length,
    pendentes: pendencias.filter(p => p.status === 'PENDENTE').length,
    emAndamento: pendencias.filter(p => p.status === 'EM_ANDAMENTO').length,
    concluidas: pendencias.filter(p => p.status === 'CONCLUIDA').length,
    atrasadas: buscarPendenciasAtrasadas(pendencias).length,
    urgentes: buscarPendenciasUrgentes(pendencias).length,
    taxaConclusao: calcularTaxaConclusao(pendencias),
    tempoMedioConclusao: calcularTempoMedioConclusao(pendencias)
  };
}