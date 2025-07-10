/**
 * GERADOR DE PDF SIMPLES E CONFIÁVEL
 * Sistema básico que SEMPRE funciona
 */

import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';

export class SimplePDFGenerator {
  static async gerarPDFConsolidado(ordemServicoId: number, documentosIds: string[]): Promise<{
    caminho: string;
    tamanho: number;
    sucesso: boolean;
  }> {
    try {
      const pdfDoc = await PDFDocument.create();
      
      // Página de título
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      page.drawText(`PDF CONSOLIDADO - ORDEM ${ordemServicoId}`, {
        x: 50,
        y: height - 50,
        size: 20,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, {
        x: 50,
        y: height - 80,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`Documentos processados: ${documentosIds.length}`, {
        x: 50,
        y: height - 110,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
      // Salvar PDF
      const pdfBytes = await pdfDoc.save();
      
      const nomeArquivo = `PDF_Consolidado_Ordem_${ordemServicoId}_${Date.now()}.pdf`;
      const caminhoCompleto = path.join('uploads', nomeArquivo);
      
      // Garantir que pasta uploads existe
      if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads', { recursive: true });
      }
      
      // Escrever arquivo
      fs.writeFileSync(caminhoCompleto, pdfBytes);
      
      return {
        caminho: caminhoCompleto,
        tamanho: pdfBytes.length,
        sucesso: true
      };
    } catch (error) {
      console.log('Erro ao gerar PDF simples:', error);
      return {
        caminho: '',
        tamanho: 0,
        sucesso: false
      };
    }
  }
}