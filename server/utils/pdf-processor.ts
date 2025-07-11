/**
 * PROCESSADOR DE PDF CONSOLIDADO - OTIMIZADO PARA WINDOWS
 * 
 * Utilitário para processar múltiplos documentos e gerar PDF consolidado
 * Converte imagens para PDF e concatena PDFs existentes
 * 
 * NOTA: Usando jimp em vez de sharp para melhor compatibilidade com Windows
 * (sharp requer compilação nativa que pode falhar no Windows)
 */

import fs from 'fs/promises';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import Jimp from 'jimp';

interface DocumentoProcessavel {
  id: number;
  nome: string;
  caminho: string;
  tipo: string;
  tamanho: number;
}

interface ResultadoProcessamento {
  sucesso: boolean;
  arquivo: string;
  tamanho: number;
  documentosProcessados: number;
  erros?: string[];
}

/**
 * Processa múltiplos documentos e gera PDF consolidado
 */
export async function processarDocumentos(
  documentos: DocumentoProcessavel[],
  caminhoSaida: string
): Promise<ResultadoProcessamento> {
  const erros: string[] = [];
  let documentosProcessados = 0;

  try {
    console.log(`Iniciando processamento de ${documentos.length} documentos`);
    
    // Criar novo documento PDF
    const pdfDoc = await PDFDocument.create();
    
    // Processar cada documento
    for (const documento of documentos) {
      try {
        console.log(`Processando: ${documento.nome}`);
        
        if (documento.tipo.toLowerCase() === '.pdf') {
          // Processar PDF existente
          await adicionarPdfExistente(pdfDoc, documento.caminho);
        } else if (['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'].includes(documento.tipo.toLowerCase())) {
          // Processar imagem (jimp suporta mais formatos que sharp)
          await adicionarImagemComoPdf(pdfDoc, documento.caminho);
        } else {
          console.log(`Tipo não suportado: ${documento.tipo}`);
          erros.push(`Tipo não suportado: ${documento.nome}`);
          continue;
        }
        
        documentosProcessados++;
        
      } catch (error) {
        console.error(`Erro ao processar ${documento.nome}:`, error);
        erros.push(`Erro em ${documento.nome}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }
    
    // Verificar se há pelo menos uma página
    if (pdfDoc.getPageCount() === 0) {
      throw new Error('Nenhuma página foi adicionada ao PDF');
    }
    
    // Salvar PDF consolidado
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(caminhoSaida, pdfBytes);
    
    const stats = await fs.stat(caminhoSaida);
    
    console.log(`PDF consolidado gerado: ${caminhoSaida} (${stats.size} bytes)`);
    
    return {
      sucesso: true,
      arquivo: caminhoSaida,
      tamanho: stats.size,
      documentosProcessados,
      erros: erros.length > 0 ? erros : undefined
    };
    
  } catch (error) {
    console.error('Erro no processamento geral:', error);
    
    return {
      sucesso: false,
      arquivo: caminhoSaida,
      tamanho: 0,
      documentosProcessados,
      erros: [`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
    };
  }
}

/**
 * Adiciona PDF existente ao documento principal
 */
async function adicionarPdfExistente(pdfDoc: PDFDocument, caminhoArquivo: string): Promise<void> {
  try {
    const pdfBytes = await fs.readFile(caminhoArquivo);
    const pdfExterno = await PDFDocument.load(pdfBytes);
    
    const paginas = await pdfDoc.copyPages(pdfExterno, pdfExterno.getPageIndices());
    paginas.forEach((pagina) => pdfDoc.addPage(pagina));
    
  } catch (error) {
    console.error(`Erro ao adicionar PDF ${caminhoArquivo}:`, error);
    throw error;
  }
}

/**
 * Converte imagem para PDF e adiciona ao documento principal
 * OTIMIZADO PARA WINDOWS: Usando jimp em vez de sharp
 */
async function adicionarImagemComoPdf(pdfDoc: PDFDocument, caminhoImagem: string): Promise<void> {
  try {
    // Processar imagem com Jimp (compatível com Windows)
    console.log(`Carregando imagem: ${caminhoImagem}`);
    const imagem = await Jimp.read(caminhoImagem);
    
    // Otimizar qualidade (equivalente ao sharp)
    imagem.quality(85);
    
    // Converter para JPEG buffer
    const imagemBuffer = await imagem.getBufferAsync(Jimp.MIME_JPEG);
    
    // Incorporar imagem no PDF
    const imagemPdf = await pdfDoc.embedJpg(imagemBuffer);
    
    // Calcular dimensões mantendo proporção
    const { width, height } = imagemPdf.scale(1);
    const pageWidth = 595; // A4 width in points
    const pageHeight = 842; // A4 height in points
    
    let imgWidth = width;
    let imgHeight = height;
    
    // Redimensionar se necessário para caber na página
    if (imgWidth > pageWidth) {
      const ratio = pageWidth / imgWidth;
      imgWidth = pageWidth;
      imgHeight = imgHeight * ratio;
    }
    
    if (imgHeight > pageHeight) {
      const ratio = pageHeight / imgHeight;
      imgHeight = pageHeight;
      imgWidth = imgWidth * ratio;
    }
    
    // Centralizar imagem na página
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    
    // Criar nova página e adicionar imagem
    const pagina = pdfDoc.addPage([pageWidth, pageHeight]);
    pagina.drawImage(imagemPdf, {
      x,
      y,
      width: imgWidth,
      height: imgHeight,
    });
    
    console.log(`Imagem adicionada com sucesso: ${path.basename(caminhoImagem)}`);
    
  } catch (error) {
    console.error(`Erro ao adicionar imagem ${caminhoImagem}:`, error);
    throw error;
  }
}

/**
 * Gera nome único para arquivo PDF consolidado
 */
export function gerarNomePDFConsolidado(ordemServicoId: number): string {
  const data = new Date().toISOString().split('T')[0];
  return `Documentos_Consolidados_Ordem_${ordemServicoId}_${data}.pdf`;
}

/**
 * Busca documentos processáveis (PDF e imagens)
 * ATUALIZADO: Suporte adicional para formatos que jimp consegue processar
 */
export function buscarDocumentosProcessaveis(documentos: DocumentoProcessavel[]): DocumentoProcessavel[] {
  // jimp suporta: JPEG, PNG, BMP, TIFF, GIF
  const tiposSuportados = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.tiff'];
  
  return documentos.filter(doc => 
    tiposSuportados.includes(doc.tipo.toLowerCase()) && 
    !(doc as any).consolidado && // Evitar reprocessar PDFs consolidados
    !doc.nome.includes('Documentos_Consolidados_')
  ).sort((a, b) => (a as any).ordem - (b as any).ordem); // Ordenar por ordem
}