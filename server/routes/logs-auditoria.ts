/**
 * ROTAS DE LOGS DE AUDITORIA
 * 
 * Este arquivo contém todas as rotas relacionadas aos logs de auditoria:
 * - GET /api/logs-auditoria - Listar logs de auditoria
 * - GET /api/logs-auditoria/:id - Buscar log específico
 * - DELETE /api/logs-auditoria/:id - Excluir log (apenas admin)
 * 
 * MANUTENÇÃO:
 * - Todas as funções de validação estão em ../functions/logs-auditoria.ts
 * - Sistema de permissões: admin vê todos, usuário comum vê apenas os seus
 * - Middleware de autenticação obrigatório
 */

import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Middleware de autenticação para todas as rotas
router.use((req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
});

/**
 * GET /api/logs-auditoria
 * Lista logs de auditoria com filtros
 */
router.get("/", async (req: any, res) => {
  try {
    const usuarioId = req.query.usuarioId ? parseInt(req.query.usuarioId as string) : undefined;
    
    // Sistema de permissões: admin vê todos os logs, usuário comum vê apenas os seus
    const filtroUsuario = req.user?.tipo === 'admin' ? usuarioId : req.user?.id;
    
    const logs = await storage.getLogsAuditoria(filtroUsuario);
    res.json(logs);
  } catch (error: any) {
    console.error("Erro ao buscar logs de auditoria:", error);
    res.status(500).json({ message: "Erro ao buscar logs de auditoria" });
  }
});

/**
 * GET /api/logs-auditoria/:id
 * Busca um log específico
 */
router.get("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const log = await storage.getLogAuditoria(id);
    
    if (!log) {
      return res.status(404).json({ message: "Log não encontrado" });
    }
    
    // Verificar permissão: admin pode ver qualquer log, usuário comum apenas os seus
    if (req.user?.tipo !== 'admin' && log.usuarioId !== req.user?.id) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    
    res.json(log);
  } catch (error: any) {
    console.error("Erro ao buscar log:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/logs-auditoria/:id
 * Exclui um log (apenas admin)
 */
router.delete("/:id", async (req: any, res) => {
  try {
    // Verificar se é admin
    if (req.user?.tipo !== 'admin') {
      return res.status(403).json({ message: "Apenas administradores podem excluir logs" });
    }
    
    const id = parseInt(req.params.id);
    const log = await storage.getLogAuditoria(id);
    
    if (!log) {
      return res.status(404).json({ message: "Log não encontrado" });
    }
    
    await storage.deleteLogAuditoria(id);
    
    res.json({ message: "Log excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir log:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/logs-auditoria/cleanup
 * Limpa logs antigos (apenas admin)
 */
router.post("/cleanup", async (req: any, res) => {
  try {
    // Verificar se é admin
    if (req.user?.tipo !== 'admin') {
      return res.status(403).json({ message: "Apenas administradores podem limpar logs" });
    }
    
    const { diasParaManter = 90 } = req.body;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasParaManter);
    
    const logsRemovidosCount = await storage.cleanupLogsAuditoria(dataLimite);
    
    res.json({ 
      message: "Limpeza realizada com sucesso", 
      logsRemovidos: logsRemovidosCount 
    });
  } catch (error: any) {
    console.error("Erro ao limpar logs:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;