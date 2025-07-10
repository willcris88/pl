/**
 * ROTAS DE ORDENS DE SERVIÇO
 * 
 * Este arquivo contém todas as rotas relacionadas ao gerenciamento de ordens de serviço:
 * - GET /api/ordens-servico - Listar todas as ordens
 * - GET /api/ordens-servico/:id - Buscar ordem específica
 * - POST /api/ordens-servico - Criar nova ordem
 * - PATCH /api/ordens-servico/:id - Atualizar ordem existente
 * - DELETE /api/ordens-servico/:id - Excluir ordem
 * 
 * Rotas relacionadas:
 * - Contratos, Pendências, Motoristas, Documentos, Produtos OS
 * 
 * Todas as rotas incluem validação, auditoria e tratamento de erros
 */

import { Router } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";
import { inserirOrdemServicoSchema, inserirContratoSchema, inserirPendenciaSchema, inserirMotoristaSchema, inserirDocumentoSchema, inserirProdutoOsSchema } from "../../shared/schema";

const router = Router();

// Middleware de autenticação
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

router.use(requireAuth);

// ===== ORDENS DE SERVIÇO =====

/**
 * GET /api/ordens-servico
 * Lista todas as ordens de serviço
 */
router.get("/", async (req, res) => {
  try {
    const ordens = await storage.getOrdensServico(req.query);
    res.json(ordens);
  } catch (error: any) {
    console.error("Erro ao buscar ordens:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * GET /api/ordens-servico/:id
 * Busca uma ordem específica
 */
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ordem = await storage.getOrdemServico(id);
    
    if (!ordem) {
      return res.status(404).json({ message: "Ordem não encontrada" });
    }
    
    res.json(ordem);
  } catch (error: any) {
    console.error("Erro ao buscar ordem:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/ordens-servico
 * Cria nova ordem de serviço
 */
router.post("/", async (req, res) => {
  try {
    const validatedData = inserirOrdemServicoSchema.parse(req.body);
    const novaOrdem = await storage.createOrdemServico(validatedData);
    
    await AuditLogger.logCreate("ordens_servico", novaOrdem.id, req);
    
    res.status(201).json(novaOrdem);
  } catch (error: any) {
    console.error("Erro ao criar ordem:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/ordens-servico/:id
 * Atualiza ordem existente
 */
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = inserirOrdemServicoSchema.partial().parse(req.body);
    
    const ordemAtualizada = await storage.updateOrdemServico(id, validatedData);
    
    await AuditLogger.logUpdate("ordens_servico", id, req);
    
    res.json(ordemAtualizada);
  } catch (error: any) {
    console.error("Erro ao atualizar ordem:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/ordens-servico/:id
 * Exclui ordem de serviço
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteOrdemServico(id);
    
    await AuditLogger.logDelete("ordens_servico", id, req);
    
    res.json({ message: "Ordem excluída com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir ordem:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// ===== CONTRATOS =====

/**
 * GET /api/ordens-servico/:id/contratos
 * Lista contratos de uma ordem
 */
router.get("/:id/contratos", async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.params.id);
    const contratos = await storage.getContratos(ordemServicoId);
    res.json(contratos);
  } catch (error: any) {
    console.error("Erro ao buscar contratos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/ordens-servico/:id/contratos
 * Cria novo contrato para a ordem
 */
router.post("/:id/contratos", async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.params.id);
    const validatedData = inserirContratoSchema.parse({
      ...req.body,
      ordemServicoId
    });
    
    const novoContrato = await storage.createContrato(validatedData);
    
    await AuditLogger.logCreate("contratos", novoContrato.id, req);
    
    res.status(201).json(novoContrato);
  } catch (error: any) {
    console.error("Erro ao criar contrato:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// ===== PENDÊNCIAS =====

/**
 * GET /api/ordens-servico/:id/pendencias
 * Lista pendências de uma ordem
 */
router.get("/:id/pendencias", async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.params.id);
    if (isNaN(ordemServicoId)) {
      return res.status(400).json({ message: "ID de ordem inválido" });
    }
    const pendencias = await storage.getPendencias(ordemServicoId);
    res.json(pendencias);
  } catch (error: any) {
    console.error("Erro ao buscar pendências:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/ordens-servico/:id/pendencias
 * Cria nova pendência
 */
router.post("/:id/pendencias", async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.params.id);
    const validatedData = inserirPendenciaSchema.parse({
      ...req.body,
      ordemServicoId
    });
    
    const novaPendencia = await storage.createPendencia(validatedData);
    
    await AuditLogger.logCreate("pendencias", novaPendencia.id, req);
    
    res.status(201).json(novaPendencia);
  } catch (error: any) {
    console.error("Erro ao criar pendência:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/ordens-servico/:id/pendencias/:pendenciaId
 * Exclui pendência de uma ordem de serviço
 */
router.delete("/:id/pendencias/:pendenciaId", async (req, res) => {
  try {
    const id = parseInt(req.params.pendenciaId);
    await storage.deletePendencia(id);
    
    await AuditLogger.logDelete("pendencias", id, req);
    
    res.json({ message: "Pendência excluída com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir pendência:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * PUT /api/ordens-servico/:id/pendencias/:pendenciaId
 * Atualiza pendência de uma ordem de serviço
 */
router.put("/:id/pendencias/:pendenciaId", async (req, res) => {
  try {
    const id = parseInt(req.params.pendenciaId);
    const validatedData = inserirPendenciaSchema.partial().parse(req.body);
    
    const pendencia = await storage.updatePendencia(id, validatedData);
    
    await AuditLogger.logUpdate("pendencias", id, req, {
      tipo: pendencia.tipo,
      alteracoes: Object.keys(validatedData).join(', ')
    });
    
    res.json(pendencia);
  } catch (error: any) {
    console.error("Erro ao atualizar pendência:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// ===== MOTORISTAS =====

/**
 * GET /api/ordens-servico/:id/motoristas
 * Lista motoristas de uma ordem
 */
router.get("/:id/motoristas", async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.params.id);
    const motoristas = await storage.getMotoristas(ordemServicoId);
    res.json(motoristas);
  } catch (error: any) {
    console.error("Erro ao buscar motoristas:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/ordens-servico/:id/motoristas
 * Adiciona motorista à ordem
 */
router.post("/:id/motoristas", async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.params.id);
    const validatedData = inserirMotoristaSchema.parse({
      ...req.body,
      ordemServicoId
    });
    
    const novoMotorista = await storage.createMotorista(validatedData);
    
    await AuditLogger.logCreate("motoristas", novoMotorista.id, req);
    
    res.status(201).json(novoMotorista);
  } catch (error: any) {
    console.error("Erro ao adicionar motorista:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// ===== DOCUMENTOS =====

/**
 * GET /api/ordens-servico/:id/documentos
 * Lista documentos de uma ordem
 */
router.get("/:id/documentos", async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.params.id);
    const documentos = await storage.getDocumentos(ordemServicoId);
    res.json(documentos);
  } catch (error: any) {
    console.error("Erro ao buscar documentos:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/ordens-servico/:id/documentos
 * Adiciona documento à ordem
 */
router.post("/:id/documentos", async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.params.id);
    const validatedData = inserirDocumentoSchema.parse({
      ...req.body,
      ordemServicoId
    });
    
    const novoDocumento = await storage.createDocumento(validatedData);
    
    await AuditLogger.logCreate("documentos", novoDocumento.id, req);
    
    res.status(201).json(novoDocumento);
  } catch (error: any) {
    console.error("Erro ao adicionar documento:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// ===== PRODUTOS OS =====

/**
 * GET /api/produtos-os
 * Lista produtos para ordens de serviço
 */
router.get("/produtos-os", async (req, res) => {
  try {
    const produtos = await storage.getProdutosOs();
    res.json(produtos);
  } catch (error: any) {
    console.error("Erro ao buscar produtos OS:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/produtos-os
 * Cria produto para ordem de serviço
 */
router.post("/produtos-os", async (req, res) => {
  try {
    const validatedData = inserirProdutoOsSchema.parse(req.body);
    const novoProduto = await storage.createProdutoOs(validatedData);
    
    await AuditLogger.logCreate("produtos_ordem_servico", novoProduto.id, req);
    
    res.status(201).json(novoProduto);
  } catch (error: any) {
    console.error("Erro ao criar produto OS:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;