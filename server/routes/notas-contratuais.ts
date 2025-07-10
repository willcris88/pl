/**
 * ROTAS PARA NOTAS CONTRATUAIS
 * Sistema completo de geração e gestão de notas contratuais
 */

import { Router } from 'express';
import { AuditLogger } from '../audit-middleware';
import { storage } from '../storage';
import { gerarNotaContratual } from '../utils/tcpdf-like';
import path from 'path';
import fs from 'fs';

const router = Router();

// Middleware para verificar autenticação
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

/**
 * GET /api/notas-contratuais
 * Buscar todas as notas contratuais
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const notasContratuais = await storage.getNotasContratuais();
    res.json(notasContratuais);
  } catch (error) {
    console.error("Erro ao buscar notas contratuais:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/notas-contratuais
 * Criar nova nota contratual
 */
router.post('/', requireAuth, async (req: any, res) => {
  try {
    console.log("Dados recebidos para criar nota contratual:", req.body);
    
    // Gerar número da nota automaticamente
    const numeroNota = `NC${Date.now()}`;
    const dadosNota = { ...req.body, numeroNota };
    
    const nota = await storage.createNotaContratual(dadosNota);
    console.log("Nota contratual criada com sucesso:", nota);
    
    // Log de auditoria
    if (req.user?.id) {
      await AuditLogger.logCreate(
        req.user.id,
        'notas_contratuais',
        nota.id,
        nota,
        `Criou nota contratual: ${nota.numeroNota}`,
        req
      );
    }
    
    res.status(201).json(nota);
  } catch (error) {
    console.error("Erro ao criar nota contratual:", error);
    res.status(500).json({ error: "Erro ao criar nota contratual" });
  }
});

/**
 * DELETE /api/notas-contratuais/:id
 * Excluir nota contratual
 */
router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const notaContratual = await storage.getNotaContratual(id);
    if (!notaContratual) {
      return res.status(404).json({ message: "Nota contratual não encontrada" });
    }
    
    await storage.deleteNotaContratual(id);
    
    // Log de auditoria
    if (req.user?.id) {
      await AuditLogger.logDelete(
        req.user.id,
        'notas_contratuais',
        id,
        notaContratual,
        `Excluiu nota contratual: ${notaContratual.numeroNota}`,
        req
      );
    }
    
    res.json({ message: "Nota contratual excluída com sucesso. Produtos liberados para nova geração." });
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao excluir nota contratual" });
  }
});

/**
 * POST /api/notas-contratuais/gerar-pdf
 * Gerar PDF da nota contratual usando TCPDF-like
 */
router.post('/gerar-pdf', requireAuth, async (req: any, res) => {
  try {
    console.log("Gerando PDF da nota contratual com dados:", req.body);
    
    const dadosNota = req.body;
    
    // Validar dados obrigatórios
    if (!dadosNota.nomeContratante || !dadosNota.cpfCnpjContratante) {
      return res.status(400).json({ 
        message: "Dados obrigatórios não fornecidos (nome e CPF/CNPJ do contratante)" 
      });
    }
    
    // Gerar PDF usando TCPDF-like
    const pdfBuffer = await gerarNotaContratual(dadosNota);
    
    // Salvar arquivo PDF
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const nomeArquivo = `nota_contratual_${dadosNota.numeroNota || Date.now()}.pdf`;
    const caminhoArquivo = path.join(uploadsDir, nomeArquivo);
    
    fs.writeFileSync(caminhoArquivo, pdfBuffer);
    
    // Log de auditoria
    if (req.user?.id) {
      await AuditLogger.logAction(
        req.user.id,
        'CREATE',
        'notas_contratuais_pdf',
        0,
        `Gerou PDF da nota contratual: ${dadosNota.numeroNota}`,
        req
      );
    }
    
    // Retornar PDF para visualização no navegador
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${nomeArquivo}"`,
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-cache'
    });
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("Erro ao gerar PDF da nota contratual:", error);
    res.status(500).json({ 
      error: "Erro ao gerar PDF da nota contratual",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/notas-contratuais/:id
 * Buscar uma nota contratual específica
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const notaContratual = await storage.getNotaContratual(id);
    
    if (!notaContratual) {
      return res.status(404).json({ message: "Nota contratual não encontrada" });
    }
    
    res.json(notaContratual);
  } catch (error) {
    console.error("Erro ao buscar nota contratual:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export { router as notasContratuaisRouter };