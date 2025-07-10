/**
 * ROTAS DE VEÍCULOS ASSOCIADOS A ORDENS DE SERVIÇO
 * 
 * Módulo responsável pelo gerenciamento de veículos e motoristas em ordens de serviço:
 * - Associação de motoristas a veículos/transportes
 * - Controle de status e horários de serviço
 * - Logs de auditoria integrados
 * 
 * FUNCIONALIDADES:
 * - GET /api/veiculos-os - Lista veículos de uma ordem de serviço
 * - POST /api/veiculos-os - Associa veículo/motorista a ordem
 * - PATCH /api/veiculos-os/:id - Atualiza dados do veículo/serviço
 * - DELETE /api/veiculos-os/:id - Remove veículo da ordem
 */

import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { veiculosOs, motoristas, inserirVeiculoOsSchema } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { AuditLogger } from "../audit-middleware";

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
 * GET /api/veiculos-os
 * Lista todos os veículos associados a uma ordem de serviço
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { ordemServicoId } = req.query;

    if (!ordemServicoId) {
      return res.status(400).json({
        success: false,
        message: "ID da ordem de serviço é obrigatório"
      });
    }

    const resultado = await db.select({
      id: veiculosOs.id,
      ordemServicoId: veiculosOs.ordemServicoId,
      motoristaId: veiculosOs.motoristaId,
      tipoVeiculo: veiculosOs.tipoVeiculo,
      placaVeiculo: veiculosOs.placaVeiculo,
      observacoes: veiculosOs.observacoes,
      dataHoraChamada: veiculosOs.dataHoraChamada,
      dataHoraSaida: veiculosOs.dataHoraSaida,
      dataHoraChegada: veiculosOs.dataHoraChegada,
      valor: veiculosOs.valor,
      status: veiculosOs.status,
      criadoEm: veiculosOs.criadoEm,
      // Dados do motorista
      nomeMotorista: motoristas.nome,
      sobrenomeMotorista: motoristas.sobrenome,
      telefoneMotorista: motoristas.telefone,
      cnhMotorista: motoristas.cnh
    }).from(veiculosOs)
      .leftJoin(motoristas, eq(veiculosOs.motoristaId, motoristas.id))
      .where(eq(veiculosOs.ordemServicoId, parseInt(ordemServicoId as string)))
      .orderBy(veiculosOs.criadoEm);

    await AuditLogger.logAction(
      "READ",
      "veiculos_os",
      null,
      `Listagem de veículos da ordem ${ordemServicoId}`,
      req.user.id,
      req
    );

    res.json({
      success: true,
      data: resultado,
      message: `${resultado.length} veículos encontrados`
    });
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao buscar veículos"
    });
  }
});

/**
 * POST /api/veiculos-os
 * Associa veículo/motorista a uma ordem de serviço
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    // Validação dos dados com Zod
    const dadosValidados = inserirVeiculoOsSchema.parse(req.body);
    
    // Inserir no banco
    const resultado = await db.insert(veiculosOs).values(dadosValidados).returning();

    // Buscar dados do motorista para o retorno
    let dadosCompletos = resultado[0];
    if (resultado[0].motoristaId) {
      const motorista = await db.select({
        nome: motoristas.nome,
        sobrenome: motoristas.sobrenome,
        telefone: motoristas.telefone,
        cnh: motoristas.cnh
      }).from(motoristas)
        .where(eq(motoristas.id, resultado[0].motoristaId))
        .limit(1);

      if (motorista.length > 0) {
        dadosCompletos = {
          ...resultado[0],
          nomeMotorista: motorista[0].nome,
          sobrenomeMotorista: motorista[0].sobrenome,
          telefoneMotorista: motorista[0].telefone,
          cnhMotorista: motorista[0].cnh
        };
      }
    }

    await AuditLogger.logCreate(
      "veiculos_os",
      resultado[0].id,
      resultado[0],
      `Veículo adicionado à ordem ${resultado[0].ordemServicoId}: ${resultado[0].tipoVeiculo}`,
      req.user.id,
      req
    );

    res.status(201).json({
      success: true,
      data: dadosCompletos,
      message: "Veículo associado com sucesso"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors
      });
    }

    console.error("Erro ao associar veículo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao associar veículo"
    });
  }
});

/**
 * PATCH /api/veiculos-os/:id
 * Atualiza dados do veículo/serviço
 */
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const veiculoId = parseInt(id);

    if (isNaN(veiculoId)) {
      return res.status(400).json({
        success: false,
        message: "ID do veículo inválido"
      });
    }

    // Buscar dados anteriores para auditoria
    const dadosAnteriores = await db.select()
      .from(veiculosOs)
      .where(eq(veiculosOs.id, veiculoId))
      .limit(1);

    if (dadosAnteriores.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Veículo não encontrado"
      });
    }

    const dadosAtualizacao = { 
      ...req.body,
      atualizadoEm: new Date()
    };

    // Atualizar no banco
    const resultado = await db.update(veiculosOs)
      .set(dadosAtualizacao)
      .where(eq(veiculosOs.id, veiculoId))
      .returning();

    await AuditLogger.logUpdate(
      "veiculos_os",
      veiculoId,
      dadosAnteriores[0],
      resultado[0],
      `Veículo atualizado: ${resultado[0].tipoVeiculo}`,
      req.user.id,
      req
    );

    res.json({
      success: true,
      data: resultado[0],
      message: "Veículo atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar veículo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao atualizar veículo"
    });
  }
});

/**
 * DELETE /api/veiculos-os/:id
 * Remove veículo da ordem de serviço
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const veiculoId = parseInt(id);

    if (isNaN(veiculoId)) {
      return res.status(400).json({
        success: false,
        message: "ID do veículo inválido"
      });
    }

    // Buscar dados antes da exclusão
    const dadosAnteriores = await db.select()
      .from(veiculosOs)
      .where(eq(veiculosOs.id, veiculoId))
      .limit(1);

    if (dadosAnteriores.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Veículo não encontrado"
      });
    }

    // Excluir definitivamente
    await db.delete(veiculosOs)
      .where(eq(veiculosOs.id, veiculoId));

    await AuditLogger.logDelete(
      "veiculos_os",
      veiculoId,
      dadosAnteriores[0],
      `Veículo removido da ordem ${dadosAnteriores[0].ordemServicoId}: ${dadosAnteriores[0].tipoVeiculo}`,
      req.user.id,
      req
    );

    res.json({
      success: true,
      message: "Veículo removido com sucesso"
    });
  } catch (error) {
    console.error("Erro ao remover veículo:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor ao remover veículo"
    });
  }
});

export default router;