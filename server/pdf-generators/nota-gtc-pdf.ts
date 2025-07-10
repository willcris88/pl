/**
 * Gerador de PDF para Nota GTC (Guia de Transporte de Cadáveres)
 * Baseado no design oficial da Funerária Central de Barueri
 */

import PDFDocument from 'pdfkit';
import { type NotaGtc } from '@shared/schema';

export function gerarNotaGtcPdf(nota: NotaGtc): PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 30,
    info: {
      Title: `GTC ${nota.numeroDeclaracao}`,
      Author: 'Funerária Central de Barueri',
      Subject: 'Guia de Transporte de Cadáveres',
      Keywords: 'GTC, Transporte, Cadáver, Funerária'
    }
  });

  // Cabeçalho com três logotipos
  const logoY = 30;
  const logoRadius = 25;
  
  // Logo 1 - Funerária (esquerda)
  doc.circle(60, logoY + logoRadius, logoRadius)
     .fillAndStroke('#FFD700', '#B8860B');
  doc.fontSize(12)
     .fillColor('#FFFFFF')
     .text('FC', 55, logoY + logoRadius - 5);

  // Logo 2 - Prefeitura (centro)
  doc.circle(280, logoY + logoRadius, logoRadius)
     .fillAndStroke('#4169E1', '#191970');
  doc.fontSize(10)
     .fillColor('#FFFFFF')
     .text('PB', 275, logoY + logoRadius - 5);

  // Logo 3 - GTC (direita)
  doc.rect(480, logoY, 80, 50)
     .fillAndStroke('#E6E6E6', '#CCCCCC');
  doc.fontSize(10)
     .fillColor('#000000')
     .text('GTC - GUIA DE', 485, logoY + 10)
     .text('TRANSPORTE', 490, logoY + 25)
     .text('DE CADÁVERES', 485, logoY + 40);

  // Cabeçalho principal
  doc.fontSize(14)
     .fillColor('#000000')
     .font('Helvetica-Bold')
     .text('FUNERÁRIA CENTRAL DE BARUERI LTDA', 100, logoY + 10);

  doc.fontSize(8)
     .font('Helvetica')
     .text('RUA ANHANGUERA 2591', 100, logoY + 25)
     .text('VL. SÃO FRANCISCO BARUERI / SP - 06.442-050', 100, logoY + 35)
     .text('(11) 4706-1166 / (11) 4198-3843 / 08000-557355', 100, logoY + 45);

  // Prefeitura
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('PREFEITURA DE', 320, logoY + 10);
  doc.fontSize(14)
     .text('BARUERI', 335, logoY + 25);

  // Número da declaração
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text(`Número da Declaração de Óbito: ${nota.numeroDeclaracao}`, 50, logoY + 80);

  // Seção DADOS GERAIS
  let yPos = logoY + 120;
  
  // Cabeçalho da tabela
  doc.rect(50, yPos, 500, 20)
     .fillAndStroke('#D3D3D3', '#000000');
  doc.fontSize(12)
     .fillColor('#000000')
     .font('Helvetica-Bold')
     .text('DADOS GERAIS', 260, yPos + 5);

  // Linha 1 - Nome e CPF
  yPos += 20;
  doc.rect(50, yPos, 300, 25).stroke();
  doc.rect(350, yPos, 200, 25).stroke();
  
  doc.fontSize(8)
     .font('Helvetica-Bold')
     .text('Nome Falecido:', 55, yPos + 5);
  doc.font('Helvetica')
     .text((nota.nomeFalecido || '').toUpperCase(), 55, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('CPF Nº:', 355, yPos + 5);
  doc.font('Helvetica')
     .text(nota.cpfFalecido || '', 355, yPos + 15);

  // Linha 2 - Datas
  yPos += 25;
  doc.rect(50, yPos, 166, 25).stroke();
  doc.rect(216, yPos, 167, 25).stroke();
  doc.rect(383, yPos, 167, 25).stroke();

  doc.fontSize(8)
     .font('Helvetica-Bold')
     .text('Data Nascimento:', 55, yPos + 5);
  doc.font('Helvetica')
     .text(nota.dataNascimento ? new Date(nota.dataNascimento).toLocaleDateString('pt-BR') : '', 55, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('Data Falecimento:', 221, yPos + 5);
  doc.font('Helvetica')
     .text(nota.dataFalecimento ? new Date(nota.dataFalecimento).toLocaleDateString('pt-BR') : '', 221, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('Data Transporte:', 388, yPos + 5);
  doc.font('Helvetica')
     .text(nota.dataTransporte ? new Date(nota.dataTransporte).toLocaleDateString('pt-BR') : '', 388, yPos + 15);

  // Linha 3 - Locais
  yPos += 25;
  doc.rect(50, yPos, 245, 25).stroke();
  doc.rect(295, yPos, 255, 25).stroke();

  doc.fontSize(8)
     .font('Helvetica-Bold')
     .text('Local Falecimento:', 55, yPos + 5);
  doc.font('Helvetica')
     .text((nota.localFalecimento || '').toUpperCase(), 55, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('Local Retirada Óbito:', 300, yPos + 5);
  doc.font('Helvetica')
     .text((nota.localRetiradaObito || '').toUpperCase(), 300, yPos + 15);

  // Linha 4 - Destino
  yPos += 25;
  doc.rect(50, yPos, 500, 25).stroke();

  doc.fontSize(8)
     .font('Helvetica-Bold')
     .text('Destino:', 55, yPos + 5);
  doc.font('Helvetica')
     .text((nota.destinoCorpo || '').toUpperCase(), 55, yPos + 15);

  // Seção DADOS TRANSPORTADOR
  yPos += 40;
  doc.rect(50, yPos, 500, 20)
     .fillAndStroke('#D3D3D3', '#000000');
  doc.fontSize(12)
     .fillColor('#000000')
     .font('Helvetica-Bold')
     .text('DADOS TRANSPORTADOR', 235, yPos + 5);

  // Linha 1 - Empresa, CNPJ, Município
  yPos += 20;
  doc.rect(50, yPos, 200, 25).stroke();
  doc.rect(250, yPos, 150, 25).stroke();
  doc.rect(400, yPos, 150, 25).stroke();

  doc.fontSize(8)
     .font('Helvetica-Bold')
     .text('Empresa:', 55, yPos + 5);
  doc.font('Helvetica')
     .text((nota.empresaTransportador || '').toUpperCase(), 55, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('CNPJ Nº:', 255, yPos + 5);
  doc.font('Helvetica')
     .text(nota.cnpjTransportador || '', 255, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('Município:', 405, yPos + 5);
  doc.font('Helvetica')
     .text((nota.municipioTransportador || '').toUpperCase(), 405, yPos + 15);

  // Linha 2 - Agente, Documento, Placa, Veículo
  yPos += 25;
  doc.rect(50, yPos, 125, 25).stroke();
  doc.rect(175, yPos, 125, 25).stroke();
  doc.rect(300, yPos, 125, 25).stroke();
  doc.rect(425, yPos, 125, 25).stroke();

  doc.fontSize(8)
     .font('Helvetica-Bold')
     .text('Motorista/Agente Funerário:', 55, yPos + 5);
  doc.font('Helvetica')
     .text((nota.agenteFunerario || '').toUpperCase(), 55, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('Documento Agente:', 180, yPos + 5);
  doc.font('Helvetica')
     .text(nota.rcCpfCnjAgente || '', 180, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('Placa:', 305, yPos + 5);
  doc.font('Helvetica')
     .text(nota.placaCarro || '', 305, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('Veículo:', 430, yPos + 5);
  doc.font('Helvetica')
     .text((nota.modeloCarro || '').toUpperCase(), 430, yPos + 15);

  // Seção DADOS EMISSÃO
  yPos += 40;
  doc.rect(50, yPos, 500, 20)
     .fillAndStroke('#D3D3D3', '#000000');
  doc.fontSize(12)
     .fillColor('#000000')
     .font('Helvetica-Bold')
     .text('DADOS EMISSÃO', 250, yPos + 5);

  // Linha 1 - Empresa Responsável
  yPos += 20;
  doc.rect(50, yPos, 500, 25).stroke();

  doc.fontSize(8)
     .font('Helvetica-Bold')
     .text('Empresa Responsável:', 55, yPos + 5);
  doc.font('Helvetica')
     .text('FUNERÁRIA CENTRAL DE BARUERI LTDA ME', 55, yPos + 15);

  // Linha 2 - Responsável, Local, Data/Hora
  yPos += 25;
  doc.rect(50, yPos, 166, 25).stroke();
  doc.rect(216, yPos, 167, 25).stroke();
  doc.rect(383, yPos, 167, 25).stroke();

  doc.fontSize(8)
     .font('Helvetica-Bold')
     .text('Responsável:', 55, yPos + 5);
  doc.font('Helvetica')
     .text('ADALGISA', 55, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('Local Emissão:', 221, yPos + 5);
  doc.font('Helvetica')
     .text('BARUERI - SP', 221, yPos + 15);

  doc.font('Helvetica-Bold')
     .text('Data e Hora Emissão:', 388, yPos + 5);
  doc.font('Helvetica')
     .text(new Date().toLocaleString('pt-BR'), 388, yPos + 15);

  // Seção OBSERVAÇÕES
  yPos += 40;
  doc.rect(50, yPos, 500, 20)
     .fillAndStroke('#D3D3D3', '#000000');
  doc.fontSize(12)
     .fillColor('#000000')
     .font('Helvetica-Bold')
     .text('OBSERVAÇÕES', 250, yPos + 5);

  // Área de observações
  yPos += 20;
  doc.rect(50, yPos, 500, 60).stroke();
  doc.fontSize(10)
     .font('Helvetica')
     .text(nota.observacoes || (nota.destinoCorpo || '').toUpperCase(), 55, yPos + 10);

  return doc;
}