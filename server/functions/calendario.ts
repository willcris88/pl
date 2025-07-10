/**
 * FUNÇÕES DE CALENDÁRIO PESSOAL
 * 
 * Este arquivo contém todas as funções relacionadas ao sistema de calendário:
 * - Validações de eventos e horários
 * - Detecção de conflitos
 * - Processamento de recorrências
 * - Cálculos de datas e lembretes
 * 
 * COMO USAR:
 * import { validarConflito, processarRecorrencia } from '../functions/calendario';
 * 
 * MANUTENÇÃO:
 * - Para validações: adicionar função com prefixo 'validar'
 * - Para processamento: adicionar função com prefixo 'processar'
 * - Para cálculos: adicionar função com prefixo 'calcular'
 */

import { InserirEventoCalendario, EventoCalendario } from "@shared/schema";

/**
 * VALIDAÇÕES DE EVENTOS
 */

export function validarEventoCalendario(dados: InserirEventoCalendario): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Validações obrigatórias
  if (!dados.titulo || dados.titulo.trim().length < 1) {
    erros.push('Título do evento é obrigatório');
  }

  if (!dados.dataInicio) {
    erros.push('Data de início é obrigatória');
  }

  // Validar data de fim se fornecida
  if (dados.dataInicio && dados.dataFim && dados.dataFim < dados.dataInicio) {
    erros.push('Data de fim não pode ser anterior à data de início');
  }

  // Validar horários se fornecidos
  if (!dados.diaInteiro && dados.dataInicio === dados.dataFim) {
    if (dados.horaInicio && dados.horaFim && dados.horaFim <= dados.horaInicio) {
      erros.push('Hora de fim deve ser posterior à hora de início');
    }
  }

  // Validar cor se fornecida
  if (dados.cor && !/^#[0-9A-Fa-f]{6}$/.test(dados.cor)) {
    erros.push('Cor deve estar no formato hexadecimal (#RRGGBB)');
  }

  // Validar minutos de lembrete
  if (dados.lembrete && dados.minutosLembrete && (dados.minutosLembrete < 1 || dados.minutosLembrete > 10080)) {
    erros.push('Minutos de lembrete deve estar entre 1 e 10080 (1 semana)');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

export function validarConflitosHorario(
  evento: InserirEventoCalendario,
  eventosExistentes: EventoCalendario[],
  excludirId?: number
): { temConflito: boolean; eventosConflitantes: EventoCalendario[] } {
  
  if (evento.diaInteiro) {
    return { temConflito: false, eventosConflitantes: [] };
  }

  const inicioEvento = new Date(`${evento.dataInicio}T${evento.horaInicio || "00:00"}`);
  const fimEvento = new Date(`${evento.dataFim || evento.dataInicio}T${evento.horaFim || "23:59"}`);

  const eventosConflitantes = eventosExistentes.filter(existente => {
    // Excluir o próprio evento se estiver editando
    if (excludirId && existente.id === excludirId) return false;
    
    // Eventos de dia inteiro não geram conflito
    if (existente.diaInteiro) return false;
    
    const inicioExistente = new Date(`${existente.dataInicio}T${existente.horaInicio || "00:00"}`);
    const fimExistente = new Date(`${existente.dataFim || existente.dataInicio}T${existente.horaFim || "23:59"}`);

    // Verificar sobreposição de horários
    return (inicioEvento < fimExistente && fimEvento > inicioExistente);
  });

  return {
    temConflito: eventosConflitantes.length > 0,
    eventosConflitantes
  };
}

/**
 * PROCESSAMENTO DE DADOS
 */

export function processarDadosEvento(dados: InserirEventoCalendario): InserirEventoCalendario {
  const dadosProcessados = { ...dados };

  // Normalizar título
  if (dadosProcessados.titulo) {
    dadosProcessados.titulo = dadosProcessados.titulo.trim();
  }

  // Limpar horários se for evento de dia inteiro
  if (dadosProcessados.diaInteiro) {
    dadosProcessados.horaInicio = undefined;
    dadosProcessados.horaFim = undefined;
  }

  // Definir data fim igual à início se não fornecida
  if (!dadosProcessados.dataFim) {
    dadosProcessados.dataFim = dadosProcessados.dataInicio;
  }

  // Definir cor padrão baseada no tipo
  if (!dadosProcessados.cor && dadosProcessados.tipoEvento) {
    dadosProcessados.cor = obterCorPadrao(dadosProcessados.tipoEvento);
  }

  // Processar participantes se fornecidos
  if (dadosProcessados.participantes) {
    dadosProcessados.participantes = processarParticipantes(dadosProcessados.participantes);
  }

  return dadosProcessados;
}

export function processarParticipantes(participantes: string): string {
  // Limpar e formatar lista de participantes
  return participantes
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .join(', ');
}

/**
 * RECORRÊNCIA DE EVENTOS
 */

export function gerarEventosRecorrentes(
  eventoBase: InserirEventoCalendario,
  dataLimite: Date
): InserirEventoCalendario[] {
  
  if (!eventoBase.recorrencia || eventoBase.recorrencia === 'nenhuma') {
    return [eventoBase];
  }

  const eventos: InserirEventoCalendario[] = [eventoBase];
  const dataInicio = new Date(eventoBase.dataInicio);
  let proximaData = new Date(dataInicio);

  while (proximaData <= dataLimite) {
    proximaData = calcularProximaOcorrencia(proximaData, eventoBase.recorrencia);
    
    if (proximaData <= dataLimite) {
      const novoEvento = {
        ...eventoBase,
        dataInicio: proximaData.toISOString().split('T')[0],
        dataFim: eventoBase.dataFim ? 
          new Date(proximaData.getTime() + (new Date(eventoBase.dataFim).getTime() - dataInicio.getTime()))
            .toISOString().split('T')[0] : undefined
      };
      
      eventos.push(novoEvento);
    }
  }

  return eventos;
}

export function calcularProximaOcorrencia(data: Date, tipoRecorrencia: string): Date {
  const proximaData = new Date(data);

  switch (tipoRecorrencia) {
    case 'diaria':
      proximaData.setDate(proximaData.getDate() + 1);
      break;
    case 'semanal':
      proximaData.setDate(proximaData.getDate() + 7);
      break;
    case 'mensal':
      proximaData.setMonth(proximaData.getMonth() + 1);
      break;
    case 'anual':
      proximaData.setFullYear(proximaData.getFullYear() + 1);
      break;
    default:
      proximaData.setDate(proximaData.getDate() + 1);
  }

  return proximaData;
}

/**
 * CÁLCULOS E UTILITÁRIOS
 */

export function calcularDuracaoEvento(evento: EventoCalendario): string {
  if (evento.diaInteiro) {
    const inicio = new Date(evento.dataInicio);
    const fim = new Date(evento.dataFim || evento.dataInicio);
    const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return dias === 1 ? '1 dia' : `${dias} dias`;
  }

  const inicioDateTime = new Date(`${evento.dataInicio}T${evento.horaInicio || "00:00"}`);
  const fimDateTime = new Date(`${evento.dataFim || evento.dataInicio}T${evento.horaFim || "23:59"}`);
  
  const diferencaMs = fimDateTime.getTime() - inicioDateTime.getTime();
  const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
  const minutos = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));

  if (horas === 0) {
    return `${minutos} min`;
  } else if (minutos === 0) {
    return `${horas}h`;
  } else {
    return `${horas}h ${minutos}min`;
  }
}

export function calcularTempoParaEvento(evento: EventoCalendario): string {
  const agora = new Date();
  const inicioEvento = new Date(`${evento.dataInicio}T${evento.horaInicio || "00:00"}`);
  
  if (inicioEvento < agora) {
    return 'Já começou';
  }

  const diferencaMs = inicioEvento.getTime() - agora.getTime();
  const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencaMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));

  if (dias > 0) {
    return `Em ${dias} dias`;
  } else if (horas > 0) {
    return `Em ${horas}h ${minutos}min`;
  } else {
    return `Em ${minutos} minutos`;
  }
}

export function obterCorPadrao(tipoEvento: string): string {
  const cores: Record<string, string> = {
    pessoal: '#3b82f6',     // azul
    trabalho: '#ef4444',    // vermelho
    compromisso: '#f97316', // laranja
    reuniao: '#8b5cf6',     // roxo
    tarefa: '#10b981',      // verde
    evento: '#ec4899',      // rosa
    feriado: '#6b7280',     // cinza
    outro: '#14b8a6'        // teal
  };

  return cores[tipoEvento] || '#3b82f6';
}

export function obterIconeEvento(tipoEvento: string): string {
  const icones: Record<string, string> = {
    pessoal: '👤',
    trabalho: '💼',
    compromisso: '📅',
    reuniao: '🤝',
    tarefa: '✅',
    evento: '🎉',
    feriado: '🎊',
    outro: '📌'
  };

  return icones[tipoEvento] || '📅';
}

/**
 * FILTROS E BUSCA
 */

export function filtrarEventosPorPeriodo(
  eventos: EventoCalendario[],
  dataInicio: string,
  dataFim: string
): EventoCalendario[] {
  return eventos.filter(evento => {
    const eventoInicio = evento.dataInicio;
    const eventoFim = evento.dataFim || evento.dataInicio;
    
    return (eventoInicio <= dataFim && eventoFim >= dataInicio);
  });
}

export function buscarEventos(eventos: EventoCalendario[], termo: string): EventoCalendario[] {
  const termoBusca = termo.toLowerCase();
  
  return eventos.filter(evento => 
    evento.titulo.toLowerCase().includes(termoBusca) ||
    evento.descricao?.toLowerCase().includes(termoBusca) ||
    evento.localizacao?.toLowerCase().includes(termoBusca) ||
    evento.participantes?.toLowerCase().includes(termoBusca)
  );
}

export function agruparEventosPorData(eventos: EventoCalendario[]): Record<string, EventoCalendario[]> {
  return eventos.reduce((grupos, evento) => {
    const data = evento.dataInicio;
    if (!grupos[data]) {
      grupos[data] = [];
    }
    grupos[data].push(evento);
    return grupos;
  }, {} as Record<string, EventoCalendario[]>);
}

/**
 * LEMBRETES E NOTIFICAÇÕES
 */

export function calcularDataLembrete(evento: EventoCalendario): Date | null {
  if (!evento.lembrete || !evento.minutosLembrete) return null;

  const inicioEvento = new Date(`${evento.dataInicio}T${evento.horaInicio || "00:00"}`);
  const dataLembrete = new Date(inicioEvento.getTime() - (evento.minutosLembrete * 60 * 1000));
  
  return dataLembrete;
}

export function obterEventosParaLembrete(eventos: EventoCalendario[]): EventoCalendario[] {
  const agora = new Date();
  const proximos30min = new Date(agora.getTime() + (30 * 60 * 1000));

  return eventos.filter(evento => {
    const dataLembrete = calcularDataLembrete(evento);
    return dataLembrete && dataLembrete >= agora && dataLembrete <= proximos30min;
  });
}

/**
 * CONSTANTES E CONFIGURAÇÕES
 */

export const TIPOS_EVENTO = [
  { value: 'pessoal', label: 'Pessoal', cor: '#3b82f6', icone: '👤' },
  { value: 'trabalho', label: 'Trabalho', cor: '#ef4444', icone: '💼' },
  { value: 'compromisso', label: 'Compromisso', cor: '#f97316', icone: '📅' },
  { value: 'reuniao', label: 'Reunião', cor: '#8b5cf6', icone: '🤝' },
  { value: 'tarefa', label: 'Tarefa', cor: '#10b981', icone: '✅' },
  { value: 'evento', label: 'Evento', cor: '#ec4899', icone: '🎉' },
  { value: 'feriado', label: 'Feriado', cor: '#6b7280', icone: '🎊' },
  { value: 'outro', label: 'Outro', cor: '#14b8a6', icone: '📌' }
];

export const PRIORIDADES = [
  { value: 'baixa', label: 'Baixa', cor: '#10b981' },
  { value: 'normal', label: 'Normal', cor: '#3b82f6' },
  { value: 'alta', label: 'Alta', cor: '#f97316' },
  { value: 'urgente', label: 'Urgente', cor: '#ef4444' }
];

export const STATUS_EVENTO = [
  { value: 'pendente', label: 'Pendente', cor: '#f59e0b' },
  { value: 'confirmado', label: 'Confirmado', cor: '#10b981' },
  { value: 'cancelado', label: 'Cancelado', cor: '#ef4444' },
  { value: 'concluido', label: 'Concluído', cor: '#6b7280' }
];

export const OPCOES_RECORRENCIA = [
  { value: 'nenhuma', label: 'Não repetir' },
  { value: 'diaria', label: 'Diariamente' },
  { value: 'semanal', label: 'Semanalmente' },
  { value: 'mensal', label: 'Mensalmente' },
  { value: 'anual', label: 'Anualmente' }
];

export const OPCOES_LEMBRETE = [
  { value: 5, label: '5 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 120, label: '2 horas antes' },
  { value: 1440, label: '1 dia antes' },
  { value: 2880, label: '2 dias antes' },
  { value: 10080, label: '1 semana antes' }
];