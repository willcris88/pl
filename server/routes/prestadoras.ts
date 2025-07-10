/**
 * ROTAS DE PRESTADORAS
 * 
 * Este arquivo contém todas as rotas relacionadas às prestadoras:
 * - GET /api/prestadoras - Listar prestadoras
 * - GET /api/prestadoras/:id - Buscar prestadora específica
 * - POST /api/prestadoras - Criar nova prestadora
 * - PATCH /api/prestadoras/:id - Atualizar prestadora
 * - DELETE /api/prestadoras/:id - Excluir prestadora
 * 
 * MANUTENÇÃO:
 * - Todas as funções de validação estão em ../functions/prestadoras.ts
 * - Logs de auditoria são automáticos
 * - Middleware de autenticação obrigatório
 */

import { Router } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";
import { inserirPrestadoraSchema } from "@shared/schema";

const router = Router();

// Middleware de autenticação para todas as rotas
router.use((req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
});

/**
 * GET /api/prestadoras
 * Lista todas as prestadoras
 */
router.get("/", async (req: any, res) => {
  try {
    const prestadoras = await storage.getPrestadoras();
    res.json(prestadoras);
  } catch (error: any) {
    console.error("Erro ao buscar prestadoras:", error);
    res.status(500).json({ message: "Erro ao buscar prestadoras" });
  }
});

/**
 * GET /api/prestadoras/:id
 * Busca uma prestadora específica
 */
router.get("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const prestadora = await storage.getPrestadora(id);
    
    if (!prestadora) {
      return res.status(404).json({ message: "Prestadora não encontrada" });
    }
    
    res.json(prestadora);
  } catch (error: any) {
    console.error("Erro ao buscar prestadora:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/prestadoras
 * Cria uma nova prestadora
 */
router.post("/", async (req: any, res) => {
  try {
    const validatedData = inserirPrestadoraSchema.parse(req.body);
    const prestadora = await storage.createPrestadora(validatedData);
    
    // Log de auditoria
    await AuditLogger.logCreate("prestadoras", prestadora.id, req, {
      nome: prestadora.nome,
      cnpj: prestadora.cnpj
    });
    
    res.status(201).json(prestadora);
  } catch (error: any) {
    console.error("Erro ao criar prestadora:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/prestadoras/:id
 * Atualiza uma prestadora existente
 */
router.patch("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = inserirPrestadoraSchema.partial().parse(req.body);
    
    const prestadora = await storage.updatePrestadora(id, validatedData);
    
    // Log de auditoria
    await AuditLogger.logUpdate("prestadoras", id, req, {
      nome: prestadora.nome,
      alteracoes: Object.keys(validatedData).join(', ')
    });
    
    res.json(prestadora);
  } catch (error: any) {
    console.error("Erro ao atualizar prestadora:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/prestadoras/:id
 * Exclui uma prestadora
 */
router.delete("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const prestadora = await storage.getPrestadora(id);
    
    if (!prestadora) {
      return res.status(404).json({ message: "Prestadora não encontrada" });
    }
    
    await storage.deletePrestadora(id);
    
    // Log de auditoria
    await AuditLogger.logDelete("prestadoras", id, req, {
      nome: prestadora.nome,
      cnpj: prestadora.cnpj
    });
    
    res.json({ message: "Prestadora excluída com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir prestadora:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;