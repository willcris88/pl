/**
 * ROTAS DE MOTORISTAS ORDEM SERVICO
 * 
 * Este arquivo contém todas as rotas relacionadas ao vínculo de motoristas
 * nas ordens de serviço. Permite associar motoristas aos veículos/serviços
 * de transporte com controle de horários de saída e chegada.
 */

import { Router } from 'express';
import { db } from '../db.js';
import { motoristas_ordem_servico, motoristas, produtosOrdemServico } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { AuditLogger } from '../audit-middleware.js';

const router = Router();

// Middleware de autenticação simples
function requireAuth(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
}

// GET - Listar motoristas vinculados à ordem de serviço
router.get('/', requireAuth, async (req: any, res: any) => {
  try {
    const { ordemServicoId } = req.query;
    
    if (!ordemServicoId) {
      return res.status(400).json({ error: 'ordemServicoId é obrigatório' });
    }

    console.log(`Buscando motoristas para ordem de serviço: ${ordemServicoId}`);

    const motoristasVinculados = await db
      .select({
        id: motoristas_ordem_servico.id,
        ordemServicoId: motoristas_ordem_servico.ordemServicoId,
        motoristaId: motoristas_ordem_servico.motoristaId,
        veiculoProdutoId: motoristas_ordem_servico.veiculoProdutoId,
        horaSaida: motoristas_ordem_servico.horaSaida,
        horaChegada: motoristas_ordem_servico.horaChegada,
        status: motoristas_ordem_servico.status,
        observacoes: motoristas_ordem_servico.observacoes,
        criadoEm: motoristas_ordem_servico.criadoEm,
        // Novos campos do serviço
        dataServico: motoristas_ordem_servico.dataServico,
        horaServico: motoristas_ordem_servico.horaServico,
        localOrigem: motoristas_ordem_servico.localOrigem,
        localDestino: motoristas_ordem_servico.localDestino,
        tipoVeiculo: motoristas_ordem_servico.tipoVeiculo,
        
        // Dados do motorista
        motoristaNome: motoristas.nome,
        motoristaSobrenome: motoristas.sobrenome,
        motoristaEmail: motoristas.email,
        motoristaTelefone: motoristas.telefone,
        motoristaCnh: motoristas.cnh,
        
        // Dados do veículo/produto
        veiculoNome: produtosOrdemServico.nome,
        veiculoCategoria: produtosOrdemServico.categoria
      })
      .from(motoristas_ordem_servico)
      .leftJoin(motoristas, eq(motoristas_ordem_servico.motoristaId, motoristas.id))
      .leftJoin(produtosOrdemServico, eq(motoristas_ordem_servico.veiculoProdutoId, produtosOrdemServico.id))
      .where(eq(motoristas_ordem_servico.ordemServicoId, parseInt(ordemServicoId)))
      .orderBy(desc(motoristas_ordem_servico.criadoEm));

    console.log(`Motoristas vinculados encontrados: ${motoristasVinculados.length}`);
    res.json(motoristasVinculados);

  } catch (error) {
    console.error('Erro ao buscar motoristas vinculados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Vincular motorista ao veículo/ordem
router.post('/', requireAuth, async (req: any, res: any) => {
  try {
    const { ordemServicoId, motoristaId, veiculoProdutoId, horaSaida, horaChegada, observacoes, dataServico, horaServico, localOrigem, localDestino, tipoVeiculo } = req.body;

    if (!ordemServicoId || !motoristaId) {
      return res.status(400).json({ error: 'ordemServicoId e motoristaId são obrigatórios' });
    }

    console.log('Vinculando motorista:', req.body);

    // Inserir vinculação
    const [motoristasVinculado] = await db
      .insert(motoristas_ordem_servico)
      .values({
        ordemServicoId: parseInt(ordemServicoId),
        motoristaId: parseInt(motoristaId),
        veiculoProdutoId: veiculoProdutoId ? parseInt(veiculoProdutoId) : null,
        horaSaida: horaSaida ? new Date(horaSaida) : null,
        horaChegada: horaChegada ? new Date(horaChegada) : null,
        observacoes: observacoes || null,
        dataServico: dataServico || null,
        horaServico: horaServico || null,
        localOrigem: localOrigem || null,
        localDestino: localDestino || null,
        tipoVeiculo: tipoVeiculo || null
      })
      .returning();

    console.log('Motorista vinculado com sucesso:', motoristasVinculado);

    // Log de auditoria
    await AuditLogger.logCreate(
      'motoristas_ordem_servico',
      motoristasVinculado.id,
      req,
      `Motorista ID ${motoristaId} vinculado ao veículo ID ${veiculoProdutoId} na OS ${ordemServicoId}`
    );

    res.status(201).json(motoristasVinculado);

  } catch (error) {
    console.error('Erro ao vincular motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar horários do motorista
router.put('/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { horaSaida, horaChegada, status, observacoes } = req.body;

    console.log(`Atualizando motorista vinculado ID: ${id}`, req.body);

    const [motoristasAtualizado] = await db
      .update(motoristas_ordem_servico)
      .set({
        horaSaida: horaSaida ? new Date(horaSaida) : undefined,
        horaChegada: horaChegada ? new Date(horaChegada) : undefined,
        status: status || undefined,
        observacoes: observacoes || undefined,
        atualizadoEm: new Date()
      })
      .where(eq(motoristas_ordem_servico.id, parseInt(id)))
      .returning();

    if (!motoristasAtualizado) {
      return res.status(404).json({ error: 'Vinculação de motorista não encontrada' });
    }

    // Log de auditoria
    await AuditLogger.logUpdate(
      'motoristas_ordem_servico',
      parseInt(id),
      req,
      `Horários atualizados: saída ${horaSaida}, chegada ${horaChegada}`
    );

    console.log('Motorista vinculado atualizado:', motoristasAtualizado);
    res.json(motoristasAtualizado);

  } catch (error) {
    console.error('Erro ao atualizar motorista vinculado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Desvincular motorista
router.delete('/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    console.log(`Desvinculando motorista ID: ${id}`);

    const [motoristasDesvinculado] = await db
      .delete(motoristas_ordem_servico)
      .where(eq(motoristas_ordem_servico.id, parseInt(id)))
      .returning();

    if (!motoristasDesvinculado) {
      return res.status(404).json({ error: 'Vinculação de motorista não encontrada' });
    }

    // Log de auditoria
    await AuditLogger.logDelete(
      'motoristas_ordem_servico',
      parseInt(id),
      req,
      `Motorista desvinculado da OS ${motoristasDesvinculado.ordemServicoId}`
    );

    console.log('Motorista desvinculado com sucesso');
    res.json({ message: 'Motorista desvinculado com sucesso' });

  } catch (error) {
    console.error('Erro ao desvincular motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;