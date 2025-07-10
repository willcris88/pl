/**
 * Gerador de PDF para Nota ND (Nota de Débito)
 * Baseado no design oficial da Funerária Central de Barueri
 */

import PDFDocument from 'pdfkit';
import { type NotaNd } from '@shared/schema';

export function gerarNotaNdPdf(nota: NotaNd): PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Nota ND ${nota.numeroProcesso}`,
      Author: 'Funerária Central de Barueri',
      Subject: 'Nota de Débito',
      Keywords: 'Nota, Débito, Funerária'
    }
  });

  // Cabeçalho com logo (placeholder circular)
  const logoX = 50;
  const logoY = 50;
  const logoRadius = 35;
  
  // Desenhar círculo dourado para simular logo
  doc.circle(logoX + logoRadius, logoY + logoRadius, logoRadius)
     .fillAndStroke('#FFD700', '#B8860B');
  
  // Texto "FC" no centro do logo
  doc.fontSize(20)
     .fillColor('#FFFFFF')
     .text('FC', logoX + logoRadius - 10, logoY + logoRadius - 8);

  // Cabeçalho da empresa
  doc.fontSize(16)
     .fillColor('#000000')
     .font('Helvetica-Bold')
     .text('FUNERÁRIA CENTRAL DE BARUERI LTDA', logoX + 90, logoY + 10);

  doc.fontSize(10)
     .font('Helvetica')
     .text('RUA ANHANGUERA 2591 - VL. SÃO FRANCISCO BARUERI / SP - 06.442-050', logoX + 90, logoY + 30)
     .text('(11) 4706-1166 / (11) 4198-3843 / 08000-557355', logoX + 90, logoY + 45);

  // Data no canto direito
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  doc.text(`Barueri quarta-feira, ${dataAtual}`, 400, logoY + 60);

  // Linha separadora
  doc.moveTo(50, 150).lineTo(550, 150).stroke();

  // Dados da contratada
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('FACIL ASSIST SERVIÇOS E ASSISTÊNCIA 24 HORAS LTDA - CNPJ: 13349528000112', 50, 170);

  doc.fontSize(10)
     .font('Helvetica')
     .text('ENDEREÇO: Rua do Imperador - N° 14 CEP: 09770-310 | Nova Petrópolis - São Bernardo do Campo / SP', 50, 185);

  // Dados principais da nota
  const yPos = 220;
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('NOTA DE DÉBITO NÚMERO:', 50, yPos)
     .text(nota.numeroProcesso, 200, yPos);

  doc.text('NÚMERO DO PROCESSO:', 280, yPos)
     .text(nota.numeroProcesso, 420, yPos);

  doc.text('VALOR DA NOTA DE DÉBITO:', 50, yPos + 20)
     .text(`R$ ${parseFloat(nota.valor).toFixed(2).replace('.', ',')}`, 200, yPos + 20);

  // Texto principal
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Vimos pela presente nota de débito solicitar a V.Sª, o reembolso do valor acima mencionado, referente ao`, 50, yPos + 50)
     .text(`pagamento das despesas de Funeral, solicitados no dia ${new Date(nota.data).toLocaleDateString('pt-BR')} para ${nota.nomeFalecido}`, 50, yPos + 65);

  // Seção de pagamento
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('O crédito deverá ser realizado na seguinte conta:', 50, yPos + 100);

  doc.fontSize(10)
     .font('Helvetica')
     .text('Banco: Itaú', 50, yPos + 120)
     .text('Agência: 0004', 50, yPos + 135)
     .text('Conta Corrente: 68044-9', 50, yPos + 150)
     .text('CNPJ: 52.510.989/0001-87', 50, yPos + 165);

  // QR Code placeholder
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .text('Caso queira realizar o pix:', 300, yPos + 100);

  // Desenhar placeholder para QR Code
  doc.rect(350, yPos + 120, 80, 80).stroke();
  doc.fontSize(8)
     .font('Helvetica')
     .text('QR CODE', 375, yPos + 155);

  doc.fontSize(10)
     .text('chave pix: CNPJ: 52.510.989/0001-87', 300, yPos + 210);

  // Área de assinatura
  const assinaturaY = yPos + 280;
  
  // Linha para assinatura
  doc.moveTo(200, assinaturaY).lineTo(400, assinaturaY).stroke();
  
  // Carimbo simulado
  doc.rect(250, assinaturaY + 20, 120, 60).stroke();
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('52.510.989/0001-87', 265, assinaturaY + 35);

  // Rodapé
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('FUNERÁRIA CENTRAL DE BARUERI LTDA-ME', 200, assinaturaY + 120);

  // Endereço no rodapé
  doc.rect(180, assinaturaY + 140, 200, 40).stroke();
  doc.fontSize(9)
     .font('Helvetica')
     .text('Rua: Anhanguera, 2591', 200, assinaturaY + 150)
     .text('Vila São Francisco - Cep 06442 - 070', 200, assinaturaY + 165)
     .text('BARUERI -SP', 270, assinaturaY + 180);

  return doc;
}