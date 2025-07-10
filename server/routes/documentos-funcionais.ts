/**
 * SISTEMA FUNCIONAL DE DOCUMENTOS - VERSÃO SIMPLIFICADA
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

// Middleware de autenticação
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

// Configuração do multer para upload
const uploadPath = path.join(process.cwd(), 'uploads');

// Criar diretório se não existir
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
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

/**
 * GET /api/documentos-funcionais/:ordemServicoId
 * Listar documentos de uma ordem de serviço
 */
router.get('/:ordemServicoId', requireAuth, async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.params.ordemServicoId);
    
    const docs = await db.select().from(documentos)
      .where(eq(documentos.ordemServicoId, ordemServicoId));
    
    console.log(`Documentos encontrados para ordem ${ordemServicoId}:`, docs.length);
    res.json(docs);
  } catch (error: any) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ message: "Erro ao buscar documentos" });
  }
});

/**
 * POST /api/documentos-funcionais/upload
 * Upload múltiplo de arquivos
 */
router.post('/upload', requireAuth, upload.array('documentos', 20), async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.body.ordemServicoId);
    const files = req.files as Express.Multer.File[];

    if (!ordemServicoId || !files || files.length === 0) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    console.log(`Processando ${files.length} arquivos para ordem ${ordemServicoId}`);

    const documentosCriados = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const [documento] = await db.insert(documentos).values({
          ordemServicoId,
          nome: file.originalname,
          caminho: file.filename,
          tamanho: file.size,
          tipo: path.extname(file.originalname),
          ordem: i,
          consolidado: false
        }).returning();

        documentosCriados.push(documento);
        console.log(`Documento salvo: ${documento.nome} - ID: ${documento.id}`);
      } catch (error) {
        console.error(`Erro ao salvar documento ${file.originalname}:`, error);
      }
    }

    res.json({ 
      message: `Upload concluído - ${documentosCriados.length} arquivos`, 
      documentos: documentosCriados 
    });

  } catch (error: any) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: "Erro no upload de documentos" });
  }
});

/**
 * DELETE /api/documentos-funcionais/:id
 * Excluir documento
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Buscar documento
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

/**
 * GET /api/documentos-funcionais/:id/download
 * Download de documento
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
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const fileStream = fs.createReadStream(caminhoArquivo);
    fileStream.pipe(res);

  } catch (error: any) {
    console.error('Erro no download:', error);
    res.status(500).json({ message: "Erro no download" });
  }
});

/**
 * POST /api/documentos-funcionais/criar-pdf
 * Criar PDF consolidado SIMPLES
 */
router.post('/criar-pdf', requireAuth, async (req, res) => {
  try {
    const { ordemServicoId, documentosSelecionados, nomePersonalizado } = req.body;

    if (!ordemServicoId) {
      return res.status(400).json({ message: "Ordem de serviço é obrigatória" });
    }

    // Buscar documentos
    const todosDocumentos = await db.select().from(documentos)
      .where(eq(documentos.ordemServicoId, parseInt(ordemServicoId)));

    let docsParaPDF = todosDocumentos;
    if (documentosSelecionados && documentosSelecionados.length > 0) {
      docsParaPDF = documentosSelecionados.map((id: number) => 
        todosDocumentos.find(doc => doc.id === id)
      ).filter((doc: any) => doc !== undefined);
    }

    if (docsParaPDF.length === 0) {
      return res.status(400).json({ message: "Nenhum documento encontrado" });
    }

    // Criar PDF simples
    const pdfDoc = await PDFDocument.create();
    let documentosProcessados = 0;

    for (const doc of docsParaPDF) {
      if (doc.consolidado) continue;

      const caminhoArquivo = path.join(uploadPath, doc.caminho);
      
      if (!fs.existsSync(caminhoArquivo)) {
        console.log(`Arquivo não encontrado: ${caminhoArquivo}`);
        continue;
      }

      try {
        const arquivoBuffer = fs.readFileSync(caminhoArquivo);

        if (['.png', '.jpg', '.jpeg'].includes(doc.tipo.toLowerCase())) {
          // Processar imagem
          const imagemJpeg = await sharp(arquivoBuffer)
            .jpeg({ quality: 80 })
            .resize(800, 1000, { fit: 'inside', withoutEnlargement: true })
            .toBuffer();

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
          documentosProcessados++;

        } else if (doc.tipo.toLowerCase() === '.pdf') {
          // Copiar PDF existente
          const pdfExistente = await PDFDocument.load(arquivoBuffer);
          const paginas = await pdfDoc.copyPages(pdfExistente, pdfExistente.getPageIndices());
          paginas.forEach((page) => pdfDoc.addPage(page));
          documentosProcessados++;
        }
      } catch (error) {
        console.error(`Erro ao processar ${doc.nome}:`, error);
      }
    }

    // Salvar PDF
    const pdfBytes = await pdfDoc.save();
    const nomeArquivo = nomePersonalizado ? `${nomePersonalizado}.pdf` : `PDF_Consolidado_${Date.now()}.pdf`;
    const caminhoArquivo = path.join(uploadPath, nomeArquivo);
    
    fs.writeFileSync(caminhoArquivo, pdfBytes);

    // Salvar no banco
    const [documento] = await db.insert(documentos).values({
      ordemServicoId: parseInt(ordemServicoId),
      nome: nomeArquivo,
      caminho: path.basename(caminhoArquivo),
      tamanho: pdfBytes.length,
      tipo: '.pdf',
      ordem: 9999,
      consolidado: true
    }).returning();

    console.log(`PDF consolidado criado: ${documento.nome} - ${documentosProcessados} documentos`);

    res.json({
      message: "PDF consolidado criado com sucesso",
      documento,
      documentosProcessados
    });

  } catch (error: any) {
    console.error('Erro ao criar PDF:', error);
    res.status(500).json({ message: "Erro ao criar PDF consolidado" });
  }
});

export { router as documentosFuncionaisRoutes };