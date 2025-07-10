/**
 * FUNÇÕES DE PRESTADORAS
 * 
 * Este arquivo contém todas as funções relacionadas ao gerenciamento de prestadoras:
 * - Validações de CNPJ e dados empresariais
 * - Formatação de documentos e endereços
 * - Processamento de serviços oferecidos
 * - Cálculos de contratos e valores
 * 
 * COMO USAR:
 * import { validarPrestadora, formatarCNPJ } from '../functions/prestadoras';
 * 
 * MANUTENÇÃO:
 * - Para validações: adicionar função com prefixo 'validar'
 * - Para formatações: adicionar função com prefixo 'formatar'
 * - Para processamento: adicionar função com prefixo 'processar'
 * - Para cálculos: adicionar função com prefixo 'calcular'
 */

import { InserirPrestadora, Prestadora } from "@shared/schema";

/**
 * VALIDAÇÕES DE PRESTADORAS
 */

export function validarPrestadora(dados: InserirPrestadora): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.push('Nome da prestadora é obrigatório');
  }

  if (!dados.cnpj || !validarCNPJ(dados.cnpj)) {
    erros.push('CNPJ é obrigatório e deve ser válido');
  }

  if (!dados.telefone || dados.telefone.trim().length < 10) {
    erros.push('Telefone é obrigatório');
  }

  if (!dados.endereco || dados.endereco.trim().length < 5) {
    erros.push('Endereço é obrigatório');
  }

  if (!dados.cidade || dados.cidade.trim().length < 2) {
    erros.push('Cidade é obrigatória');
  }

  if (!dados.uf || dados.uf.length !== 2) {
    erros.push('UF é obrigatória e deve ter 2 caracteres');
  }

  if (!dados.cep || !validarCEP(dados.cep)) {
    erros.push('CEP é obrigatório e deve ter formato válido');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpjLimpo.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpjLimpo)) return false;
  
  // Cálculo do primeiro dígito verificador
  let soma = 0;
  let peso = 5;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpjLimpo[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  
  let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (parseInt(cnpjLimpo[12]) !== digito1) return false;
  
  // Cálculo do segundo dígito verificador
  soma = 0;
  peso = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpjLimpo[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  
  let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return parseInt(cnpjLimpo[13]) === digito2;
}

export function validarCEP(cep: string): boolean {
  const cepLimpo = cep.replace(/[^\d]/g, '');
  return /^\d{8}$/.test(cepLimpo);
}

export function validarTelefone(telefone: string): boolean {
  const telefoneLimpo = telefone.replace(/[^\d]/g, '');
  return /^\d{10,11}$/.test(telefoneLimpo);
}

/**
 * FORMATAÇÕES DE PRESTADORAS
 */

export function formatarCNPJ(cnpj: string): string {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatarCEP(cep: string): string {
  const cepLimpo = cep.replace(/[^\d]/g, '');
  return cepLimpo.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

export function formatarTelefone(telefone: string): string {
  const telefoneLimpo = telefone.replace(/[^\d]/g, '');
  
  if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  } else if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  
  return telefone;
}

export function formatarNomePrestadora(nome: string): string {
  return nome
    .trim()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
}

/**
 * PROCESSAMENTO DE PRESTADORAS
 */

export function processarDadosPrestadora(dados: InserirPrestadora): InserirPrestadora {
  return {
    ...dados,
    nome: formatarNomePrestadora(dados.nome),
    cnpj: formatarCNPJ(dados.cnpj),
    telefone: formatarTelefone(dados.telefone),
    cep: formatarCEP(dados.cep),
    endereco: dados.endereco.trim(),
    cidade: dados.cidade.trim(),
    uf: dados.uf.toUpperCase().trim(),
    email: dados.email?.toLowerCase().trim(),
    observacoes: dados.observacoes?.trim() || ''
  };
}

export function processarStatusPrestadora(prestadora: Prestadora): {
  status: 'ativa' | 'inativa' | 'pendente';
  cor: 'green' | 'gray' | 'yellow';
  mensagem: string;
} {
  if (!prestadora.ativo) {
    return {
      status: 'inativa',
      cor: 'gray',
      mensagem: 'Prestadora inativa'
    };
  }

  // Verificar se tem dados completos
  const dadosCompletos = prestadora.cnpj && prestadora.telefone && prestadora.endereco;
  
  if (!dadosCompletos) {
    return {
      status: 'pendente',
      cor: 'yellow',
      mensagem: 'Dados incompletos'
    };
  }

  return {
    status: 'ativa',
    cor: 'green',
    mensagem: 'Prestadora ativa'
  };
}

/**
 * CÁLCULOS DE PRESTADORAS
 */

export function calcularDistancia(
  enderecoOrigem: string, 
  enderecoDestino: string
): Promise<number> {
  // Implementar cálculo de distância usando API de mapas
  // Por enquanto retorna estimativa baseada em string
  return Promise.resolve(Math.random() * 50); // km
}

export function calcularCustoDeslocamento(
  distancia: number, 
  valorPorKm: number = 2.50
): number {
  return distancia * valorPorKm;
}

export function calcularTempoServico(
  dataInicio: Date, 
  dataFim: Date
): number {
  return Math.floor((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60)); // horas
}

/**
 * UTILITÁRIOS DE PRESTADORAS
 */

export function buscarPrestadorasPorCidade(prestadoras: Prestadora[], cidade: string): Prestadora[] {
  return prestadoras.filter(prestadora => 
    prestadora.cidade.toLowerCase().includes(cidade.toLowerCase())
  );
}

export function buscarPrestadorasPorUF(prestadoras: Prestadora[], uf: string): Prestadora[] {
  return prestadoras.filter(prestadora => 
    prestadora.uf.toLowerCase() === uf.toLowerCase()
  );
}

export function gerarCodigoPrestadora(nome: string, sequencial: number): string {
  const prefixo = nome.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const numero = sequencial.toString().padStart(3, '0');
  return `PREST-${prefixo}-${numero}`;
}