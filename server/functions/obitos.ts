/**
 * FUNÇÕES DE ÓBITOS
 * 
 * Este arquivo contém todas as funções relacionadas ao gerenciamento de óbitos:
 * - Validações específicas de óbitos
 * - Regras de negócio para natimortos
 * - Formatação e processamento de dados
 * - Utilitários específicos do domínio
 * 
 * COMO USAR:
 * import { validarCamposNatimorto, formatarDadosObito } from '../functions/obitos';
 * 
 * MANUTENÇÃO:
 * - Para adicionar novas validações: criar função com prefixo 'validar'
 * - Para adicionar formatações: criar função com prefixo 'formatar'
 * - Para regras de negócio: criar função com prefixo 'processar'
 */

import { InserirObito, Obito } from "@shared/schema";

/**
 * VALIDAÇÕES DE ÓBITOS
 */

// Valida se os campos de natimorto estão corretos
export function validarCamposNatimorto(dados: InserirObito): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  if (dados.natimorto === 'sim') {
    // Campos obrigatórios para natimorto
    const camposObrigatorios = ['nome', 'sexo', 'filiacao'];
    
    camposObrigatorios.forEach(campo => {
      if (!dados[campo as keyof InserirObito]) {
        erros.push(`Campo ${campo} é obrigatório para natimorto`);
      }
    });

    // Campos que devem estar vazios para natimorto
    const camposProibidos = ['estadoCivil', 'profissao', 'rg', 'cpf', 'deixaBens', 'testamento', 'nomeConjuge', 'filhos'];
    
    camposProibidos.forEach(campo => {
      if (dados[campo as keyof InserirObito]) {
        erros.push(`Campo ${campo} não deve ser preenchido para natimorto`);
      }
    });

    // Validar campos específicos de natimorto
    if (!dados.idade) {
      erros.push('Idade é obrigatória para natimorto');
    }
    if (!dados.horaNasc) {
      erros.push('Hora de nascimento é obrigatória para natimorto');
    }
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

// Valida dados gerais de óbito
export function validarDadosObito(dados: InserirObito): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações básicas
  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (dados.sexo && !['masculino', 'feminino'].includes(dados.sexo)) {
    erros.push('Sexo deve ser masculino ou feminino');
  }

  // Validar CPF se fornecido (formato básico)
  if (dados.cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(dados.cpf)) {
    erros.push('CPF deve estar no formato XXX.XXX.XXX-XX');
  }

  // Validar RG se fornecido
  if (dados.rg && dados.rg.length < 5) {
    erros.push('RG deve ter pelo menos 5 caracteres');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

/**
 * FORMATAÇÃO DE DADOS
 */

// Formata dados de óbito para exibição
export function formatarDadosObito(obito: Obito): Obito & { dadosFormatados: any } {
  return {
    ...obito,
    dadosFormatados: {
      nomeCompleto: obito.nome?.toUpperCase() || '',
      sexoExtenso: obito.sexo === 'masculino' ? 'Masculino' : obito.sexo === 'feminino' ? 'Feminino' : '',
      corRacaExtenso: formatarCorRaca(obito.corRaca),
      estadoCivilExtenso: formatarEstadoCivil(obito.estadoCivil),
      tipoObitoExtenso: obito.natimorto === 'sim' ? 'NATIMORTO' : 'ÓBITO NORMAL'
    }
  };
}

// Formata cor/raça para exibição
export function formatarCorRaca(corRaca?: string): string {
  const opcoes: Record<string, string> = {
    'branca': 'Branca',
    'preta': 'Preta',
    'parda': 'Parda',
    'amarela': 'Amarela',
    'indigena': 'Indígena',
    'nao_informado': 'Não Informado'
  };
  
  return opcoes[corRaca || ''] || corRaca || '';
}

// Formata estado civil para exibição
export function formatarEstadoCivil(estadoCivil?: string): string {
  const opcoes: Record<string, string> = {
    'solteiro': 'Solteiro(a)',
    'casado': 'Casado(a)',
    'divorciado': 'Divorciado(a)',
    'viuvo': 'Viúvo(a)',
    'uniao_estavel': 'União Estável',
    'separado': 'Separado(a)'
  };
  
  return opcoes[estadoCivil || ''] || estadoCivil || '';
}

/**
 * PROCESSAMENTO DE DADOS
 */

// Processa dados de óbito antes de salvar
export function processarDadosObito(dados: InserirObito): InserirObito {
  const dadosProcessados = { ...dados };

  // Limpar campos desnecessários para natimorto
  if (dados.natimorto === 'sim') {
    dadosProcessados.estadoCivil = undefined;
    dadosProcessados.profissao = undefined;
    dadosProcessados.rg = undefined;
    dadosProcessados.cpf = undefined;
    dadosProcessados.deixaBens = undefined;
    dadosProcessados.testamento = undefined;
    dadosProcessados.nomeConjuge = undefined;
    dadosProcessados.filhos = undefined;
  }

  // Limpar campos de natimorto se não for natimorto
  if (dados.natimorto !== 'sim') {
    dadosProcessados.idade = undefined;
    dadosProcessados.descIdade = undefined;
    dadosProcessados.horaNasc = undefined;
    dadosProcessados.localNasc = undefined;
    dadosProcessados.gestacao = undefined;
    dadosProcessados.duracao = undefined;
    dadosProcessados.avoPaterno = undefined;
    dadosProcessados.avoMaterno = undefined;
    dadosProcessados.avoPaterna = undefined;
    dadosProcessados.avoMaterna = undefined;
    dadosProcessados.nomeTestemunha1 = undefined;
    dadosProcessados.rgCpfCnjTestemunha1 = undefined;
    dadosProcessados.idadeTestemunha1 = undefined;
    dadosProcessados.enderecoTestemunha1 = undefined;
    dadosProcessados.bairroTestemunha1 = undefined;
  }

  // Normalizar strings
  if (dadosProcessados.nome) {
    dadosProcessados.nome = dadosProcessados.nome.trim().toUpperCase();
  }
  
  if (dadosProcessados.nomeMae) {
    dadosProcessados.nomeMae = dadosProcessados.nomeMae.trim().toUpperCase();
  }
  
  if (dadosProcessados.nomePai) {
    dadosProcessados.nomePai = dadosProcessados.nomePai.trim().toUpperCase();
  }

  return dadosProcessados;
}

/**
 * UTILITÁRIOS
 */

// Gera número do óbito (exemplo)
export function gerarNumeroObito(): string {
  const ano = new Date().getFullYear();
  const numero = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${ano}${numero}`;
}

// Calcula idade baseada na data de nascimento
export function calcularIdade(dataNascimento: string, dataFalecimento?: string): number | null {
  if (!dataNascimento) return null;
  
  const nascimento = new Date(dataNascimento);
  const referencia = dataFalecimento ? new Date(dataFalecimento) : new Date();
  
  let idade = referencia.getFullYear() - nascimento.getFullYear();
  const mesAtual = referencia.getMonth();
  const mesNascimento = nascimento.getMonth();
  
  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && referencia.getDate() < nascimento.getDate())) {
    idade--;
  }
  
  return idade;
}

// Valida se é maior de idade
export function isMaiorIdade(dataNascimento: string, dataReferencia?: string): boolean {
  const idade = calcularIdade(dataNascimento, dataReferencia);
  return idade !== null && idade >= 18;
}

/**
 * CONSTANTES E CONFIGURAÇÕES
 */

export const OPCOES_SEXO = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' }
];

export const OPCOES_COR_RACA = [
  { value: 'branca', label: 'Branca' },
  { value: 'preta', label: 'Preta' },
  { value: 'parda', label: 'Parda' },
  { value: 'amarela', label: 'Amarela' },
  { value: 'indigena', label: 'Indígena' },
  { value: 'nao_informado', label: 'Não Informado' }
];

export const OPCOES_ESTADO_CIVIL = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' },
  { value: 'separado', label: 'Separado(a)' }
];

// Campos que devem ser desabilitados para natimorto
export const CAMPOS_DESABILITADOS_NATIMORTO = [
  'estadoCivil',
  'profissao', 
  'rg',
  'cpf',
  'deixaBens',
  'testamento',
  'nomeConjuge',
  'filhos'
];

// Campos específicos de natimorto
export const CAMPOS_NATIMORTO = [
  'idade',
  'descIdade',
  'horaNasc',
  'localNasc', 
  'gestacao',
  'duracao',
  'avoPaterno',
  'avoMaterno',
  'avoPaterna',
  'avoMaterna',
  'nomeTestemunha1',
  'rgCpfCnjTestemunha1',
  'idadeTestemunha1',
  'enderecoTestemunha1',
  'bairroTestemunha1'
];