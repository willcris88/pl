/**
 * ROTAS DE PENDÊNCIAS
 * 
 * Este arquivo contém todas as rotas relacionadas às pendências:
 * - GET /api/pendencias - Listar pendências
 * - GET /api/pendencias/:id - Buscar pendência específica
 * - POST /api/pendencias - Criar nova pendência
 * - PATCH /api/pendencias/:id - Atualizar pendência
 * - DELETE /api/pendencias/:id - Excluir pendência
 * 
 * MANUTENÇÃO:
 * - Todas as funções de validação estão em ../functions/pendencias.ts
 * - Logs de auditoria são automáticos
 * - Middleware de autenticação obrigatório
 */

import { Router } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";
import { inserirPendenciaSchema } from "@shared/schema";

const router = Router();

// Middleware de autenticação para todas as rotas
router.use((req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
});

/**
 * GET /api/pendencias
 * Lista pendências, com filtro opcional por ordem de serviço
 */
router.get("/", async (req: any, res) => {
  try {
    const ordemServicoId = req.query.ordemServicoId ? parseInt(req.query.ordemServicoId as string) : undefined;
    const pendencias = await storage.getPendencias(ordemServicoId);
    res.json(pendencias);
  } catch (error: any) {
    console.error("Erro ao buscar pendências:", error);
    res.status(500).json({ message: "Erro ao buscar pendências" });
  }
});

/**
 * GET /api/pendencias/:id
 * Busca uma pendência específica
 */
router.get("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const pendencia = await storage.getPendencia(id);
    
    if (!pendencia) {
      return res.status(404).json({ message: "Pendência não encontrada" });
    }
    
    res.json(pendencia);
  } catch (error: any) {
    console.error("Erro ao buscar pendência:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/pendencias
 * Cria uma nova pendência
 */
router.post("/", async (req: any, res) => {
  try {
    console.log("Criando pendência:", req.body);
    const data = {
      ordemServicoId: req.body.ordemServicoId,
      tipo: req.body.tipo,
      status: req.body.status || "PENDENTE",
      usuario: req.body.usuario || "",
      descricao: req.body.descricao || ""
    };
    const pendencia = await storage.createPendencia(data);
    console.log("Pendência criada:", pendencia);
    
    // Log específico para criação de pendência
    if (req.user?.id) {
      await AuditLogger.logCreate(
        req.user.id,
        'pendencias',
        pendencia.id,
        pendencia,
        `Criou nova pendência: ${pendencia.tipo}`,
        req
      );
    }
    
    res.status(201).json(pendencia);
  } catch (error: any) {
    console.error("Erro ao criar pendência:", error);
    res.status(400).json({ message: "Dados inválidos", error: error.message });
  }
});

/**
 * PATCH /api/pendencias/:id
 * Atualiza uma pendência existente
 */
router.patch("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = inserirPendenciaSchema.partial().parse(req.body);
    
    const pendencia = await storage.updatePendencia(id, validatedData);
    
    // Log de auditoria
    await AuditLogger.logUpdate("pendencias", id, req, {
      tipo: pendencia.tipo,
      alteracoes: Object.keys(validatedData).join(', ')
    });
    
    res.json(pendencia);
  } catch (error: any) {
    console.error("Erro ao atualizar pendência:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/pendencias/:id
 * Exclui uma pendência
 */
router.delete("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const pendencia = await storage.getPendencia(id);
    
    if (!pendencia) {
      return res.status(404).json({ message: "Pendência não encontrada" });
    }
    
    await storage.deletePendencia(id);
    
    // Log de auditoria
    await AuditLogger.logDelete("pendencias", id, req, {
      tipo: pendencia.tipo,
      status: pendencia.status
    });
    
    res.json({ message: "Pendência excluída com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir pendência:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;