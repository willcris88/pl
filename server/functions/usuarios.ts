/**
 * FUNÇÕES DE USUÁRIOS
 * 
 * Este arquivo contém todas as funções relacionadas ao gerenciamento de usuários:
 * - Validações de usuários e senhas
 * - Formatação de dados pessoais
 * - Processamento de permissões
 * - Cálculos de acesso e sessões
 * 
 * COMO USAR:
 * import { validarUsuario, formatarEmail } from '../functions/usuarios';
 * 
 * MANUTENÇÃO:
 * - Para validações: adicionar função com prefixo 'validar'
 * - Para formatações: adicionar função com prefixo 'formatar'
 * - Para processamento: adicionar função com prefixo 'processar'
 */

import { InserirUsuario, Usuario } from "@shared/schema";

/**
 * VALIDAÇÕES DE USUÁRIOS
 */

export function validarUsuario(dados: InserirUsuario): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
  }

  if (!dados.email || !validarFormatoEmail(dados.email)) {
    erros.push('Email é obrigatório e deve ter formato válido');
  }

  if (!dados.senha || dados.senha.length < 6) {
    erros.push('Senha é obrigatória e deve ter pelo menos 6 caracteres');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarSenhaSegura(senha: string): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  if (senha.length < 8) {
    erros.push('Senha deve ter pelo menos 8 caracteres');
  }

  if (!/[A-Z]/.test(senha)) {
    erros.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(senha)) {
    erros.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (!/[0-9]/.test(senha)) {
    erros.push('Senha deve conter pelo menos um número');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarFormatoEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * FORMATAÇÕES DE USUÁRIOS
 */

export function formatarNomeUsuario(nome: string): string {
  return nome
    .trim()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
}

export function formatarEmailUsuario(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * PROCESSAMENTO DE USUÁRIOS
 */

export function processarDadosUsuario(dados: InserirUsuario): InserirUsuario {
  return {
    ...dados,
    nome: formatarNomeUsuario(dados.nome),
    email: formatarEmailUsuario(dados.email),
    ativo: dados.ativo ?? true
  };
}

export function processarPermissoesUsuario(usuario: Usuario): {
  podeEditarTodos: boolean;
  podeExcluirTodos: boolean;
  podeVerRelatorios: boolean;
} {
  // Implementar lógica de permissões baseada no tipo/role do usuário
  const isAdmin = usuario.email?.includes('admin') || false;
  
  return {
    podeEditarTodos: isAdmin,
    podeExcluirTodos: isAdmin,
    podeVerRelatorios: isAdmin
  };
}

/**
 * CÁLCULOS DE USUÁRIOS
 */

export function calcularTempoSessao(loginTime: Date, currentTime: Date = new Date()): number {
  return Math.floor((currentTime.getTime() - loginTime.getTime()) / (1000 * 60)); // minutos
}

export function calcularUltimoAcesso(usuario: Usuario): string {
  if (!usuario.criadoEm) return 'Nunca';
  
  const agora = new Date();
  const ultimo = new Date(usuario.criadoEm);
  const diffMs = agora.getTime() - ultimo.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDias === 0) return 'Hoje';
  if (diffDias === 1) return 'Ontem';
  if (diffDias < 7) return `${diffDias} dias atrás`;
  if (diffDias < 30) return `${Math.floor(diffDias / 7)} semanas atrás`;
  
  return `${Math.floor(diffDias / 30)} meses atrás`;
}