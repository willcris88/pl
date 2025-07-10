/**
 * ROTAS DE PRODUTOS
 * 
 * Este arquivo contém todas as rotas relacionadas aos produtos:
 * - GET /api/produtos - Listar produtos
 * - GET /api/produtos/:id - Buscar produto específico
 * - POST /api/produtos - Criar novo produto
 * - PATCH /api/produtos/:id - Atualizar produto
 * - DELETE /api/produtos/:id - Excluir produto
 * - GET /api/produtos/:produtoId/fornecedores - Fornecedores do produto
 * - POST /api/produtos/:produtoId/fornecedores - Vincular fornecedor
 * 
 * MANUTENÇÃO:
 * - Todas as funções de validação estão em ../functions/produtos.ts
 * - Logs de auditoria são automáticos
 * - Middleware de autenticação obrigatório
 */

import { Router } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";
import { inserirProdutoSchema } from "@shared/schema";

const router = Router();

// Middleware de autenticação para todas as rotas
router.use((req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
});

/**
 * GET /api/produtos
 * Lista todos os produtos
 */
router.get("/", async (req: any, res) => {
  try {
    const produtos = await storage.getProdutos();
    res.json(produtos);
  } catch (error: any) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro ao buscar produtos" });
  }
});

/**
 * GET /api/produtos/:id
 * Busca um produto específico
 */
router.get("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const produto = await storage.getProduto(id);
    
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    
    res.json(produto);
  } catch (error: any) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/produtos
 * Cria um novo produto
 */
router.post("/", async (req: any, res) => {
  try {
    const data = inserirProdutoSchema.parse(req.body);
    const produto = await storage.createProduto(data);
    
    // Log específico para criação de produto
    if (req.user?.id) {
      await AuditLogger.logCreate(
        req.user.id,
        'produtos',
        produto.id,
        produto,
        `Criou novo produto: ${produto.nome}`,
        req
      );
    }
    
    res.status(201).json(produto);
  } catch (error: any) {
    console.error("Erro ao criar produto:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(400).json({ message: "Dados inválidos", error: error.message });
  }
});

/**
 * PATCH /api/produtos/:id
 * Atualiza um produto existente
 */
router.patch("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const produto = await storage.updateProduto(id, data);
    
    // Log específico para atualização de produto
    if (req.user?.id) {
      await AuditLogger.logUpdate(
        req.user.id,
        'produtos',
        produto.id,
        {},
        produto,
        `Atualizou produto: ${produto.nome}`,
        req
      );
    }
    
    res.json(produto);
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error);
    res.status(400).json({ message: "Dados inválidos", error: error.message });
  }
});

/**
 * DELETE /api/produtos/:id
 * Exclui um produto
 */
router.delete("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const produto = await storage.getProduto(id);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    
    await storage.deleteProduto(id);
    
    // Log específico para exclusão de produto
    if (req.user?.id) {
      await AuditLogger.logDelete(
        req.user.id,
        'produtos',
        id,
        produto,
        `Excluiu produto: ${produto.nome}`,
        req
      );
    }
    
    res.json({ message: "Produto excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir produto:", error);
    res.status(500).json({ message: "Erro ao excluir produto" });
  }
});

/**
 * GET /api/produtos/:produtoId/fornecedores
 * Lista fornecedores de um produto
 */
router.get("/:produtoId/fornecedores", async (req: any, res) => {
  try {
    const produtoId = parseInt(req.params.produtoId);
    const produtosFornecedores = await storage.getProdutosFornecedores(produtoId);
    res.json(produtosFornecedores);
  } catch (error: any) {
    console.error("Erro ao buscar fornecedores do produto:", error);
    res.status(500).json({ message: "Erro ao buscar fornecedores do produto" });
  }
});

/**
 * POST /api/produtos/:produtoId/fornecedores
 * Vincula um fornecedor a um produto
 */
router.post("/:produtoId/fornecedores", async (req: any, res) => {
  try {
    const produtoId = parseInt(req.params.produtoId);
    const data = { ...req.body, produtoId };
    const produtoFornecedor = await storage.createProdutoFornecedor(data);
    
    // Log específico para criação de produto-fornecedor
    if (req.user?.id) {
      await AuditLogger.logCreate(
        req.user.id,
        'produtos_fornecedores',
        produtoFornecedor.id,
        produtoFornecedor,
        `Vinculou fornecedor ao produto`,
        req
      );
    }
    
    res.status(201).json(produtoFornecedor);
  } catch (error: any) {
    console.error("Erro ao vincular fornecedor:", error);
    res.status(400).json({ message: "Dados inválidos", error: error.message });
  }
});

export default router;