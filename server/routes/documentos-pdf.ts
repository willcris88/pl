/**
 * SISTEMA DE DOCUMENTOS PDF AUTOMÁTICO
 * Cada arquivo enviado é convertido para PDF individual
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { documentos } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

const uploadPath = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

/**
 * Converter arquivo para PDF
 */
async function converterParaPDF(caminhoOriginal: string, nomeOriginal: string): Promise<{ caminhoPDF: string, nomePDF: string }> {
  const ext = path.extname(nomeOriginal).toLowerCase();
  const nomeBase = path.basename(nomeOriginal, ext);
  const nomePDF = `${nomeBase}.pdf`;
  const caminhoPDF = path.join(uploadPath, `pdf_${Date.now()}_${nomePDF}`);

  if (ext === '.pdf') {
    // Se já é PDF, apenas copiar
    fs.copyFileSync(caminhoOriginal, caminhoPDF);
    return { caminhoPDF: path.basename(caminhoPDF), nomePDF };
  }

  // Converter imagem para PDF
  if (['.png', '.jpg', '.jpeg', '.gif', '.bmp'].includes(ext)) {
    const arquivoBuffer = fs.readFileSync(caminhoOriginal);
    
    // Otimizar imagem
    const imagemJpeg = await sharp(arquivoBuffer)
      .jpeg({ quality: 85 })
      .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    // Criar PDF
    const pdfDoc = await PDFDocument.create();
    const imagem = await pdfDoc.embedJpg(imagemJpeg);
    const page = pdfDoc.addPage([595, 842]); // A4

    const { width, height } = imagem.size();
    const maxWidth = 500;
    const maxHeight = 700;
    
    let imgWidth = width;
    let imgHeight = height;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      imgWidth = width * ratio;
      imgHeight = height * ratio;
    }
    
    const x = (595 - imgWidth) / 2;
    const y = (842 - imgHeight) / 2;
    
    page.drawImage(imagem, { x, y, width: imgWidth, height: imgHeight });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(caminhoPDF, pdfBytes);

    return { caminhoPDF: path.basename(caminhoPDF), nomePDF };
  }

  // Para outros tipos, criar PDF de texto
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  
  page.drawText(`Documento: ${nomeOriginal}`, {
    x: 50,
    y: 750,
    size: 16
  });
  
  page.drawText('Tipo de arquivo não suportado para preview', {
    x: 50,
    y: 700,
    size: 12
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(caminhoPDF, pdfBytes);

  return { caminhoPDF: path.basename(caminhoPDF), nomePDF };
}

/**
 * GET /api/documentos-pdf/:ordemServicoId
 */
router.get('/:ordemServicoId', requireAuth, async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.params.ordemServicoId);
    
    const docs = await db.select().from(documentos)
      .where(eq(documentos.ordemServicoId, ordemServicoId));
    
    res.json(docs);
  } catch (error: any) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ message: "Erro ao buscar documentos" });
  }
});

/**
 * POST /api/documentos-pdf/upload
 */
router.post('/upload', requireAuth, upload.array('documentos', 20), async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.body.ordemServicoId);
    const files = req.files as Express.Multer.File[];

    if (!ordemServicoId || !files || files.length === 0) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    const documentosCriados = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        console.log(`Convertendo para PDF: ${file.originalname}`);
        
        // Converter para PDF
        const { caminhoPDF, nomePDF } = await converterParaPDF(file.path, file.originalname);
        
        // Obter tamanho do PDF
        const pdfPath = path.join(uploadPath, caminhoPDF);
        const pdfStats = fs.statSync(pdfPath);

        // Salvar no banco
        const [documento] = await db.insert(documentos).values({
          ordemServicoId,
          nome: nomePDF,
          caminho: caminhoPDF,
          tamanho: pdfStats.size,
          tipo: '.pdf',
          ordem: i,
          consolidado: false
        }).returning();

        documentosCriados.push(documento);
        
        // Remover arquivo original se não for PDF
        if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
          fs.unlinkSync(file.path);
        }

        console.log(`PDF criado: ${nomePDF} - ID: ${documento.id}`);
      } catch (error) {
        console.error(`Erro ao processar ${file.originalname}:`, error);
      }
    }

    res.json({ 
      message: `${documentosCriados.length} documento(s) convertido(s) para PDF`, 
      documentos: documentosCriados 
    });

  } catch (error: any) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: "Erro no upload de documentos" });
  }
});

/**
 * GET /api/documentos-pdf/:id/preview
 */
router.get('/:id/preview', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [documento] = await db.select().from(documentos)
      .where(eq(documentos.id, id)).limit(1);
    
    if (!documento) {
      return res.status(404).json({ message: "Documento não encontrado" });
    }

    const caminhoArquivo = path.join(uploadPath, documento.caminho);
    
    if (!fs.existsSync(caminhoArquivo)) {
      return res.status(404).json({ message: "Arquivo não encontrado" });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    
    const fileStream = fs.createReadStream(caminhoArquivo);
    fileStream.pipe(res);

  } catch (error: any) {
    console.error('Erro no preview:', error);
    res.status(500).json({ message: "Erro no preview" });
  }
});

/**
 * GET /api/documentos-pdf/:id/download
 */
router.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [documento] = await db.select().from(documentos)
      .where(eq(documentos.id, id)).limit(1);
    
    if (!documento) {
      return res.status(404).json({ message: "Documento não encontrado" });
    }

    const caminhoArquivo = path.join(uploadPath, documento.caminho);
    
    if (!fs.existsSync(caminhoArquivo)) {
      return res.status(404).json({ message: "Arquivo não encontrado" });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${documento.nome}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    const fileStream = fs.createReadStream(caminhoArquivo);
    fileStream.pipe(res);

  } catch (error: any) {
    console.error('Erro no download:', error);
    res.status(500).json({ message: "Erro no download" });
  }
});

/**
 * PATCH /api/documentos-pdf/:id/renomear
 */
router.patch('/:id/renomear', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { novoNome } = req.body;

    if (!novoNome || typeof novoNome !== 'string') {
      return res.status(400).json({ message: "Nome é obrigatório" });
    }

    const [documento] = await db.select().from(documentos)
      .where(eq(documentos.id, id)).limit(1);
    
    if (!documento) {
      return res.status(404).json({ message: "Documento não encontrado" });
    }

    // Garantir que termine com .pdf
    const nomeCompleto = novoNome.endsWith('.pdf') ? novoNome : `${novoNome}.pdf`;

    await db.update(documentos)
      .set({ nome: nomeCompleto })
      .where(eq(documentos.id, id));

    res.json({ message: "Documento renomeado com sucesso", nome: nomeCompleto });
  } catch (error: any) {
    console.error('Erro ao renomear documento:', error);
    res.status(500).json({ message: "Erro ao renomear documento" });
  }
});

/**
 * DELETE /api/documentos-pdf/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [documento] = await db.select().from(documentos)
      .where(eq(documentos.id, id)).limit(1);
    
    if (!documento) {
      return res.status(404).json({ message: "Documento não encontrado" });
    }

    // Excluir arquivo físico
    const caminhoArquivo = path.join(uploadPath, documento.caminho);
    if (fs.existsSync(caminhoArquivo)) {
      fs.unlinkSync(caminhoArquivo);
    }

    // Excluir do banco
    await db.delete(documentos).where(eq(documentos.id, id));

    res.json({ message: "Documento excluído com sucesso" });
  } catch (error: any) {
    console.error('Erro ao excluir documento:', error);
    res.status(500).json({ message: "Erro ao excluir documento" });
  }
});

export { router as documentosPdfRoutes };