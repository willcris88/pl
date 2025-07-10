/**
 * Gerador de PDF para Declaração de Óbito - Layout Oficial
 * Baseado no documento real da Funerária Central de Barueri
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Gera PDF da Declaração de Óbito com 5 vias
 * @param {Object} obito - Dados do óbito
 * @returns {PDFDocument}
 */
function gerarDeclaracaoObito(obito) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 20, bottom: 30, left: 30, right: 30 }
  });

  const vias = [
    'VIA CARTÓRIO',
    'VIA Arquivo',
    'VIA Cemitério',
    'VIA Família',
    'VIA Corregedoria'
  ];

  vias.forEach((via, index) => {
    if (index > 0) doc.addPage();
    gerarViaDeclaracao(doc, obito, via);
  });

  doc.end();
  return doc;
}

function gerarViaDeclaracao(doc, obito, tipoVia) {
  const pageWidth = doc.page.width;
  const margin = 30;
  const contentWidth = pageWidth - (margin * 2);

  // === CABEÇALHO OFICIAL ===
  // Fundo cinza claro elegante
  doc.rect(0, 0, pageWidth, 80)
     .fill('#f8fafc');

  // Logo da Central Assist
  try {
    const logoPath = path.join(process.cwd(), 'assets', 'logopdf.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin, 15, { width: 55, height: 55 });
    }
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
  }

  // Informações da empresa - Layout centralizado oficial
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('FUNERARIA CENTRAL DE BARUERI LTDA', 0, 20, { 
       width: pageWidth, 
       align: 'center' 
     });

  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#374151')
     .text('RUA ANHANGUERA,2591 - VL. SAO FRANCISCO BARUERI / SP - 06.442-050', 0, 38, { 
       width: pageWidth, 
       align: 'center' 
     })
     .text('(11) 4706-1166 / (11) 4198-3843 / 08000-557355', 0, 52, { 
       width: pageWidth, 
       align: 'center' 
     });

  // === TÍTULO PRINCIPAL ===
  doc.rect(0, 90, pageWidth, 35)
     .fill('#1e40af');

  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#ffffff')
     .text('DECLARAÇÃO DE ÓBITO', 0, 100, { 
       width: pageWidth, 
       align: 'center' 
     });

  doc.fontSize(12)
     .fillColor('#e2e8f0')
     .text(tipoVia, 0, 116, { 
       width: pageWidth, 
       align: 'center' 
     });

  // === LINHA DE DADOS PRINCIPAIS ===
  let currentY = 140;
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  
  doc.fillColor('#000000')
     .fontSize(10)
     .font('Helvetica')
     .text(`Data: ${dataAtual}`, margin, currentY);

  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text((obito.nome || 'NOME NÃO INFORMADO').toUpperCase(), 0, currentY, { 
       width: pageWidth, 
       align: 'center' 
     });

  doc.fontSize(10)
     .font('Helvetica')
     .text(`Numero: ${String(obito.id || '000000').padStart(6, '0')}`, pageWidth - 120, currentY);

  currentY += 30;

  // === DADOS PESSOAIS ===
  // Primeira linha
  doc.fontSize(9)
     .font('Helvetica')
     .text(`Sexo: ${obito.sexo || 'N/I'}`, margin, currentY)
     .text(`Cor: ${obito.cor || 'N/I'}`, margin + 100, currentY)
     .text(`Profissão: ${obito.profissao || 'N/I'}`, margin + 200, currentY)
     .text(`Naturalidade: ${obito.naturalidade || 'N/I'}`, margin + 350, currentY);

  currentY += 15;

  // Segunda linha
  doc.text(`Endereço: ${obito.endereco || 'N/I'}`, margin, currentY)
     .text(`Bairro: ${obito.bairro || 'N/I'}`, margin + 200, currentY)
     .text(`Cidade: ${obito.cidade || 'N/I'}`, margin + 300, currentY)
     .text(`Estado: ${obito.estado || 'N/I'}`, margin + 450, currentY);

  currentY += 15;

  // Terceira linha
  doc.text(`Estado Civil: ${obito.estadoCivil || 'N/I'}`, margin, currentY)
     .text(`RG: ${obito.rg || 'N/I'}`, margin + 150, currentY)
     .text(`CPF: ${obito.cpf || 'N/I'}`, margin + 250, currentY)
     .text(`Bens: ${obito.deixaBens || 'N/I'}`, margin + 380, currentY);

  currentY += 15;

  // Quarta linha
  doc.text(`Testamento: ${obito.testamento || 'N/I'}`, margin, currentY)
     .text(`Nascimento: ${formatarData(obito.nascimento)}`, margin + 150, currentY)
     .text(`Idade: ${calcularIdade(obito.nascimento, obito.dataFalecimento)}`, margin + 300, currentY);

  currentY += 35;

  // === SEÇÃO CÔNJUGE ===
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('CONJUGUE', 0, currentY, { width: pageWidth, align: 'center' });

  currentY += 20;
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#000000')
     .text(`Nome conjugue: ${obito.nomeConjuge || 'N/I'}`, margin, currentY);

  currentY += 30;

  // === SEÇÃO FILIAÇÃO ===
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('FILIAÇÃO', 0, currentY, { width: pageWidth, align: 'center' });

  currentY += 20;
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#000000')
     .text(`Nome Pai: ${obito.nomePai || 'N/I'}`, margin, currentY)
     .text(`Estado civil Pai: ${obito.estadoCivilPai || 'N/I'}`, margin + 350, currentY);

  currentY += 15;
  doc.text(`Nome Mãe: ${obito.nomeMae || 'N/I'}`, margin, currentY)
     .text(`Estado civil Mãe: ${obito.estadoCivilMae || 'N/I'}`, margin + 350, currentY);

  currentY += 30;

  // === SEÇÃO DADOS ÓBITO ===
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('DADOS ÓBITO', 0, currentY, { width: pageWidth, align: 'center' });

  currentY += 20;
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#000000')
     .text(`Fal: ${formatarData(obito.dataFalecimento)}`, margin, currentY)
     .text(`Hora: ${obito.horaFalecimento || '00:00:00'}`, margin + 100, currentY)
     .text(`Local: ${obito.localFalecimento || 'N/I'}`, margin + 200, currentY)
     .text(`Cidade: ${obito.cidadeFalecimento || 'N/I'}`, margin + 350, currentY);

  currentY += 15;
  doc.text(`Sep: ${formatarData(obito.dataSepultamento)}`, margin, currentY)
     .text(`Hora: ${obito.horaSepultamento || '00:00:00'}`, margin + 100, currentY)
     .text(`Local: ${obito.localSepultamento || 'N/I'}`, margin + 200, currentY)
     .text(`Cidade: ${obito.cidadeSepultamento || 'N/I'}`, margin + 350, currentY);

  currentY += 15;
  doc.text(`Medico 1: ${obito.medico1 || 'N/I'}`, margin, currentY)
     .text(`CRM: ${obito.crm1 || 'N/I'}`, margin + 350, currentY);

  currentY += 15;
  doc.text(`Medico 2: ${obito.medico2 || '************'}`, margin, currentY)
     .text(`CRM: ${obito.crm2 || '************'}`, margin + 350, currentY);

  currentY += 15;
  doc.text(`CAUSA: ${obito.causaMorte || 'N/I'}`, margin, currentY);

  currentY += 30;

  // === SEÇÃO FILHOS ===
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('FILHOS', 0, currentY, { width: pageWidth, align: 'center' });

  currentY += 20;
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#000000')
     .text(obito.filhos || 'N/I', margin, currentY);

  currentY += 30;

  // === SEÇÃO OBSERVAÇÃO ===
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('OBSERVAÇÃO', 0, currentY, { width: pageWidth, align: 'center' });

  currentY += 20;
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#000000')
     .text(obito.observacoes || '************', margin, currentY);

  currentY += 30;

  // === DADOS DA DECLARAÇÃO ===
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('DADOS DA DECLARAÇÃO', 0, currentY, { width: pageWidth, align: 'center' });

  currentY += 20;
  const textoDeclaracao = `Li e reli a presente declaração, estando de acordo com as informações nela consignadas, responsabilizando-me por eventuais divergências que possam ser constatadas. A presente declaração é válida para fins de sepultamento e remoção de corpos, inclusive para além dos limites do Município de Barueri, nos termos da Portaria nº 16/86 da Corregedoria Permanente.`;

  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#000000')
     .text(textoDeclaracao, margin, currentY, { 
       width: contentWidth,
       lineGap: 2
     });

  currentY += 50;

  // Dados do declarante
  doc.fontSize(9)
     .text(`Declarante: ${obito.declarante || 'N/I'}`, margin, currentY)
     .text(`RG: ${obito.rgDeclarante || 'N/I'}`, margin + 250, currentY)
     .text(`CPF: ${obito.cpfDeclarante || 'N/I'}`, margin + 380, currentY);

  currentY += 15;
  doc.text(`GRAU: ${obito.grauDeclarante || 'N/I'}`, margin, currentY)
     .text(`TELEFONE: ${obito.telefoneDeclarante || 'N/I'}`, margin + 200, currentY);

  currentY += 15;
  doc.text(`CEP: ${obito.cepDeclarante || 'N/I'}`, margin, currentY)
     .text(`ENDEREÇO: ${obito.enderecoDeclarante || 'N/I'}`, margin + 100, currentY)
     .text(`LOCAL: ${obito.localDeclarante || 'N/I'}`, margin + 350, currentY);

  currentY += 30;

  // === SEÇÃO ATENDENTE ===
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#1e40af')
     .text('ATENDENTE', 0, currentY, { width: pageWidth, align: 'center' });

  currentY += 20;
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#000000')
     .text(`RESPONSAVEL PRENCHIMENTO: ${obito.responsavelPreenchimento || 'N/I'}`, margin, currentY)
     .text(`NUMERO ÓBITO: ${obito.id || '000000'}`, margin + 350, currentY);

  currentY += 15;
  const textoAtendente = `Declaro que estou de posse da declaração de óbito emitida pelo médico, referente ao falecido(a) ${(obito.nome || 'N/I').toUpperCase()} prometendo providenciar perante o cartório de BARUERI local do falecimento do Quede Cujus o assento de óbito ao prazo máximo de 15 dias`;

  doc.fontSize(8)
     .text(textoAtendente, margin, currentY, { 
       width: contentWidth,
       lineGap: 2
     });

  currentY += 40;

  // === ASSINATURAS ===
  doc.fontSize(9)
     .font('Helvetica')
     .text('________________________________________', margin + 50, currentY)
     .text('_________________________________________', margin + 300, currentY);

  currentY += 15;
  doc.text('ASSINATURA DO FUNCIONARIO(A)', margin + 80, currentY)
     .text('ASSINATURA DO DECLARANTE', margin + 330, currentY);

  // === RODAPÉ ===
  const footerY = doc.page.height - 40;
  doc.fontSize(8)
     .font('Helvetica')
     .fillColor('#374151')
     .text('Vias: 1ª-Cartório, 2ª-Arquivo, 3ª-Cemitério, 4ª-Familia, 5ª-Corregedoria', 0, footerY, { 
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
    return `${idade} ano(s)`;
  } catch {
    return 'N/I';
  }
}

export { gerarDeclaracaoObito };