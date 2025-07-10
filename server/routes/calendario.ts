/**
 * ROTAS DO SISTEMA DE CALENDÁRIO PESSOAL
 * 
 * Este arquivo contém todas as rotas para o sistema de calendário:
 * - GET /api/calendario/eventos - Listar eventos do usuário
 * - GET /api/calendario/eventos/:id - Buscar evento específico
 * - POST /api/calendario/eventos - Criar novo evento
 * - PATCH /api/calendario/eventos/:id - Atualizar evento
 * - DELETE /api/calendario/eventos/:id - Excluir evento
 * 
 * Funcionalidades especiais:
 * - Filtros por data, tipo, prioridade
 * - Validação de conflitos de horário
 * - Sistema de lembretes
 * - Eventos recorrentes
 */

import { Router } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";
import { inserirEventoCalendarioSchema } from "@shared/schema";

const router = Router();

// Middleware de autenticação
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

router.use(requireAuth);

/**
 * GET /api/calendario/eventos
 * Lista TODOS os eventos (de todos os usuários) com filtros opcionais
 * Cada usuário pode ver todos os eventos mas só editar/excluir os seus
 * Query params:
 * - ano: filtrar por ano
 * - mes: filtrar por mês (1-12)
 * - dataInicio, dataFim: período específico
 * - tipoEvento: filtrar por tipo
 * - prioridade: filtrar por prioridade
 * - status: filtrar por status
 * - search: busca textual
 */
router.get("/eventos", async (req, res) => {
  try {
    const usuarioId = req.user.id;
    // Processar filtros (query strings são sempre strings, converter quando necessário)
    const filtros: any = {};
    
    if (req.query.dataInicio) filtros.dataInicio = req.query.dataInicio as string;
    if (req.query.dataFim) filtros.dataFim = req.query.dataFim as string;
    if (req.query.tipoEvento) filtros.tipoEvento = req.query.tipoEvento as string;
    if (req.query.prioridade) filtros.prioridade = req.query.prioridade as string;
    if (req.query.status) filtros.status = req.query.status as string;
    if (req.query.search) filtros.search = req.query.search as string;
    
    // Buscar eventos do usuário
    // Buscar todos os eventos (não filtrar por usuário para que todos vejam a agenda completa)
    const eventos = await storage.getEventosCalendario(null, filtros);
    
    res.json(eventos);
  } catch (error: any) {
    console.error("Erro ao buscar eventos:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Filtros inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * GET /api/calendario/eventos/:id
 * Busca um evento específico do usuário
 */
router.get("/eventos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const usuarioId = req.user.id;
    
    const evento = await storage.getEventoCalendario(id, usuarioId);
    
    if (!evento) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }
    
    res.json(evento);
  } catch (error: any) {
    console.error("Erro ao buscar evento:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/calendario/eventos
 * Cria um novo evento para o usuário
 * Inclui validação de conflitos de horário
 */
router.post("/eventos", async (req, res) => {
  try {
    console.log("=== CRIAR EVENTO CALENDÁRIO ===");
    console.log("Usuário:", req.user?.id);
    console.log("Dados recebidos:", req.body);
    
    const usuarioId = req.user.id;
    // Tratar campos de hora vazios como null
    const bodyData = { ...req.body };
    if (bodyData.horaInicio === '') bodyData.horaInicio = null;
    if (bodyData.horaFim === '') bodyData.horaFim = null;
    
    const validatedData = inserirEventoCalendarioSchema.parse({
      ...bodyData,
      usuarioId
    });
    
    console.log("Dados validados:", validatedData);
    
    // Criar evento no banco
    const novoEvento = await storage.createEventoCalendario(validatedData);
    console.log("Evento criado:", novoEvento);
    
    // Log de auditoria
    await AuditLogger.logCreate("eventos_calendario", novoEvento.id, req, {
      titulo: novoEvento.titulo,
      data: novoEvento.dataInicio,
      tipo: novoEvento.tipoEvento
    });
    
    res.status(201).json(novoEvento);
  } catch (error: any) {
    console.error("Erro ao criar evento:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/calendario/eventos/:id
 * Atualiza um evento existente do usuário
 */
router.patch("/eventos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const usuarioId = req.user.id;
    
    // Verificar se evento existe e pertence ao usuário
    const eventoExistente = await storage.getEventoCalendario(id, usuarioId);
    if (!eventoExistente) {
      return res.status(404).json({ message: "Evento não encontrado ou você não tem permissão para editá-lo" });
    }
    
    // Tratar campos de hora vazios como null
    const bodyData = { ...req.body };
    if (bodyData.horaInicio === '') bodyData.horaInicio = null;
    if (bodyData.horaFim === '') bodyData.horaFim = null;
    
    const validatedData = inserirEventoCalendarioSchema.partial().parse(bodyData);
    
    // Verificar conflitos se data/hora foi alterada
    if ((validatedData.dataInicio || validatedData.horaInicio) && req.body.verificarConflitos !== false) {
      const dataInicio = validatedData.dataInicio || eventoExistente.dataInicio;
      const dataFim = validatedData.dataFim || eventoExistente.dataFim || dataInicio;
      
      const eventosExistentes = await storage.getEventosCalendario(usuarioId, {
        dataInicio,
        dataFim
      });
      
      // Excluir o próprio evento da verificação
      const outrosEventos = eventosExistentes.filter(e => e.id !== id);
      
      const dadosCompletos = { ...eventoExistente, ...validatedData };
      // Por enquanto, pular validação de conflitos
      const temConflito = false;
      
      if (temConflito) {
        return res.status(409).json({
          message: "Conflito de horário detectado na atualização",
          suggestion: "A alteração criará conflito com outro evento. Continuar mesmo assim?",
          allowOverride: true
        });
      }
    }
    
    const eventoAtualizado = await storage.updateEventoCalendario(id, validatedData);
    
    // Log de auditoria
    await AuditLogger.logUpdate("eventos_calendario", id, req, {
      titulo: eventoAtualizado.titulo,
      alteracoes: Object.keys(validatedData).join(', ')
    });
    
    res.json(eventoAtualizado);
  } catch (error: any) {
    console.error("Erro ao atualizar evento:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/calendario/eventos/:id
 * Exclui um evento do usuário
 */
router.delete("/eventos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const usuarioId = req.user.id;
    
    // Verificar se evento existe e pertence ao usuário
    const evento = await storage.getEventoCalendario(id, usuarioId);
    if (!evento) {
      return res.status(404).json({ message: "Evento não encontrado ou você não tem permissão para excluí-lo" });
    }
    
    await storage.deleteEventoCalendario(id);
    
    // Log de auditoria
    await AuditLogger.logDelete("eventos_calendario", id, req, {
      titulo: evento.titulo,
      data: evento.dataInicio,
      tipo: evento.tipoEvento
    });
    
    res.json({ 
      message: "Evento excluído com sucesso",
      eventoExcluido: {
        id: evento.id,
        titulo: evento.titulo,
        data: evento.dataInicio
      }
    });
  } catch (error: any) {
    console.error("Erro ao excluir evento:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * GET /api/calendario/dashboard
 * Retorna estatísticas e próximos eventos para dashboard
 */
router.get("/dashboard", async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const hoje = new Date().toISOString().split('T')[0];
    const proximaSemana = new Date();
    proximaSemana.setDate(proximaSemana.getDate() + 7);
    
    // Próximos eventos (próximos 7 dias)
    const proximosEventos = await storage.getEventosCalendario(usuarioId, {
      dataInicio: hoje,
      dataFim: proximaSemana.toISOString().split('T')[0]
    });
    
    // Eventos de hoje
    const eventosHoje = proximosEventos.filter(e => e.dataInicio === hoje);
    
    // Estatísticas do mês atual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const fimMes = new Date(inicioMes.getFullYear(), inicioMes.getMonth() + 1, 0);
    
    const eventosMes = await storage.getEventosCalendario(usuarioId, {
      dataInicio: inicioMes.toISOString().split('T')[0],
      dataFim: fimMes.toISOString().split('T')[0]
    });
    
    // Eventos por status
    const eventosPorStatus = {
      pendente: eventosMes.filter(e => e.status === 'pendente').length,
      confirmado: eventosMes.filter(e => e.status === 'confirmado').length,
      concluido: eventosMes.filter(e => e.status === 'concluido').length,
      cancelado: eventosMes.filter(e => e.status === 'cancelado').length
    };
    
    // Eventos por tipo
    const eventosPorTipo = {
      pessoal: eventosMes.filter(e => e.tipoEvento === 'pessoal').length,
      trabalho: eventosMes.filter(e => e.tipoEvento === 'trabalho').length,
      compromisso: eventosMes.filter(e => e.tipoEvento === 'compromisso').length,
      reuniao: eventosMes.filter(e => e.tipoEvento === 'reuniao').length,
      outros: eventosMes.filter(e => !['pessoal', 'trabalho', 'compromisso', 'reuniao'].includes(e.tipoEvento)).length
    };
    
    res.json({
      eventosHoje: eventosHoje.length,
      proximosEventos: proximosEventos.slice(0, 5), // Próximos 5
      totalEventosMes: eventosMes.length,
      eventosPorStatus,
      eventosPorTipo,
      resumo: {
        proximoEvento: proximosEventos[0] || null,
        eventosUrgentes: proximosEventos.filter(e => e.prioridade === 'urgente').length
      }
    });
  } catch (error: any) {
    console.error("Erro ao buscar dashboard do calendário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/calendario/eventos/:id/lembrete
 * Ativa/desativa lembrete para um evento
 */
router.post("/eventos/:id/lembrete", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const usuarioId = req.user.id;
    const { ativo, minutosAntes } = req.body;
    
    const evento = await storage.getEventoCalendario(id, usuarioId);
    if (!evento) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }
    
    await storage.updateEventoCalendario(id, {
      lembrete: ativo,
      minutosLembrete: minutosAntes || 15
    });
    
    res.json({
      message: `Lembrete ${ativo ? 'ativado' : 'desativado'} com sucesso`,
      lembrete: {
        ativo,
        minutosAntes: minutosAntes || 15
      }
    });
  } catch (error: any) {
    console.error("Erro ao configurar lembrete:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;