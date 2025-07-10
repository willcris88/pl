/**
 * ROTAS DE PRODUTOS ORDEM DE SERVIÇO
 * 
 * Este arquivo contém todas as rotas relacionadas aos produtos de ordens de serviço:
 * - GET /api/produtos-os - Listar produtos OS
 * - GET /api/produtos-os/:id - Buscar produto OS específico
 * - POST /api/produtos-os - Criar novo produto OS
 * - PATCH /api/produtos-os/:id - Atualizar produto OS
 * - DELETE /api/produtos-os/:id - Excluir produto OS
 * 
 * MANUTENÇÃO:
 * - Todas as funções de validação estão em ../functions/produtos-os.ts
 * - Logs de auditoria são automáticos
 * - Middleware de autenticação obrigatório
 */

import { Router } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";

const router = Router();

// Middleware de autenticação para todas as rotas
router.use((req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
});

/**
 * GET /api/produtos-os
 * Lista produtos OS, com filtro opcional por ordem de serviço
 */
router.get("/", async (req: any, res) => {
  try {
    const ordemServicoId = req.query.ordemServicoId;
    console.log("Buscando produtos OS para ordem:", ordemServicoId);
    
    const produtosOs = await storage.getProdutosOs();
    console.log("Todos os produtos OS encontrados:", produtosOs.length);
    
    if (ordemServicoId) {
      // Filtrar por ordem de serviço
      const produtosFiltrados = produtosOs.filter(p => p.ordemServicoId === parseInt(ordemServicoId as string));
      console.log("Produtos filtrados para OS", ordemServicoId, ":", produtosFiltrados.length);
      console.log("Produtos encontrados:", produtosFiltrados);
      res.json(produtosFiltrados);
    } else {
      // Retornar todos
      console.log("Retornando todos os produtos OS:", produtosOs.length);
      res.json(produtosOs);
    }
  } catch (error: any) {
    console.error("Erro ao buscar produtos OS:", error);
    res.status(500).json({ message: "Erro ao buscar produtos OS" });
  }
});

/**
 * GET /api/produtos-os/:id
 * Busca um produto OS específico
 */
router.get("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const produtoOs = await storage.getProdutoOs(id);
    
    if (!produtoOs) {
      return res.status(404).json({ message: "Produto OS não encontrado" });
    }
    
    res.json(produtoOs);
  } catch (error: any) {
    console.error("Erro ao buscar produto OS:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/produtos-os
 * Cria um novo produto OS
 */
router.post("/", async (req: any, res) => {
  try {
    console.log("Recebendo dados para criar produto OS:", req.body);
    const data = req.body; // Usando validação direta
    const produtoOs = await storage.createProdutoOs(data);
    
    // Log específico para criação de produto OS
    if (req.user?.id) {
      await AuditLogger.logCreate(
        req.user.id,
        'produtos_os',
        produtoOs.id,
        produtoOs,
        `Criou novo produto OS: ${produtoOs.nome}`,
        req
      );
    }
    
    res.status(201).json(produtoOs);
  } catch (error: any) {
    console.error("Erro completo ao criar produto OS:", error);
    res.status(400).json({ message: "Dados inválidos", error: error.message, stack: error.stack });
  }
});

/**
 * PATCH /api/produtos-os/:id
 * Atualiza um produto OS existente
 */
router.patch("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const produtoOs = await storage.updateProdutoOs(id, data);
    
    // Log específico para atualização de produto OS
    if (req.user?.id) {
      await AuditLogger.logUpdate(
        req.user.id,
        'produtos_os',
        produtoOs.id,
        {},
        produtoOs,
        `Atualizou produto OS: ${produtoOs.nome}`,
        req
      );
    }
    
    res.json(produtoOs);
  } catch (error: any) {
    console.error("Erro ao atualizar produto OS:", error);
    res.status(400).json({ message: "Dados inválidos", error: error.message });
  }
});

/**
 * DELETE /api/produtos-os/:id
 * Exclui um produto OS
 */
router.delete("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const produtoOs = await storage.getProdutoOs(id);
    if (!produtoOs) {
      return res.status(404).json({ message: "Produto OS não encontrado" });
    }
    
    await storage.deleteProdutoOs(id);
    
    // Log específico para exclusão de produto OS
    if (req.user?.id) {
      await AuditLogger.logDelete(
        req.user.id,
        'produtos_os',
        id,
        produtoOs,
        `Excluiu produto OS: ${produtoOs.nome}`,
        req
      );
    }
    
    res.json({ message: "Produto OS excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir produto OS:", error);
    res.status(500).json({ message: "Erro ao excluir produto OS" });
  }
});

/**
 * POST /api/produtos-os/marcar-nc
 * Marca produtos como indisponíveis após criação da nota contratual
 */
router.post("/marcar-nc", async (req: any, res) => {
  try {
    const { ordemServicoId, notaContratualId, numeroNc } = req.body;
    
    console.log("Marcando produtos com NC:", { ordemServicoId, notaContratualId, numeroNc });
    
    // Atualizar todos os produtos da ordem de serviço que ainda estão disponíveis
    await storage.marcarProdutosComNC(ordemServicoId, notaContratualId, numeroNc);
    
    // Log de auditoria
    if (req.user?.id) {
      await AuditLogger.logUpdate(
        req.user.id,
        'produtos_ordem_servico',
        ordemServicoId,
        {},
        { numeroNc, notaContratualId },
        `Marcou produtos da OS ${ordemServicoId} com NC ${numeroNc}`,
        req
      );
    }
    
    res.json({ message: "Produtos marcados com sucesso" });
  } catch (error: any) {
    console.error("Erro ao marcar produtos:", error);
    res.status(500).json({ message: "Erro ao marcar produtos com NC" });
  }
});

export default router;