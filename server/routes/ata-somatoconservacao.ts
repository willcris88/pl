/**
 * Rotas para Ata de Somatoconservação
 * Gera documento oficial de procedimentos de conservação
 */

import { Router } from 'express';
import { gerarAtaSomatoconservacao } from '../pdf-generators/ata-somatoconservacao.js';
import { storage } from '../storage.js';
import { AuditLogger } from '../audit-middleware.js';

const router = Router();

// Middleware de autenticação
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
}

/**
 * Gerar PDF da Ata de Somatoconservação
 * GET /api/ata-somatoconservacao/:id
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const obitoId = parseInt(req.params.id);
    const dadosProcedimento = req.query; // Dados vêm da query string

    // Buscar dados do óbito
    const obito = await storage.getObito(obitoId);
    if (!obito) {
      return res.status(404).json({ error: 'Óbito não encontrado' });
    }

    // Combinar dados do óbito com dados do procedimento
    const dadosCompletos = {
      ...obito,
      ...dadosProcedimento,
      dataProcedimento: dadosProcedimento.dataProcedimento || new Date().toISOString(),
      horaProcedimento: dadosProcedimento.horaProcedimento || new Date().toLocaleTimeString('pt-BR'),
      tecnicoResponsavel: dadosProcedimento.tecnicoResponsavel || 'N/I'
    };

    // Gerar PDF
    const doc = gerarAtaSomatoconservacao(dadosCompletos);
    
    // Configurar headers para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="ata-somatoconservacao-${obitoId}.pdf"`);
    
    // Log da auditoria
    await AuditLogger.logAction(
      'GERAR_PDF',
      'ata_somatoconservacao', 
      obitoId,
      `Ata de Somatoconservação gerada para óbito ${obitoId}`,
      req
    );

    // Stream do PDF
    doc.pipe(res);
  } catch (error) {
    console.error('Erro ao gerar Ata de Somatoconservação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Gerar PDF da Ata de Somatoconservação
 * POST /api/ata-somatoconservacao/:id
 */
router.post('/:id', requireAuth, async (req, res) => {
  try {
    const obitoId = parseInt(req.params.id);
    const dadosProcedimento = req.body;

    // Buscar dados do óbito
    const obito = await storage.getObito(obitoId);
    if (!obito) {
      return res.status(404).json({ error: 'Óbito não encontrado' });
    }

    // Combinar dados do óbito com dados do procedimento
    const dadosCompletos = {
      ...obito,
      ...dadosProcedimento,
      dataProcedimento: dadosProcedimento.dataProcedimento || new Date().toISOString(),
      horaProcedimento: dadosProcedimento.horaProcedimento || new Date().toLocaleTimeString('pt-BR'),
      tecnicoResponsavel: dadosProcedimento.tecnicoResponsavel || 'N/I'
    };

    // Gerar PDF
    const doc = gerarAtaSomatoconservacao(dadosCompletos);
    
    // Configurar headers para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="ata-somatoconservacao-${obitoId}.pdf"`);
    
    // Log da auditoria
    await AuditLogger.logAction(
      'GERAR_PDF',
      'ata_somatoconservacao', 
      obitoId,
      `Ata de Somatoconservação gerada para óbito ${obitoId}`,
      req
    );

    // Stream do PDF
    doc.pipe(res);
  } catch (error) {
    console.error('Erro ao gerar Ata de Somatoconservação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;