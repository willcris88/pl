/**
 * Gerador de PDF para Ata de Somatoconservação
 * Documento oficial para procedimentos de conservação do corpo
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Gera PDF da Ata de Somatoconservação
 * @param {Object} dados - Dados do procedimento
 * @returns {PDFDocument}
 */
function gerarAtaSomatoconservacao(dados) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 20, bottom: 30, left: 30, right: 30 }
  });

  gerarViaAta(doc, dados);
  doc.end();
  return doc;
}

function gerarViaAta(doc, dados) {
  const pageWidth = doc.page.width;
  const margin = 30;
  const contentWidth = pageWidth - (margin * 2);

  // === CABEÇALHO OFICIAL ===
  // Logo da Central Assist
  try {
    const logoPath = path.join(process.cwd(), 'assets', 'logopdf.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin, 15, { width: 80, height: 80 });
    }
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
  }

  // Informações da empresa - lado direito do logo
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('FUNERARIA CENTRAL DE BARUERI LTDA', margin + 100, 25);

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#374151')
     .text('RUA ANHANGUERA,2591 - VL. SAO FRANCISCO BARUERI / SP - 06.442-050', margin + 100, 45)
     .text('(11) 4706-1166 / (11) 4198-3843 / 08000-557355', margin + 100, 60);

  // Linha separadora
  doc.moveTo(margin, 110)
     .lineTo(pageWidth - margin, 110)
     .stroke('#dc2626')
     .lineWidth(2);

  let currentY = 130;

  // === TÍTULO PRINCIPAL ===
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('ATA DE SOMATOCONSERVAÇÃO', 0, currentY, { 
       width: pageWidth, 
       align: 'center' 
     });

  currentY += 40;

  // === TEXTO DECLARATIVO ===
  const textoDeclarativo = `Declaramos para os devidos fins de direito, que o presente corpo foi preparado e cuja técnica empregada obedece-os padrões exigidos`;
  
  doc.fontSize(12)
     .font('Helvetica')
     .fillColor('#000000')
     .text(textoDeclarativo, margin, currentY, { 
       width: contentWidth,
       align: 'center',
       lineGap: 3
     });

  currentY += 50;

  // Linha separadora
  doc.moveTo(margin, currentY)
     .lineTo(pageWidth - margin, currentY)
     .stroke('#dc2626')
     .lineWidth(1);

  currentY += 20;

  // === SEÇÃO: DADOS DO FALECIDO ===
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('Dados do falecido', 0, currentY, { 
       width: pageWidth, 
       align: 'center' 
     });

  currentY += 25;

  // Dados do falecido - layout organizado
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Nome: `, margin, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.nome || 'N/I'}`, margin + 40, currentY);

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Nascimento: `, margin + 300, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${formatarData(dados.nascimento)}`, margin + 375, currentY);

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Idade: `, margin + 480, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${calcularIdade(dados.nascimento, dados.dataFalecimento)}`, margin + 510, currentY);

  currentY += 18;

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Sexo: `, margin, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.sexo || 'N/I'}`, margin + 35, currentY);

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Cor: `, margin + 150, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.cor || 'N/I'}`, margin + 170, currentY);

  currentY += 18;

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Naturalidade: `, margin, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.naturalidade || 'N/I'}`, margin + 75, currentY);

  currentY += 18;

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Pai: `, margin, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.nomePai || 'N/I'}`, margin + 25, currentY);

  currentY += 18;

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Mãe: `, margin, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.nomeMae || 'N/I'}`, margin + 30, currentY);

  currentY += 35;

  // Linha separadora
  doc.moveTo(margin, currentY)
     .lineTo(pageWidth - margin, currentY)
     .stroke('#dc2626')
     .lineWidth(1);

  currentY += 20;

  // === SEÇÃO: DADOS DO FALECIMENTO ===
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('Dados do Falecimento', 0, currentY, { 
       width: pageWidth, 
       align: 'center' 
     });

  currentY += 25;

  // Primeira linha de dados do falecimento
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Data: `, margin, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${formatarData(dados.dataFalecimento)}`, margin + 35, currentY);

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Hora: `, margin + 150, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.horaFalecimento || '00:00:00'}`, margin + 180, currentY);

  currentY += 18;

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Cidade: `, margin, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.cidadeFalecimento || 'N/I'}`, margin + 45, currentY);

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Local do Falecimento: `, margin + 200, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.localFalecimento || 'N/I'}`, margin + 310, currentY);

  currentY += 18;

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Medico: `, margin, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.medico1 || 'N/I'}`, margin + 50, currentY);

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`CRM: `, margin + 350, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.crm1 || 'N/I'}`, margin + 380, currentY);

  currentY += 18;

  doc.font('Helvetica-Bold')
     .fillColor('#000000')
     .text(`Causa Morte: `, margin, currentY);
  
  doc.font('Helvetica')
     .fillColor('#666666')
     .text(`${dados.causaMorte || 'N/I'}`, margin + 80, currentY);

  currentY += 35;

  // Linha separadora
  doc.moveTo(margin, currentY)
     .lineTo(pageWidth - margin, currentY)
     .stroke('#dc2626')
     .lineWidth(1);

  currentY += 20;

  // === SEÇÃO: PROCEDIMENTO ===
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#000000')
     .text('PROCEDIMENTO', 0, currentY, { 
       width: pageWidth, 
       align: 'center' 
     });

  currentY += 25;

  // Texto do procedimento - formatado conforme o documento original
  const dataProc = dados.dataProcedimento ? formatarData(dados.dataProcedimento) : formatarData(new Date());
  const horaProc = dados.horaProcedimento || new Date().toLocaleTimeString('pt-BR');
  const tecnico = dados.tecnicoResponsavel || 'N/I';

  const textoProcedimento = `Às ${horaProc} Hrs do dia ${dataProc}, o ${tecnico}, técnico responsável iniciou o trabalho de tanatopraxia no cadáver em apreço aberta a artéria femoral direita ao 1/3 (um terço) próximo ao colo do fêmur direito, introduziu-se cerca de 5 litros de solução aquosa de tanatopraxia fluido arterial. Após a drenagem total do líquido e fechamento da incisão femoral foi inspirado os líquidos e detritos abdominais e injetado na cavidade abdominal cerca de 500 ml de líquido trato cavitário. Encerrando-se o processo de tanatopraxia da qual foi lavrada a presente ata em 2 (duas) vias.`;

  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#666666')
     .text(textoProcedimento, margin, currentY, { 
       width: contentWidth,
       lineGap: 3,
       align: 'justify'
     });

  currentY += 100;

  // === ASSINATURAS ===
  currentY += 30;
  
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#000000')
     .text('Barueri, ' + formatarData(new Date()), margin, currentY);

  currentY += 40;

  // Linha para assinatura
  doc.moveTo(margin + 200, currentY)
     .lineTo(margin + 400, currentY)
     .stroke('#666666');

  currentY += 15;
  
  doc.fontSize(9)
     .font('Helvetica')
     .text('Técnico Responsável', 0, currentY, { 
       width: pageWidth, 
       align: 'center' 
     });

  currentY += 5;
  
  doc.text(`${tecnico}`, 0, currentY, { 
     width: pageWidth, 
     align: 'center' 
   });
}

function formatarData(dataString) {
  if (!dataString) return 'N/I';
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return 'N/I';
    return data.toLocaleDateString('pt-BR');
  } catch {
    return 'N/I';
  }
}

function calcularIdade(nascimento, falecimento) {
  if (!nascimento || !falecimento) return 'N/I';
  try {
    const nasc = new Date(nascimento);
    const falec = new Date(falecimento);
    if (isNaN(nasc.getTime()) || isNaN(falec.getTime())) return 'N/I';
    
    let idade = falec.getFullYear() - nasc.getFullYear();
    const m = falec.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) {
      idade--;
    }
    return `${idade} ANO(S)`;
  } catch {
    return 'N/I';
  }
}

export { gerarAtaSomatoconservacao };