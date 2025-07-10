/**
 * ROTAS DE ÓBITOS
 * 
 * Este arquivo contém todas as rotas relacionadas ao gerenciamento de óbitos:
 * - GET /api/obitos - Listar todos os óbitos
 * - GET /api/obitos/:id - Buscar óbito específico
 * - POST /api/obitos - Criar novo óbito
 * - PATCH /api/obitos/:id - Atualizar óbito existente
 * - DELETE /api/obitos/:id - Excluir óbito
 * 
 * Todas as rotas incluem:
 * - Validação de autenticação
 * - Logs de auditoria automáticos
 * - Tratamento de erros padronizado
 * - Validação de dados com Zod
 */

import { Router } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";
import { inserirObitoSchema } from "../../shared/schema";

const router = Router();

// Middleware de autenticação para todas as rotas
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

router.use(requireAuth);

/**
 * GET /api/obitos
 * Lista todos os óbitos cadastrados
 */
router.get("/", async (req, res) => {
  try {
    const obitos = await storage.getObitos();
    res.json(obitos);
  } catch (error: any) {
    console.error("Erro ao buscar óbitos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * GET /api/obitos/:id
 * Busca um óbito específico pelo ID
 */
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const obito = await storage.getObito(id);
    
    if (!obito) {
      return res.status(404).json({ message: "Óbito não encontrado" });
    }
    
    res.json(obito);
  } catch (error: any) {
    console.error("Erro ao buscar óbito:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/obitos
 * Cria um novo óbito
 */
router.post("/", async (req, res) => {
  try {
    const validatedData = inserirObitoSchema.parse(req.body);
    const novoObito = await storage.createObito(validatedData);
    
    // Log de auditoria
    await AuditLogger.logCreate("obitos", novoObito.id, req);
    
    res.status(201).json(novoObito);
  } catch (error: any) {
    console.error("Erro ao criar óbito:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/obitos/:id
 * Atualiza um óbito existente
 */
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = inserirObitoSchema.partial().parse(req.body);
    
    const obitoAtualizado = await storage.updateObito(id, validatedData);
    
    // Log de auditoria
    await AuditLogger.logUpdate("obitos", id, req);
    
    res.json(obitoAtualizado);
  } catch (error: any) {
    console.error("Erro ao atualizar óbito:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/obitos/:id
 * Exclui um óbito
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteObito(id);
    
    // Log de auditoria
    await AuditLogger.logDelete("obitos", id, req);
    
    res.json({ message: "Óbito excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir óbito:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;