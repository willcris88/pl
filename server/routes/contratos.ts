/**
 * ROTAS DE CONTRATOS
 * 
 * Este arquivo contém todas as rotas relacionadas aos contratos:
 * - GET /api/contratos - Listar contratos
 * - GET /api/contratos/:id - Buscar contrato específico
 * - POST /api/contratos - Criar novo contrato
 * - PATCH /api/contratos/:id - Atualizar contrato
 * - DELETE /api/contratos/:id - Excluir contrato
 * 
 * MANUTENÇÃO:
 * - Todas as funções de validação estão em ../functions/contratos.ts
 * - Logs de auditoria são automáticos
 * - Middleware de autenticação obrigatório
 */

import { Router } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";
import { inserirContratoSchema } from "@shared/schema";

const router = Router();

// Middleware de autenticação para todas as rotas
router.use((req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
});

/**
 * GET /api/contratos
 * Lista contratos, com filtro opcional por ordem de serviço
 */
router.get("/", async (req: any, res) => {
  try {
    const ordemServicoId = req.query.ordemServicoId ? parseInt(req.query.ordemServicoId as string) : undefined;
    const contratos = await storage.getContratos(ordemServicoId);
    res.json(contratos);
  } catch (error: any) {
    console.error("Erro ao buscar contratos:", error);
    res.status(500).json({ message: "Erro ao buscar contratos" });
  }
});

/**
 * GET /api/contratos/:id
 * Busca um contrato específico
 */
router.get("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const contrato = await storage.getContrato(id);
    
    if (!contrato) {
      return res.status(404).json({ message: "Contrato não encontrado" });
    }
    
    res.json(contrato);
  } catch (error: any) {
    console.error("Erro ao buscar contrato:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/contratos
 * Cria um novo contrato
 */
router.post("/", async (req: any, res) => {
  try {
    const validatedData = inserirContratoSchema.parse(req.body);
    const contrato = await storage.createContrato(validatedData);
    
    // Log de auditoria
    await AuditLogger.logCreate("contratos", contrato.id, req, {
      numero: contrato.numero,
      valor: contrato.valor
    });
    
    res.status(201).json(contrato);
  } catch (error: any) {
    console.error("Erro ao criar contrato:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/contratos/:id
 * Atualiza um contrato existente
 */
router.patch("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = inserirContratoSchema.partial().parse(req.body);
    
    const contrato = await storage.updateContrato(id, validatedData);
    
    // Log de auditoria
    await AuditLogger.logUpdate("contratos", id, req, {
      numero: contrato.numero,
      alteracoes: Object.keys(validatedData).join(', ')
    });
    
    res.json(contrato);
  } catch (error: any) {
    console.error("Erro ao atualizar contrato:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/contratos/:id
 * Exclui um contrato
 */
router.delete("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const contrato = await storage.getContrato(id);
    
    if (!contrato) {
      return res.status(404).json({ message: "Contrato não encontrado" });
    }
    
    await storage.deleteContrato(id);
    
    // Log de auditoria
    await AuditLogger.logDelete("contratos", id, req, {
      numero: contrato.numero,
      valor: contrato.valor
    });
    
    res.json({ message: "Contrato excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir contrato:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;