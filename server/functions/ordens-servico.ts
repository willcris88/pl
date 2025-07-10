/**
 * FUNÇÕES DE ORDENS DE SERVIÇO
 * 
 * Este arquivo contém todas as funções relacionadas ao gerenciamento de ordens de serviço:
 * - Validações específicas de ordens
 * - Cálculos de valores e totais
 * - Processamento de status
 * - Geração de códigos e números
 * 
 * COMO USAR:
 * import { calcularTotalOrdem, validarOrdemServico } from '../functions/ordens-servico';
 * 
 * MANUTENÇÃO:
 * - Para novos cálculos: adicionar função com prefixo 'calcular'
 * - Para validações: adicionar função com prefixo 'validar'
 * - Para status: adicionar função com prefixo 'processar'
 */

import { InserirOrdemServico, OrdemServico, ProdutoOs } from "@shared/schema";

/**
 * VALIDAÇÕES DE ORDENS DE SERVIÇO
 */

export function validarOrdemServico(dados: InserirOrdemServico): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!dados.nomeContratante || dados.nomeContratante.trim().length < 2) {
    erros.push('Nome do contratante é obrigatório');
  }

  if (!dados.nomeFinado || dados.nomeFinado.trim().length < 2) {
    erros.push('Nome do finado é obrigatório');
  }

  if (!dados.dataFalecimento) {
    erros.push('Data do falecimento é obrigatória');
  }

  // Validar data de sepultamento (deve ser igual ou posterior ao falecimento)
  if (dados.dataFalecimento && dados.dataHoraSepultamento) {
    const falecimento = new Date(dados.dataFalecimento);
    const sepultamento = new Date(dados.dataHoraSepultamento);
    
    if (sepultamento < falecimento) {
      erros.push('Data de sepultamento não pode ser anterior ao falecimento');
    }
  }

  // Validar CPF do contratante se fornecido
  if (dados.cpfContratante && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(dados.cpfContratante)) {
    erros.push('CPF do contratante deve estar no formato XXX.XXX.XXX-XX');
  }

  // Validar telefone se fornecido
  if (dados.telefoneContratante && dados.telefoneContratante.length < 10) {
    erros.push('Telefone deve ter pelo menos 10 dígitos');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarStatusTransicao(statusAtual: string, novoStatus: string): boolean {
  const transicoesPosseis: Record<string, string[]> = {
    'pendente': ['em_andamento', 'cancelada'],
    'em_andamento': ['concluida', 'pendente', 'cancelada'],
    'concluida': ['arquivada'],
    'cancelada': ['pendente'],
    'arquivada': []
  };

  return transicoesPosseis[statusAtual]?.includes(novoStatus) || false;
}

/**
 * CÁLCULOS E VALORES
 */

export function calcularTotalOrdem(produtos: ProdutoOs[]): number {
  return produtos.reduce((total, produto) => {
    return total + (produto.valorTotal || 0);
  }, 0);
}

export function calcularValorUnitario(valorTotal: number, quantidade: number): number {
  if (quantidade <= 0) return 0;
  return valorTotal / quantidade;
}

export function calcularDesconto(valorOriginal: number, percentualDesconto: number): number {
  return valorOriginal * (percentualDesconto / 100);
}

export function calcularValorComDesconto(valorOriginal: number, percentualDesconto: number): number {
  const desconto = calcularDesconto(valorOriginal, percentualDesconto);
  return valorOriginal - desconto;
}

/**
 * PROCESSAMENTO DE DADOS
 */

export function processarDadosOrdem(dados: InserirOrdemServico): InserirOrdemServico {
  const dadosProcessados = { ...dados };

  // Normalizar strings
  if (dadosProcessados.nomeContratante) {
    dadosProcessados.nomeContratante = dadosProcessados.nomeContratante.trim().toUpperCase();
  }

  if (dadosProcessados.nomeFinado) {
    dadosProcessados.nomeFinado = dadosProcessados.nomeFinado.trim().toUpperCase();
  }

  // Formatar CPF
  if (dadosProcessados.cpfContratante) {
    dadosProcessados.cpfContratante = formatarCPF(dadosProcessados.cpfContratante);
  }

  // Formatar telefone
  if (dadosProcessados.telefoneContratante) {
    dadosProcessados.telefoneContratante = formatarTelefone(dadosProcessados.telefoneContratante);
  }

  return dadosProcessados;
}

export function atualizarStatusOrdem(ordem: OrdemServico, novoStatus: string): OrdemServico {
  if (!validarStatusTransicao(ordem.status || 'pendente', novoStatus)) {
    throw new Error(`Transição de status inválida: ${ordem.status} -> ${novoStatus}`);
  }

  return {
    ...ordem,
    status: novoStatus,
    atualizadoEm: new Date()
  };
}

/**
 * GERAÇÃO DE CÓDIGOS E NÚMEROS
 */

export function gerarNumeroOrdem(): string {
  const ano = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `OS${ano}${timestamp}`;
}

export function gerarCodigoContrato(ordemId: number): string {
  const ano = new Date().getFullYear();
  const numero = ordemId.toString().padStart(4, '0');
  return `CONT${ano}${numero}`;
}

/**
 * FORMATAÇÃO
 */

export function formatarCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatarTelefone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

export function formatarDataHora(data: Date | string): string {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return dataObj.toLocaleString('pt-BR');
}

/**
 * UTILITÁRIOS
 */

export function calcularIdadeFalecimento(dataNascimento?: Date, dataFalecimento?: Date): number | null {
  if (!dataNascimento || !dataFalecimento) return null;
  
  const nascimento = new Date(dataNascimento);
  const falecimento = new Date(dataFalecimento);
  
  let idade = falecimento.getFullYear() - nascimento.getFullYear();
  const mesAtual = falecimento.getMonth();
  const mesNascimento = nascimento.getMonth();
  
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && falecimento.getDate() < nascimento.getDate())) {
    idade--;
  }
  
  return idade;
}

export function obterProximaDataUtil(data: Date): Date {
  const proximaData = new Date(data);
  
  // Se for fim de semana, avançar para segunda-feira
  if (proximaData.getDay() === 0) { // Domingo
    proximaData.setDate(proximaData.getDate() + 1);
  } else if (proximaData.getDay() === 6) { // Sábado
    proximaData.setDate(proximaData.getDate() + 2);
  }
  
  return proximaData;
}

/**
 * CONSTANTES E CONFIGURAÇÕES
 */

export const STATUS_ORDEM = [
  { value: 'pendente', label: 'Pendente', color: 'yellow' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'blue' },
  { value: 'concluida', label: 'Concluída', color: 'green' },
  { value: 'cancelada', label: 'Cancelada', color: 'red' },
  { value: 'arquivada', label: 'Arquivada', color: 'gray' }
];

export const TIPOS_SEPULTAMENTO = [
  { value: 'inumacao', label: 'Inumação' },
  { value: 'cremacao', label: 'Cremação' },
  { value: 'translado', label: 'Translado' }
];

export const GRAUS_PARENTESCO = [
  { value: 'conjuge', label: 'Cônjuge' },
  { value: 'filho', label: 'Filho(a)' },
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mãe' },
  { value: 'irmao', label: 'Irmão(ã)' },
  { value: 'neto', label: 'Neto(a)' },
  { value: 'genro_nora', label: 'Genro/Nora' },
  { value: 'sogro', label: 'Sogro(a)' },
  { value: 'cunhado', label: 'Cunhado(a)' },
  { value: 'tio', label: 'Tio(a)' },
  { value: 'primo', label: 'Primo(a)' },
  { value: 'sobrinho', label: 'Sobrinho(a)' },
  { value: 'amigo', label: 'Amigo(a)' },
  { value: 'responsavel_legal', label: 'Responsável Legal' },
  { value: 'outro', label: 'Outro' }
];

// Configurações de valor padrão
export const CONFIGURACOES_VALOR = {
  VALOR_MINIMO_ORDEM: 100,
  DESCONTO_MAXIMO_PERCENTUAL: 50,
  TAXA_URGENCIA_PERCENTUAL: 20
};

// Campos obrigatórios para diferentes status
export const CAMPOS_OBRIGATORIOS_POR_STATUS = {
  pendente: ['nomeContratante', 'nomeFinado', 'dataFalecimento'],
  em_andamento: ['nomeContratante', 'nomeFinado', 'dataFalecimento', 'dataHoraSepultamento'],
  concluida: ['nomeContratante', 'nomeFinado', 'dataFalecimento', 'dataHoraSepultamento', 'localSepultamento']
};