/**
 * FUNÇÕES DE LOGS DE AUDITORIA
 * 
 * Este arquivo contém todas as funções relacionadas ao sistema de auditoria:
 * - Validações de logs e operações
 * - Formatação de dados de auditoria
 * - Processamento de logs e eventos
 * - Cálculos de estatísticas e relatórios
 * 
 * COMO USAR:
 * import { validarLogAuditoria, formatarAcaoUsuario } from '../functions/logs-auditoria';
 * 
 * MANUTENÇÃO:
 * - Para validações: adicionar função com prefixo 'validar'
 * - Para formatações: adicionar função com prefixo 'formatar'
 * - Para processamento: adicionar função com prefixo 'processar'
 * - Para cálculos: adicionar função com prefixo 'calcular'
 */

import { InserirLogAuditoria, LogAuditoria } from "@shared/schema";

/**
 * TIPOS E CONSTANTES
 */

export const ACOES_AUDITORIA = [
  'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS', 'EXPORT', 'IMPORT'
] as const;

export const TABELAS_AUDITORIA = [
  'usuarios', 'obitos', 'ordens_servico', 'fornecedores', 'produtos', 
  'prestadoras', 'contratos', 'pendencias', 'motoristas', 'documentos', 'calendario'
] as const;

export const NIVEIS_SEVERIDADE = [
  'INFO', 'WARNING', 'ERROR', 'CRITICAL'
] as const;

/**
 * VALIDAÇÕES DE LOGS
 */

export function validarLogAuditoria(dados: InserirLogAuditoria): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!dados.usuarioId || dados.usuarioId <= 0) {
    erros.push('ID do usuário é obrigatório');
  }

  if (!dados.acao || !ACOES_AUDITORIA.includes(dados.acao as any)) {
    erros.push('Ação deve ser uma das ações válidas');
  }

  if (!dados.tabela || dados.tabela.trim().length < 2) {
    erros.push('Nome da tabela é obrigatório');
  }

  if (!dados.descricao || dados.descricao.trim().length < 5) {
    erros.push('Descrição é obrigatória e deve ter pelo menos 5 caracteres');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarAcaoAuditoria(acao: string): boolean {
  return ACOES_AUDITORIA.includes(acao as any);
}

export function validarTabelaAuditoria(tabela: string): boolean {
  return TABELAS_AUDITORIA.includes(tabela as any);
}

/**
 * FORMATAÇÕES DE LOGS
 */

export function formatarAcaoUsuario(acao: string): {
  label: string;
  cor: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  icone: string;
} {
  switch (acao.toUpperCase()) {
    case 'CREATE':
      return { label: 'Criou', cor: 'green', icone: '➕' };
    case 'UPDATE':
      return { label: 'Atualizou', cor: 'blue', icone: '✏️' };
    case 'DELETE':
      return { label: 'Excluiu', cor: 'red', icone: '🗑️' };
    case 'LOGIN':
      return { label: 'Login', cor: 'green', icone: '🔓' };
    case 'LOGOUT':
      return { label: 'Logout', cor: 'gray', icone: '🔒' };
    case 'ACCESS':
      return { label: 'Acessou', cor: 'blue', icone: '👁️' };
    case 'EXPORT':
      return { label: 'Exportou', cor: 'purple', icone: '📤' };
    case 'IMPORT':
      return { label: 'Importou', cor: 'purple', icone: '📥' };
    default:
      return { label: 'Ação', cor: 'gray', icone: '❓' };
  }
}

export function formatarNomeTabela(tabela: string): string {
  const nomes: Record<string, string> = {
    'usuarios': 'Usuários',
    'obitos': 'Óbitos',
    'ordens_servico': 'Ordens de Serviço',
    'fornecedores': 'Fornecedores',
    'produtos': 'Produtos',
    'prestadoras': 'Prestadoras',
    'contratos': 'Contratos',
    'pendencias': 'Pendências',
    'motoristas': 'Motoristas',
    'documentos': 'Documentos',
    'calendario': 'Calendário'
  };

  return nomes[tabela.toLowerCase()] || tabela;
}

export function formatarDataHoraLog(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(data);
}

export function formatarIpUsuario(ip: string): string {
  // Mascarar parte do IP para privacidade
  const partes = ip.split('.');
  if (partes.length === 4) {
    return `${partes[0]}.${partes[1]}.***.**`;
  }
  return ip;
}

/**
 * PROCESSAMENTO DE LOGS
 */

export function processarDadosLog(dados: InserirLogAuditoria): InserirLogAuditoria {
  return {
    ...dados,
    acao: dados.acao.toUpperCase(),
    tabela: dados.tabela.toLowerCase(),
    descricao: dados.descricao.trim(),
    ip: dados.ip?.trim() || '',
    userAgent: dados.userAgent?.trim() || '',
    dadosAntes: dados.dadosAntes ? JSON.stringify(dados.dadosAntes) : null,
    dadosDepois: dados.dadosDepois ? JSON.stringify(dados.dadosDepois) : null
  };
}

export function processarNivelSeveridade(acao: string, tabela: string): string {
  // Ações críticas
  if (acao === 'DELETE' && ['usuarios', 'obitos', 'ordens_servico'].includes(tabela)) {
    return 'CRITICAL';
  }

  // Ações de erro
  if (acao === 'DELETE') {
    return 'WARNING';
  }

  // Ações de login/logout
  if (['LOGIN', 'LOGOUT'].includes(acao)) {
    return 'INFO';
  }

  // Ações normais
  return 'INFO';
}

export function processarResumoAlteracao(dadosAntes: any, dadosDepois: any): string {
  if (!dadosAntes || !dadosDepois) return '';

  const campos = Object.keys(dadosDepois);
  const alteracoes = campos.filter(campo => 
    JSON.stringify(dadosAntes[campo]) !== JSON.stringify(dadosDepois[campo])
  );

  if (alteracoes.length === 0) return 'Nenhuma alteração detectada';
  if (alteracoes.length === 1) return `Alterou: ${alteracoes[0]}`;
  if (alteracoes.length <= 3) return `Alterou: ${alteracoes.join(', ')}`;
  
  return `Alterou ${alteracoes.length} campos`;
}

/**
 * CÁLCULOS DE AUDITORIA
 */

export function calcularAtividadePorUsuario(logs: LogAuditoria[]): Record<number, number> {
  const atividade: Record<number, number> = {};
  
  logs.forEach(log => {
    atividade[log.usuarioId] = (atividade[log.usuarioId] || 0) + 1;
  });
  
  return atividade;
}

export function calcularAtividadePorAcao(logs: LogAuditoria[]): Record<string, number> {
  const atividade: Record<string, number> = {};
  
  logs.forEach(log => {
    atividade[log.acao] = (atividade[log.acao] || 0) + 1;
  });
  
  return atividade;
}

export function calcularAtividadePorTabela(logs: LogAuditoria[]): Record<string, number> {
  const atividade: Record<string, number> = {};
  
  logs.forEach(log => {
    atividade[log.tabela] = (atividade[log.tabela] || 0) + 1;
  });
  
  return atividade;
}

export function calcularHorariosPico(logs: LogAuditoria[]): Record<number, number> {
  const horarios: Record<number, number> = {};
  
  logs.forEach(log => {
    const hora = new Date(log.timestamp).getHours();
    horarios[hora] = (horarios[hora] || 0) + 1;
  });
  
  return horarios;
}

export function calcularTendenciaAtividade(logs: LogAuditoria[], dias: number = 7): {
  periodo: string;
  atividade: number;
}[] {
  const hoje = new Date();
  const tendencia = [];
  
  for (let i = dias - 1; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    data.setHours(0, 0, 0, 0);
    
    const proximoDia = new Date(data);
    proximoDia.setDate(proximoDia.getDate() + 1);
    
    const logsNoDia = logs.filter(log => {
      const timestampLog = new Date(log.timestamp);
      return timestampLog >= data && timestampLog < proximoDia;
    });
    
    tendencia.push({
      periodo: data.toLocaleDateString('pt-BR'),
      atividade: logsNoDia.length
    });
  }
  
  return tendencia;
}

/**
 * UTILITÁRIOS DE AUDITORIA
 */

export function buscarLogsPorUsuario(logs: LogAuditoria[], usuarioId: number): LogAuditoria[] {
  return logs.filter(log => log.usuarioId === usuarioId);
}

export function buscarLogsPorAcao(logs: LogAuditoria[], acao: string): LogAuditoria[] {
  return logs.filter(log => log.acao.toLowerCase() === acao.toLowerCase());
}

export function buscarLogsPorTabela(logs: LogAuditoria[], tabela: string): LogAuditoria[] {
  return logs.filter(log => log.tabela.toLowerCase() === tabela.toLowerCase());
}

export function buscarLogsPorPeriodo(logs: LogAuditoria[], dataInicio: Date, dataFim: Date): LogAuditoria[] {
  return logs.filter(log => {
    const timestamp = new Date(log.timestamp);
    return timestamp >= dataInicio && timestamp <= dataFim;
  });
}

export function buscarLogsComErros(logs: LogAuditoria[]): LogAuditoria[] {
  return logs.filter(log => 
    log.descricao.toLowerCase().includes('erro') ||
    log.descricao.toLowerCase().includes('falha') ||
    log.descricao.toLowerCase().includes('falhou')
  );
}

export function ordenarLogsPorData(logs: LogAuditoria[], crescente: boolean = false): LogAuditoria[] {
  return logs.sort((a, b) => {
    const dataA = new Date(a.timestamp).getTime();
    const dataB = new Date(b.timestamp).getTime();
    return crescente ? dataA - dataB : dataB - dataA;
  });
}

export function gerarRelatorioAuditoria(logs: LogAuditoria[]) {
  const atividadePorUsuario = calcularAtividadePorUsuario(logs);
  const atividadePorAcao = calcularAtividadePorAcao(logs);
  const atividadePorTabela = calcularAtividadePorTabela(logs);
  const tendencia = calcularTendenciaAtividade(logs);
  const horariosPico = calcularHorariosPico(logs);
  
  const usuarioMaisAtivo = Object.entries(atividadePorUsuario)
    .sort(([,a], [,b]) => b - a)[0];
  
  const acaoMaisComum = Object.entries(atividadePorAcao)
    .sort(([,a], [,b]) => b - a)[0];
  
  return {
    totalLogs: logs.length,
    periodoAnalise: {
      inicio: logs.length > 0 ? ordenarLogsPorData(logs, true)[0].timestamp : null,
      fim: logs.length > 0 ? ordenarLogsPorData(logs, false)[0].timestamp : null
    },
    usuarioMaisAtivo: usuarioMaisAtivo ? {
      id: parseInt(usuarioMaisAtivo[0]),
      atividades: usuarioMaisAtivo[1]
    } : null,
    acaoMaisComum: acaoMaisComum ? {
      acao: acaoMaisComum[0],
      quantidade: acaoMaisComum[1]
    } : null,
    atividadePorUsuario,
    atividadePorAcao,
    atividadePorTabela,
    tendencia,
    horariosPico,
    logsCriticos: logs.filter(log => log.acao === 'DELETE').length,
    logsHoje: buscarLogsPorPeriodo(logs, 
      new Date(new Date().setHours(0, 0, 0, 0)), 
      new Date(new Date().setHours(23, 59, 59, 999))
    ).length
  };
}