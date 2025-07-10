/**
 * ROTAS DE FORNECEDORES
 * 
 * Este arquivo contém todas as rotas relacionadas ao gerenciamento de fornecedores:
 * - GET /api/fornecedores - Listar todos os fornecedores
 * - GET /api/fornecedores/:id - Buscar fornecedor específico
 * - POST /api/fornecedores - Criar novo fornecedor
 * - PATCH /api/fornecedores/:id - Atualizar fornecedor existente
 * - DELETE /api/fornecedores/:id - Excluir fornecedor
 * 
 * Funcionalidades:
 * - Validação de CNPJ
 * - Controle de status (ativo/inativo)
 * - Logs de auditoria completos
 * - Tratamento de erros padronizado
 */

import { Router } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";
import { inserirFornecedorSchema } from "../../shared/schema";

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
 * GET /api/fornecedores
 * Lista todos os fornecedores
 * Query params opcionais:
 * - status: filtrar por status (0=inativo, 1=ativo)
 * - search: busca textual por nome, CNPJ ou responsável
 */
router.get("/", async (req, res) => {
  try {
    const fornecedores = await storage.getFornecedores();
    
    // Aplicar filtros se fornecidos
    let filteredFornecedores = fornecedores;
    
    if (req.query.status) {
      const status = parseInt(req.query.status as string);
      filteredFornecedores = filteredFornecedores.filter(f => f.status === status);
    }
    
    if (req.query.search) {
      const search = (req.query.search as string).toLowerCase();
      filteredFornecedores = filteredFornecedores.filter(f => 
        f.nome?.toLowerCase().includes(search) ||
        f.cnpj?.toLowerCase().includes(search) ||
        f.responsavel?.toLowerCase().includes(search)
      );
    }
    
    res.json(filteredFornecedores);
  } catch (error: any) {
    console.error("Erro ao buscar fornecedores:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * GET /api/fornecedores/:id
 * Busca um fornecedor específico pelo ID
 */
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const fornecedor = await storage.getFornecedor(id);
    
    if (!fornecedor) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }
    
    res.json(fornecedor);
  } catch (error: any) {
    console.error("Erro ao buscar fornecedor:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/fornecedores
 * Cria um novo fornecedor
 * Validações automáticas:
 * - CNPJ único no sistema
 * - Campos obrigatórios
 * - Formato de dados
 */
router.post("/", async (req, res) => {
  try {
    const validatedData = inserirFornecedorSchema.parse(req.body);
    
    // Verificar se CNPJ já existe (se fornecido)
    if (validatedData.cnpj) {
      const fornecedores = await storage.getFornecedores();
      const cnpjExiste = fornecedores.some(f => f.cnpj === validatedData.cnpj);
      
      if (cnpjExiste) {
        return res.status(400).json({ 
          message: "CNPJ já cadastrado no sistema" 
        });
      }
    }
    
    const novoFornecedor = await storage.createFornecedor(validatedData);
    
    // Log de auditoria
    await AuditLogger.logCreate("fornecedores", novoFornecedor.id, req);
    
    res.status(201).json(novoFornecedor);
  } catch (error: any) {
    console.error("Erro ao criar fornecedor:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ 
        message: "Dados inválidos", 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/fornecedores/:id
 * Atualiza um fornecedor existente
 * Permite atualização parcial dos dados
 */
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = inserirFornecedorSchema.partial().parse(req.body);
    
    // Verificar se fornecedor existe
    const fornecedorExistente = await storage.getFornecedor(id);
    if (!fornecedorExistente) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }
    
    // Verificar CNPJ único (se sendo alterado)
    if (validatedData.cnpj && validatedData.cnpj !== fornecedorExistente.cnpj) {
      const fornecedores = await storage.getFornecedores();
      const cnpjExiste = fornecedores.some(f => f.cnpj === validatedData.cnpj && f.id !== id);
      
      if (cnpjExiste) {
        return res.status(400).json({ 
          message: "CNPJ já cadastrado para outro fornecedor" 
        });
      }
    }
    
    const fornecedorAtualizado = await storage.updateFornecedor(id, validatedData);
    
    // Log de auditoria
    await AuditLogger.logUpdate("fornecedores", id, req);
    
    res.json(fornecedorAtualizado);
  } catch (error: any) {
    console.error("Erro ao atualizar fornecedor:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ 
        message: "Dados inválidos", 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/fornecedores/:id
 * Exclui um fornecedor
 * ATENÇÃO: Exclusão em cascata - remove também produtos associados
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar se fornecedor existe
    const fornecedor = await storage.getFornecedor(id);
    if (!fornecedor) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }
    
    // Verificar se há produtos associados
    const produtos = await storage.getProdutos();
    const produtosAssociados = produtos.filter(p => p.fornecedorId === id);
    
    if (produtosAssociados.length > 0) {
      return res.status(400).json({ 
        message: `Não é possível excluir. Fornecedor possui ${produtosAssociados.length} produto(s) associado(s).`,
        produtosAssociados: produtosAssociados.map(p => ({ id: p.id, nome: p.nome }))
      });
    }
    
    await storage.deleteFornecedor(id);
    
    // Log de auditoria
    await AuditLogger.logDelete("fornecedores", id, req);
    
    res.json({ 
      message: "Fornecedor excluído com sucesso",
      fornecedorExcluido: {
        id: fornecedor.id,
        nome: fornecedor.nome,
        cnpj: fornecedor.cnpj
      }
    });
  } catch (error: any) {
    console.error("Erro ao excluir fornecedor:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/fornecedores/:id/status
 * Alterna o status do fornecedor (ativo/inativo)
 * Rota de conveniência para ativação/desativação rápida
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const fornecedor = await storage.getFornecedor(id);
    
    if (!fornecedor) {
      return res.status(404).json({ message: "Fornecedor não encontrado" });
    }
    
    const novoStatus = fornecedor.status === 1 ? 0 : 1;
    const fornecedorAtualizado = await storage.updateFornecedor(id, { status: novoStatus });
    
    // Log de auditoria
    await AuditLogger.logUpdate("fornecedores", id, req, {
      acao: `Status alterado para ${novoStatus === 1 ? 'ATIVO' : 'INATIVO'}`
    });
    
    res.json({
      message: `Fornecedor ${novoStatus === 1 ? 'ativado' : 'desativado'} com sucesso`,
      fornecedor: fornecedorAtualizado
    });
  } catch (error: any) {
    console.error("Erro ao alterar status do fornecedor:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;