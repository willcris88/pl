/**
 * FUNÇÕES DE MOTORISTAS
 * 
 * Este arquivo contém todas as funções relacionadas ao gerenciamento de motoristas:
 * - Validações de CNH e documentos
 * - Formatação de dados pessoais
 * - Processamento de disponibilidade
 * - Cálculos de rotas e custos
 * 
 * COMO USAR:
 * import { validarMotorista, formatarCNH } from '../functions/motoristas';
 * 
 * MANUTENÇÃO:
 * - Para validações: adicionar função com prefixo 'validar'
 * - Para formatações: adicionar função com prefixo 'formatar'
 * - Para processamento: adicionar função com prefixo 'processar'
 * - Para cálculos: adicionar função com prefixo 'calcular'
 */

import { InserirMotorista, Motorista } from "@shared/schema";

/**
 * VALIDAÇÕES DE MOTORISTAS
 */

export function validarMotorista(dados: InserirMotorista): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.push('Nome do motorista é obrigatório');
  }

  if (!dados.cnh || !validarCNH(dados.cnh)) {
    erros.push('CNH é obrigatória e deve ser válida');
  }

  if (!dados.telefone || dados.telefone.trim().length < 10) {
    erros.push('Telefone é obrigatório');
  }

  if (dados.dataNascimento) {
    const idade = calcularIdade(new Date(dados.dataNascimento));
    if (idade < 18) {
      erros.push('Motorista deve ter pelo menos 18 anos');
    }
    if (idade > 70) {
      erros.push('Motorista não pode ter mais de 70 anos');
    }
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarCNH(cnh: string): boolean {
  // Remove caracteres não numéricos
  const cnhLimpa = cnh.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cnhLimpa.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnhLimpa)) return false;
  
  // Cálculo do primeiro dígito verificador
  let soma = 0;
  let sequencia = 9;
  
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cnhLimpa[i]) * sequencia;
    sequencia--;
  }
  
  let digito1 = soma % 11;
  if (digito1 >= 10) digito1 = 0;
  
  if (parseInt(cnhLimpa[9]) !== digito1) return false;
  
  // Cálculo do segundo dígito verificador
  soma = 0;
  sequencia = 1;
  
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cnhLimpa[i]) * sequencia;
    sequencia++;
  }
  
  let digito2 = soma % 11;
  if (digito2 >= 10) digito2 = 0;
  
  return parseInt(cnhLimpa[10]) === digito2;
}

export function validarCategoriasCNH(categorias: string[]): boolean {
  const categoriasValidas = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'];
  return categorias.every(cat => categoriasValidas.includes(cat.toUpperCase()));
}

/**
 * FORMATAÇÕES DE MOTORISTAS
 */

export function formatarCNH(cnh: string): string {
  const cnhLimpa = cnh.replace(/[^\d]/g, '');
  return cnhLimpa.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/[^\d]/g, '');
  return cpfLimpo.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

export function formatarNomeMotorista(nome: string): string {
  return nome
    .trim()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
}

/**
 * PROCESSAMENTO DE MOTORISTAS
 */

export function processarDadosMotorista(dados: InserirMotorista): InserirMotorista {
  return {
    ...dados,
    nome: formatarNomeMotorista(dados.nome),
    cnh: formatarCNH(dados.cnh),
    cpf: dados.cpf ? formatarCPF(dados.cpf) : undefined,
    telefone: dados.telefone.replace(/[^\d]/g, ''),
    endereco: dados.endereco?.trim(),
    observacoes: dados.observacoes?.trim() || ''
  };
}

export function processarDisponibilidadeMotorista(motorista: Motorista): {
  disponivel: boolean;
  motivo?: string;
  proximaDisponibilidade?: Date;
} {
  if (!motorista.ativo) {
    return {
      disponivel: false,
      motivo: 'Motorista inativo'
    };
  }

  // Verificar se CNH está vencida
  if (motorista.validadeCNH) {
    const hoje = new Date();
    const validadeCNH = new Date(motorista.validadeCNH);
    
    if (validadeCNH < hoje) {
      return {
        disponivel: false,
        motivo: 'CNH vencida',
        proximaDisponibilidade: validadeCNH
      };
    }
  }

  return {
    disponivel: true
  };
}

/**
 * CÁLCULOS DE MOTORISTAS
 */

export function calcularIdade(dataNascimento: Date): number {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const mesAniversario = hoje.getMonth() - dataNascimento.getMonth();
  
  if (mesAniversario < 0 || (mesAniversario === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--;
  }
  
  return idade;
}

export function calcularTempoExperiencia(dataContratacao: Date): number {
  const hoje = new Date();
  const diffMs = hoje.getTime() - dataContratacao.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365)); // anos
}

export function calcularCustoViagem(
  distancia: number, 
  valorPorKm: number = 1.50, 
  horasTrabalho: number = 0, 
  valorHora: number = 25
): number {
  const custoKm = distancia * valorPorKm;
  const custoHora = horasTrabalho * valorHora;
  return custoKm + custoHora;
}

/**
 * UTILITÁRIOS DE MOTORISTAS
 */

export function buscarMotoristasPorCategoria(motoristas: Motorista[], categoria: string): Motorista[] {
  return motoristas.filter(motorista => 
    motorista.categoriasCNH?.includes(categoria.toUpperCase())
  );
}

export function buscarMotoristasDisponiveis(motoristas: Motorista[]): Motorista[] {
  return motoristas.filter(motorista => {
    const disponibilidade = processarDisponibilidadeMotorista(motorista);
    return disponibilidade.disponivel;
  });
}

export function ordenarMotoristasPorExperiencia(motoristas: Motorista[]): Motorista[] {
  return motoristas.sort((a, b) => {
    const expA = a.dataContratacao ? calcularTempoExperiencia(new Date(a.dataContratacao)) : 0;
    const expB = b.dataContratacao ? calcularTempoExperiencia(new Date(b.dataContratacao)) : 0;
    return expB - expA; // Mais experiente primeiro
  });
}

export function gerarCodigoMotorista(nome: string, sequencial: number): string {
  const prefixo = nome.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const numero = sequencial.toString().padStart(3, '0');
  return `MOT-${prefixo}-${numero}`;
}