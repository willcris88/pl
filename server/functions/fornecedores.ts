/**
 * FUNÇÕES DE FORNECEDORES
 * 
 * Este arquivo contém todas as funções relacionadas ao gerenciamento de fornecedores:
 * - Validações de CNPJ e dados empresariais
 * - Formatação de dados de contato
 * - Processamento de endereços
 * - Cálculos de produtos e estoque
 * 
 * COMO USAR:
 * import { validarCNPJ, formatarTelefone } from '../functions/fornecedores';
 * 
 * MANUTENÇÃO:
 * - Para validações: adicionar função com prefixo 'validar'
 * - Para formatações: adicionar função com prefixo 'formatar'
 * - Para processamento: adicionar função com prefixo 'processar'
 */

import { InserirFornecedor, Fornecedor } from "@shared/schema";

/**
 * VALIDAÇÕES DE FORNECEDORES
 */

export function validarFornecedor(dados: InserirFornecedor): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.push('Nome do fornecedor é obrigatório');
  }

  // Validar CNPJ se fornecido
  if (dados.cnpj && !validarCNPJ(dados.cnpj)) {
    erros.push('CNPJ inválido');
  }

  // Validar telefone se fornecido
  if (dados.telefone && !validarTelefone(dados.telefone)) {
    erros.push('Telefone inválido');
  }

  // Validar celular se fornecido
  if (dados.celular && !validarTelefone(dados.celular)) {
    erros.push('Celular inválido');
  }

  // Validar email se fornecido
  if (dados.email && !validarEmail(dados.email)) {
    erros.push('Email inválido');
  }

  // Validar CEP se fornecido
  if (dados.cep && !validarCEP(dados.cep)) {
    erros.push('CEP inválido');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;
  
  // Validar dígitos verificadores
  let soma = 0;
  let peso = 5;
  
  // Primeiro dígito verificador
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpjLimpo.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cnpjLimpo.charAt(12)) !== dv1) return false;
  
  // Segundo dígito verificador
  soma = 0;
  peso = 6;
  
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpjLimpo.charAt(i)) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;
  
  return parseInt(cnpjLimpo.charAt(13)) === dv2;
}

export function validarTelefone(telefone: string): boolean {
  const digits = telefone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

export function validarEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validarCEP(cep: string): boolean {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8;
}

/**
 * FORMATAÇÃO DE DADOS
 */

export function formatarCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
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

export function formatarCEP(cep: string): string {
  const digits = cep.replace(/\D/g, '');
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export function formatarEndereco(fornecedor: Fornecedor): string {
  const partes = [];
  
  if (fornecedor.endereco) partes.push(fornecedor.endereco);
  if (fornecedor.numeroEndereco) partes.push(`nº ${fornecedor.numeroEndereco}`);
  if (fornecedor.complemento) partes.push(fornecedor.complemento);
  if (fornecedor.bairro) partes.push(fornecedor.bairro);
  if (fornecedor.cidade) partes.push(fornecedor.cidade);
  if (fornecedor.estado) partes.push(fornecedor.estado);
  if (fornecedor.cep) partes.push(`CEP ${formatarCEP(fornecedor.cep)}`);
  
  return partes.join(', ');
}

/**
 * PROCESSAMENTO DE DADOS
 */

export function processarDadosFornecedor(dados: InserirFornecedor): InserirFornecedor {
  const dadosProcessados = { ...dados };

  // Normalizar strings
  if (dadosProcessados.nome) {
    dadosProcessados.nome = dadosProcessados.nome.trim().toUpperCase();
  }

  if (dadosProcessados.responsavel) {
    dadosProcessados.responsavel = dadosProcessados.responsavel.trim();
  }

  if (dadosProcessados.endereco) {
    dadosProcessados.endereco = dadosProcessados.endereco.trim();
  }

  if (dadosProcessados.bairro) {
    dadosProcessados.bairro = dadosProcessados.bairro.trim();
  }

  if (dadosProcessados.cidade) {
    dadosProcessados.cidade = dadosProcessados.cidade.trim();
  }

  // Formatar documentos e contatos
  if (dadosProcessados.cnpj) {
    dadosProcessados.cnpj = formatarCNPJ(dadosProcessados.cnpj);
  }

  if (dadosProcessados.telefone) {
    dadosProcessados.telefone = formatarTelefone(dadosProcessados.telefone);
  }

  if (dadosProcessados.celular) {
    dadosProcessados.celular = formatarTelefone(dadosProcessados.celular);
  }

  if (dadosProcessados.cep) {
    dadosProcessados.cep = formatarCEP(dadosProcessados.cep);
  }

  if (dadosProcessados.email) {
    dadosProcessados.email = dadosProcessados.email.toLowerCase().trim();
  }

  // Definir status padrão se não informado
  if (dadosProcessados.status === undefined) {
    dadosProcessados.status = 1; // Ativo por padrão
  }

  return dadosProcessados;
}

export function atualizarStatusFornecedor(fornecedor: Fornecedor, novoStatus: number): Fornecedor {
  if (![0, 1].includes(novoStatus)) {
    throw new Error('Status deve ser 0 (inativo) ou 1 (ativo)');
  }

  return {
    ...fornecedor,
    status: novoStatus,
    dataUpdate: new Date()
  };
}

/**
 * UTILITÁRIOS
 */

export function obterStatusTexto(status: number): string {
  return status === 1 ? 'Ativo' : 'Inativo';
}

export function obterCorStatus(status: number): string {
  return status === 1 ? 'green' : 'red';
}

export function calcularTempoAtividade(dataRegistro: Date): string {
  const agora = new Date();
  const diferenca = agora.getTime() - dataRegistro.getTime();
  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
  
  if (dias < 30) {
    return `${dias} dias`;
  } else if (dias < 365) {
    const meses = Math.floor(dias / 30);
    return `${meses} meses`;
  } else {
    const anos = Math.floor(dias / 365);
    return `${anos} anos`;
  }
}

export function gerarCodigoFornecedor(nome: string): string {
  const prefixo = nome.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefixo}${timestamp}`;
}

/**
 * BUSCA E FILTROS
 */

export function filtrarFornecedores(fornecedores: Fornecedor[], filtros: {
  nome?: string;
  cnpj?: string;
  status?: number;
  cidade?: string;
  responsavel?: string;
}): Fornecedor[] {
  return fornecedores.filter(fornecedor => {
    if (filtros.nome && !fornecedor.nome?.toLowerCase().includes(filtros.nome.toLowerCase())) {
      return false;
    }
    
    if (filtros.cnpj && !fornecedor.cnpj?.includes(filtros.cnpj)) {
      return false;
    }
    
    if (filtros.status !== undefined && fornecedor.status !== filtros.status) {
      return false;
    }
    
    if (filtros.cidade && !fornecedor.cidade?.toLowerCase().includes(filtros.cidade.toLowerCase())) {
      return false;
    }
    
    if (filtros.responsavel && !fornecedor.responsavel?.toLowerCase().includes(filtros.responsavel.toLowerCase())) {
      return false;
    }
    
    return true;
  });
}

export function ordenarFornecedores(fornecedores: Fornecedor[], campo: keyof Fornecedor, ordem: 'asc' | 'desc' = 'asc'): Fornecedor[] {
  return [...fornecedores].sort((a, b) => {
    const valorA = a[campo];
    const valorB = b[campo];
    
    if (valorA === null || valorA === undefined) return 1;
    if (valorB === null || valorB === undefined) return -1;
    
    if (valorA < valorB) return ordem === 'asc' ? -1 : 1;
    if (valorA > valorB) return ordem === 'asc' ? 1 : -1;
    
    return 0;
  });
}

/**
 * CONSTANTES E CONFIGURAÇÕES
 */

export const ESTADOS_BRASIL = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

export const TIPOS_FORNECEDOR = [
  { value: 'produtos', label: 'Produtos' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'ambos', label: 'Produtos e Serviços' }
];

// Configurações padrão
export const CONFIGURACOES_FORNECEDOR = {
  PRAZO_PAGAMENTO_PADRAO: 30, // dias
  LIMITE_CREDITO_PADRAO: 10000, // R$
  DESCONTO_MAXIMO_PERCENTUAL: 15
};