/**
 * ROTAS DE MOTORISTAS
 * 
 * Módulo responsável pelo gerenciamento completo de motoristas:
 * - Listagem de motoristas ativos para seleção
 * - CRUD completo de motoristas
 * - Autenticação e validação de motoristas
 * - Logs de auditoria integrados
 * 
 * FUNCIONALIDADES:
 * - GET /api/motoristas - Lista todos os motoristas ativos
 * - GET /api/motoristas/:id - Busca motorista específico
 * - POST /api/motoristas - Cria novo motorista
 * - PATCH /api/motoristas/:id - Atualiza motorista
 * - DELETE /api/motoristas/:id - Remove motorista
 */

import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { motoristas, inserirMotoristaSchema } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { AuditLogger } from "../audit-middleware";
import { hashPassword } from "../auth";

const router = Router();

// Middleware de autenticação
function requireAuth(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Acesso negado. Faça login para continuar." 
    });
  }
  next();
}

/**
 * GET /api/motoristas
 * Lista todos os motoristas ativos para seleção
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    console.log("Backend: Buscando motoristas ativos...");
    
    const resultado = await db.select({
      id: motoristas.id,
      nome: motoristas.nome,
      sobrenome: motoristas.sobrenome,
      telefone: motoristas.telefone,
      email: motoristas.email,
      cnh: motoristas.cnh,
      validadeCnh: motoristas.validadeCnh,
      ativo: motoristas.ativo,
      observacoes: motoristas.observacoes,
      criadoEm: motoristas.criadoEm
    }).from(motoristas)
      .where(eq(motoristas.ativo, true))
      .orderBy(motoristas.nome, motoristas.sobrenome);

    console.log("Backend: Motoristas encontrados:", resultado.length);
    console.log("Backend: Primeiros motoristas:", resultado.slice(0, 3));

    await AuditLogger.logAction(
      "READ",
      "motoristas",
      null,
      `Listagem de motoristas ativos - ${resultado.length} encontrados`,
      req.user.id,
      req
    );

    res.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao buscar motoristas"
    });
  }
});

/**
 * GET /api/motoristas/:id
 * Busca motorista específico por ID
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const motoristaId = parseInt(id);

    if (isNaN(motoristaId)) {
      return res.status(400).json({
        success: false,
        message: "ID do motorista inválido"
      });
    }

    const resultado = await db.select({
      id: motoristas.id,
      nome: motoristas.nome,
      sobrenome: motoristas.sobrenome,
      telefone: motoristas.telefone,
      email: motoristas.email,
      cnh: motoristas.cnh,
      validadeCnh: motoristas.validadeCnh,
      ativo: motoristas.ativo,
      observacoes: motoristas.observacoes,
      criadoEm: motoristas.criadoEm
    }).from(motoristas)
      .where(eq(motoristas.id, motoristaId))
      .limit(1);

    if (resultado.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Motorista não encontrado"
      });
    }

    await AuditLogger.logAction(
      "READ",
      "motoristas",
      motoristaId,
      `Visualização do motorista: ${resultado[0].nome} ${resultado[0].sobrenome}`,
      req.user.id,
      req
    );

    res.json({
      success: true,
      data: resultado[0]
    });
  } catch (error) {
    console.error("Erro ao buscar motorista:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao buscar motorista"
    });
  }
});

/**
 * POST /api/motoristas
 * Cria novo motorista
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    // Validação dos dados com Zod
    const dadosValidados = inserirMotoristaSchema.parse(req.body);
    
    // Criptografar senha
    const senhaCriptografada = await hashPassword(dadosValidados.senha);
    
    // Inserir no banco
    const resultado = await db.insert(motoristas).values({
      ...dadosValidados,
      senha: senhaCriptografada
    }).returning();

    await AuditLogger.logCreate(
      "motoristas",
      resultado[0].id,
      resultado[0],
      `Motorista criado: ${resultado[0].nome} ${resultado[0].sobrenome}`,
      req.user.id,
      req
    );

    // Remover senha do retorno
    const { senha, ...motoristaSeguro } = resultado[0];

    res.status(201).json({
      success: true,
      data: motoristaSeguro,
      message: "Motorista criado com sucesso"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors
      });
    }

    console.error("Erro ao criar motorista:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao criar motorista"
    });
  }
});

/**
 * PATCH /api/motoristas/:id
 * Atualiza motorista existente
 */
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const motoristaId = parseInt(id);

    if (isNaN(motoristaId)) {
      return res.status(400).json({
        success: false,
        message: "ID do motorista inválido"
      });
    }

    // Buscar dados anteriores para auditoria
    const dadosAnteriores = await db.select()
      .from(motoristas)
      .where(eq(motoristas.id, motoristaId))
      .limit(1);

    if (dadosAnteriores.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Motorista não encontrado"
      });
    }

    const dadosAtualizacao = { ...req.body };
    
    // Se incluir senha, criptografar
    if (dadosAtualizacao.senha) {
      dadosAtualizacao.senha = await hashPassword(dadosAtualizacao.senha);
    }

    // Adicionar timestamp de atualização
    dadosAtualizacao.atualizadoEm = new Date();

    // Atualizar no banco
    const resultado = await db.update(motoristas)
      .set(dadosAtualizacao)
      .where(eq(motoristas.id, motoristaId))
      .returning();

    await AuditLogger.logUpdate(
      "motoristas",
      motoristaId,
      dadosAnteriores[0],
      resultado[0],
      `Motorista atualizado: ${resultado[0].nome} ${resultado[0].sobrenome}`,
      req.user.id,
      req
    );

    // Remover senha do retorno
    const { senha, ...motoristaSeguro } = resultado[0];

    res.json({
      success: true,
      data: motoristaSeguro,
      message: "Motorista atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar motorista:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao atualizar motorista"
    });
  }
});

/**
 * DELETE /api/motoristas/:id
 * Remove motorista (soft delete - marca como inativo)
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const motoristaId = parseInt(id);

    if (isNaN(motoristaId)) {
      return res.status(400).json({
        success: false,
        message: "ID do motorista inválido"
      });
    }

    // Buscar dados antes da exclusão
    const dadosAnteriores = await db.select()
      .from(motoristas)
      .where(eq(motoristas.id, motoristaId))
      .limit(1);

    if (dadosAnteriores.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Motorista não encontrado"
      });
    }

    // Soft delete - marcar como inativo
    const resultado = await db.update(motoristas)
      .set({ 
        ativo: false,
        atualizadoEm: new Date()
      })
      .where(eq(motoristas.id, motoristaId))
      .returning();

    await AuditLogger.logDelete(
      "motoristas",
      motoristaId,
      dadosAnteriores[0],
      `Motorista desativado: ${dadosAnteriores[0].nome} ${dadosAnteriores[0].sobrenome}`,
      req.user.id,
      req
    );

    res.json({
      success: true,
      message: "Motorista desativado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao desativar motorista:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao desativar motorista"
    });
  }
});

export default router;