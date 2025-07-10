/**
 * Rotas para geração de PDF da Declaração de Óbito
 */

import type { Express } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";

import { gerarDeclaracaoObito } from '../pdf-generators/declaracao-obito.js';

export function setupDeclaracaoObitoRoutes(app: Express) {
  
  // Gerar PDF da Declaração de Óbito
  app.get("/api/obitos/:id/declaracao-pdf", async (req, res) => {
    try {
      const { id } = req.params;
      const obitoId = parseInt(id);

      if (isNaN(obitoId)) {
        return res.status(400).json({ error: "ID do óbito inválido" });
      }

      // Buscar dados do óbito
      const obito = await storage.getObito(obitoId);
      if (!obito) {
        return res.status(404).json({ error: "Óbito não encontrado" });
      }

      // Gerar PDF
      const pdfDoc = gerarDeclaracaoObito(obito);
      const buffers: Buffer[] = [];

      pdfDoc.on('data', (chunk: Buffer) => {
        buffers.push(chunk);
      });

      pdfDoc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        
        // Log da ação
        AuditLogger.logAction(
          "GERAR_PDF", 
          "obitos", 
          obitoId, 
          `Declaração de óbito gerada para ${obito.nome}`,
          req
        );

        // Definir headers para PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Declaracao_Obito_${obito.nome?.replace(/\s+/g, '_')}_${obitoId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Enviar PDF
        res.send(pdfBuffer);
      });

      pdfDoc.on('error', (error: Error) => {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).json({ error: 'Erro interno ao gerar PDF' });
      });

    } catch (error) {
      console.error('Erro ao gerar declaração de óbito:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Endpoint para gerar PDF via POST (com dados específicos)
  app.post("/api/obitos/:id/declaracao-pdf", async (req, res) => {
    try {
      const { id } = req.params;
      const obitoId = parseInt(id);
      const dadosAdicionais = req.body;

      if (isNaN(obitoId)) {
        return res.status(400).json({ error: "ID do óbito inválido" });
      }

      // Buscar dados do óbito
      const obito = await storage.getObito(obitoId);
      if (!obito) {
        return res.status(404).json({ error: "Óbito não encontrado" });
      }

      // Mesclar dados do banco com dados adicionais do formulário
      const dadosCompletos = {
        ...obito,
        ...dadosAdicionais
      };

      // Gerar PDF
      const pdfDoc = gerarDeclaracaoObito(dadosCompletos);
      const buffers: Buffer[] = [];

      pdfDoc.on('data', (chunk: Buffer) => {
        buffers.push(chunk);
      });

      pdfDoc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        
        // Log da ação
        AuditLogger.logAction(
          "GERAR_PDF", 
          "obitos", 
          obitoId, 
          `Declaração de óbito gerada (personalizada) para ${obito.nome}`,
          req
        );

        // Definir headers para PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Declaracao_Obito_${obito.nome?.replace(/\s+/g, '_')}_${obitoId}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Enviar PDF
        res.send(pdfBuffer);
      });

      pdfDoc.on('error', (error: Error) => {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).json({ error: 'Erro interno ao gerar PDF' });
      });

    } catch (error) {
      console.error('Erro ao gerar declaração de óbito personalizada:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
}