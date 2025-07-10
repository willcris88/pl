/**
 * Sistema de PDF similar ao TCPDF
 * Usando PDFKit para gerar PDFs profissionais
 */
import PDFKit from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Extensões de tipos para PDFKit
declare module 'pdfkit' {
  interface PDFDocument {
    fillColor(color: string): this;
    strokeColor(color: string): this;
    font(font: string): this;
    fontSize(size: number): this;
    text(text: string, x?: number, y?: number, options?: any): this;
    rect(x: number, y: number, width: number, height: number): this;
    fill(): this;
    stroke(): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    addPage(): this;
    end(): this;
  }
}

export class TCPDFLike {
  private doc: PDFKit.PDFDocument;
  private pageWidth: number;
  private pageHeight: number;
  private margins: { top: number; bottom: number; left: number; right: number };
  private currentY: number;

  constructor(orientation: 'portrait' | 'landscape' = 'portrait') {
    this.doc = new PDFKit({
      size: 'A4',
      layout: orientation,
      margin: 0
    });

    this.pageWidth = orientation === 'portrait' ? 595.28 : 841.89;
    this.pageHeight = orientation === 'portrait' ? 841.89 : 595.28;
    this.margins = { top: 50, bottom: 50, left: 50, right: 50 };
    this.currentY = this.margins.top;
  }

  // Definir margens
  setMargins(top: number, right: number, bottom: number, left: number) {
    this.margins = { top, right, bottom, left };
    this.currentY = this.margins.top;
  }

  // Adicionar texto
  addText(text: string, x: number, y: number, options: any = {}) {
    const defaultOptions = {
      fontSize: 12,
      font: 'Helvetica',
      color: '#000000'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    this.doc
      .font(finalOptions.font)
      .fontSize(finalOptions.fontSize)
      .fillColor(finalOptions.color)
      .text(text, x, y, finalOptions);
  }

  // Adicionar célula (similar ao TCPDF Cell)
  addCell(width: number, height: number, text: string, border: boolean = true, ln: number = 0, align: string = 'L') {
    const x = this.margins.left;
    const y = this.currentY;

    // Desenhar borda se necessário
    if (border) {
      this.doc
        .rect(x, y, width, height)
        .stroke('#000000');
    }

    // Calcular posição do texto baseado no alinhamento
    let textX = x + 5; // padding
    const textY = y + (height / 2) - 6; // centralizado verticalmente

    if (align === 'C') {
      textX = x + (width / 2);
    } else if (align === 'R') {
      textX = x + width - 5;
    }

    // Adicionar texto
    this.doc
      .fontSize(10)
      .text(text, textX, textY, {
        width: width - 10,
        align: align.toLowerCase(),
        lineBreak: false
      });

    // Quebra de linha se necessário
    if (ln === 1) {
      this.currentY += height;
    }
  }

  // Adicionar linha
  addLine(x1: number, y1: number, x2: number, y2: number, color: string = '#000000') {
    this.doc
      .strokeColor(color)
      .moveTo(x1, y1)
      .lineTo(x2, y2)
      .stroke();
  }

  // Adicionar retângulo
  addRect(x: number, y: number, width: number, height: number, fill: boolean = false, color: string = '#000000') {
    this.doc
      .rect(x, y, width, height);
    
    if (fill) {
      this.doc.fillColor(color).fill();
    } else {
      this.doc.strokeColor(color).stroke();
    }
  }

  // Adicionar tabela
  addTable(headers: string[], data: string[][], x: number, y: number, cellWidth: number, cellHeight: number) {
    let currentY = y;
    
    // Cabeçalho
    this.doc
      .fillColor('#f0f0f0')
      .rect(x, currentY, cellWidth * headers.length, cellHeight)
      .fill();
    
    headers.forEach((header, index) => {
      this.addText(header, x + (index * cellWidth) + 5, currentY + 5, {
        fontSize: 10,
        font: 'Helvetica-Bold'
      });
    });
    
    currentY += cellHeight;
    
    // Dados
    data.forEach(row => {
      row.forEach((cell, index) => {
        this.addCell(cellWidth, cellHeight, cell, true, 0, 'L');
      });
      currentY += cellHeight;
    });
  }

  // Adicionar cabeçalho da empresa
  addCompanyHeader(companyName: string, address: string, phone: string) {
    // Logo placeholder
    this.addRect(this.margins.left, this.margins.top, 50, 50, true, '#e0e0e0');
    
    // Nome da empresa
    this.addText(companyName, this.margins.left + 60, this.margins.top + 5, {
      fontSize: 16,
      font: 'Helvetica-Bold'
    });
    
    // Endereço
    this.addText(address, this.margins.left + 60, this.margins.top + 25, {
      fontSize: 10
    });
    
    // Telefone
    this.addText(phone, this.margins.left + 60, this.margins.top + 40, {
      fontSize: 10
    });
    
    // Linha separadora
    this.addLine(this.margins.left, this.margins.top + 65, this.pageWidth - this.margins.right, this.margins.top + 65);
    
    this.currentY = this.margins.top + 80;
  }

  // Adicionar rodapé
  addFooter(text: string) {
    const footerY = this.pageHeight - this.margins.bottom + 20;
    
    this.addLine(this.margins.left, footerY - 10, this.pageWidth - this.margins.right, footerY - 10);
    
    this.addText(text, this.margins.left, footerY, {
      fontSize: 8,
      color: '#666666'
    });
  }

  // Definir posição Y atual
  setY(y: number) {
    this.currentY = y;
  }

  // Obter posição Y atual
  getY(): number {
    return this.currentY;
  }

  // Quebrar página
  addPage() {
    this.doc.addPage();
    this.currentY = this.margins.top;
  }

  // Finalizar e salvar PDF
  save(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const writeStream = fs.createWriteStream(filePath);
        this.doc.pipe(writeStream);
        
        writeStream.on('finish', () => {
          resolve();
        });
        
        writeStream.on('error', (error) => {
          reject(error);
        });
        
        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Obter buffer do PDF
  getBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        
        this.doc.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        this.doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
        
        this.doc.on('error', (error) => {
          reject(error);
        });
        
        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Obter stream do PDF
  getStream(): PDFKit.PDFDocument {
    return this.doc;
  }
}

// Função para gerar nota contratual usando TCPDF-like
export async function gerarNotaContratual(dadosNota: any): Promise<Buffer> {
  const pdf = new TCPDFLike('portrait');
  
  // Cabeçalho da empresa
  pdf.addCompanyHeader(
    'FUNERÁRIA CENTRAL DE BARUERI LTDA',
    'RUA ANHANGUERA 2391 - VL. SÃO FRANCISCO BARUERI / SP - 06.452-050',
    '(11) 4706-1166 / (11) 4198-3843 / 08000-557355'
  );
  
  // Título da nota
  pdf.addText('NOTA CONTRATUAL', pdf.margins.left, pdf.getY(), {
    fontSize: 14,
    font: 'Helvetica-Bold'
  });
  
  pdf.addText(`NC ${dadosNota.numeroNota}`, pdf.pageWidth - pdf.margins.right - 100, pdf.getY(), {
    fontSize: 12,
    font: 'Helvetica-Bold'
  });
  
  pdf.setY(pdf.getY() + 30);
  
  // Informações do contratante
  pdf.addText('CONTRATANTE:', pdf.margins.left, pdf.getY(), {
    fontSize: 12,
    font: 'Helvetica-Bold'
  });
  
  pdf.setY(pdf.getY() + 20);
  
  pdf.addText(`Nome: ${dadosNota.nomeContratante}`, pdf.margins.left, pdf.getY());
  pdf.setY(pdf.getY() + 15);
  
  pdf.addText(`CPF/CNPJ: ${dadosNota.cpfCnpjContratante}`, pdf.margins.left, pdf.getY());
  pdf.setY(pdf.getY() + 15);
  
  pdf.addText(`Endereço: ${dadosNota.enderecoContratante}`, pdf.margins.left, pdf.getY());
  pdf.setY(pdf.getY() + 15);
  
  pdf.addText(`Cidade: ${dadosNota.cidadeContratante}`, pdf.margins.left, pdf.getY());
  pdf.setY(pdf.getY() + 15);
  
  if (dadosNota.telefoneContratante) {
    pdf.addText(`Telefone: ${dadosNota.telefoneContratante}`, pdf.margins.left, pdf.getY());
    pdf.setY(pdf.getY() + 15);
  }
  
  // Linha separadora
  pdf.addLine(pdf.margins.left, pdf.getY() + 5, pdf.pageWidth - pdf.margins.right, pdf.getY() + 5);
  pdf.setY(pdf.getY() + 20);
  
  // Informações dos produtos/serviços
  pdf.addText('PRODUTOS/SERVIÇOS:', pdf.margins.left, pdf.getY(), {
    fontSize: 12,
    font: 'Helvetica-Bold'
  });
  
  pdf.setY(pdf.getY() + 25);
  
  // Cabeçalho da tabela
  const tableHeaders = ['Descrição', 'Quantidade', 'Valor Unit.', 'Valor Total'];
  const cellWidth = (pdf.pageWidth - pdf.margins.left - pdf.margins.right) / 4;
  const cellHeight = 25;
  
  // Cabeçalho
  pdf.addRect(pdf.margins.left, pdf.getY(), cellWidth * 4, cellHeight, true, '#f0f0f0');
  
  tableHeaders.forEach((header, index) => {
    pdf.addText(header, pdf.margins.left + (index * cellWidth) + 5, pdf.getY() + 8, {
      fontSize: 10,
      font: 'Helvetica-Bold'
    });
  });
  
  pdf.setY(pdf.getY() + cellHeight);
  
  // Dados dos produtos (exemplo)
  if (dadosNota.produtos && dadosNota.produtos.length > 0) {
    dadosNota.produtos.forEach((produto: any) => {
      pdf.addRect(pdf.margins.left, pdf.getY(), cellWidth, cellHeight, false);
      pdf.addRect(pdf.margins.left + cellWidth, pdf.getY(), cellWidth, cellHeight, false);
      pdf.addRect(pdf.margins.left + cellWidth * 2, pdf.getY(), cellWidth, cellHeight, false);
      pdf.addRect(pdf.margins.left + cellWidth * 3, pdf.getY(), cellWidth, cellHeight, false);
      
      pdf.addText(produto.nome, pdf.margins.left + 5, pdf.getY() + 8, { fontSize: 9 });
      pdf.addText(produto.quantidade.toString(), pdf.margins.left + cellWidth + 5, pdf.getY() + 8, { fontSize: 9 });
      pdf.addText(`R$ ${produto.valorUnitario}`, pdf.margins.left + cellWidth * 2 + 5, pdf.getY() + 8, { fontSize: 9 });
      pdf.addText(`R$ ${produto.valorTotal}`, pdf.margins.left + cellWidth * 3 + 5, pdf.getY() + 8, { fontSize: 9 });
      
      pdf.setY(pdf.getY() + cellHeight);
    });
  }
  
  // Valor total
  pdf.setY(pdf.getY() + 15);
  pdf.addText(`VALOR TOTAL: R$ ${dadosNota.valorTotal}`, pdf.pageWidth - pdf.margins.right - 150, pdf.getY(), {
    fontSize: 12,
    font: 'Helvetica-Bold'
  });
  
  // Observações
  if (dadosNota.observacoes) {
    pdf.setY(pdf.getY() + 30);
    pdf.addText('OBSERVAÇÕES:', pdf.margins.left, pdf.getY(), {
      fontSize: 12,
      font: 'Helvetica-Bold'
    });
    
    pdf.setY(pdf.getY() + 20);
    pdf.addText(dadosNota.observacoes, pdf.margins.left, pdf.getY(), {
      fontSize: 10,
      width: pdf.pageWidth - pdf.margins.left - pdf.margins.right
    });
  }
  
  // Rodapé
  pdf.addFooter(`Nota Contratual gerada em ${new Date().toLocaleDateString('pt-BR')} - Sistema Funerário`);
  
  return await pdf.getBuffer();
}