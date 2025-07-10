/**
 * ROTAS SIMPLES PARA DOCUMENTOS
 * Sistema básico que funciona sempre
 */

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { documentos } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { AuditLogger } from '../audit-middleware';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

const router = Router();

// Middleware de autenticação
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Acesso negado" });
  }
  next();
}

// Configuração do upload
const uploadPath = 'uploads';
const upload = multer({
  dest: uploadPath,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.includes(ext));
  }
});

/**
 * GET /api/documentos-simples
 * Buscar documentos por ordem de serviço
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.query.ordemServicoId as string);
    
    if (!ordemServicoId) {
      return res.status(400).json({ message: "ordem de serviço é obrigatória" });
    }

    const docs = await db.select().from(documentos).where(eq(documentos.ordemServicoId, ordemServicoId));
    console.log(`Documentos encontrados para ordem ${ordemServicoId}:`, docs.length);
    
    res.json(docs);
  } catch (error: any) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ message: "Erro ao buscar documentos", erro: error.message });
  }
});

/**
 * POST /api/documentos-simples/upload
 * Upload simples de múltiplos arquivos
 */
router.post('/upload', requireAuth, upload.array('documentos', 10), async (req, res) => {
  try {
    const ordemServicoId = parseInt(req.body.ordemServicoId);
    const files = req.files as Express.Multer.File[];

    if (!ordemServicoId || !files || files.length === 0) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    const documentosCriados = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.originalname);
      
      const [documento] = await db.insert(documentos).values({
        ordemServicoId,
        nome: file.originalname,
        caminho: file.filename,
        tamanho: file.size,
        tipo: ext,
        ordem: i,
        consolidado: false
      }).returning();

      documentosCriados.push(documento);

      // Log de auditoria
      await AuditLogger.logCreate("documentos", documento.id, req, {
        nome: file.originalname,
        tamanho: file.size,
        tipo: ext
      });
    }

    console.log(`Upload concluído: ${documentosCriados.length} arquivos`);
    res.json({ 
      message: "Upload realizado com sucesso", 
      documentos: documentosCriados 
    });

  } catch (error: any) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: "Erro no upload", erro: error.message });
  }
});

/**
 * GET /api/documentos-simples/:id/download
 * Download de documento
 */
router.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [documento] = await db.select().from(documentos).where(eq(documentos.id, id));

    if (!documento) {
      return res.status(404).json({ message: "Documento não encontrado" });
    }

    // Verificar se arquivo existe
    const caminhoCompleto = path.resolve(documento.caminho);
    
    try {
      await fs.access(caminhoCompleto);
    } catch {
      return res.status(404).json({ message: "Arquivo físico não encontrado" });
    }

    // Configurar headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${documento.nome}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Enviar arquivo
    res.sendFile(caminhoCompleto);

  } catch (error: any) {
    console.error('Erro no download:', error);
    res.status(500).json({ message: "Erro no download", erro: error.message });
  }
});

/**
 * DELETE /api/documentos-simples/:id
 * Excluir documento
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [documento] = await db.select().from(documentos).where(eq(documentos.id, id));

    if (!documento) {
      return res.status(404).json({ message: "Documento não encontrado" });
    }

    // Excluir arquivo físico
    try {
      await fs.unlink(documento.caminho);
    } catch (error) {
      console.log('Arquivo físico já removido:', documento.caminho);
    }

    // Excluir do banco
    await db.delete(documentos).where(eq(documentos.id, id));

    // Log de auditoria
    await AuditLogger.logDelete("documentos", id, req, {
      nome: documento.nome,
      caminho: documento.caminho
    });

    console.log(`Documento ${id} excluído com sucesso`);
    res.json({ message: "Documento excluído com sucesso" });

  } catch (error: any) {
    console.error('Erro ao excluir documento:', error);
    res.status(500).json({ message: "Erro ao excluir documento", erro: error.message });
  }
});

/**
 * POST /api/documentos-simples/criar-pdf
 * Criar PDF consolidado com lista de documentos reais
 */
router.post('/criar-pdf', requireAuth, async (req, res) => {
  try {
    const { ordemServicoId, documentosSelecionados, nomePersonalizado } = req.body;
    
    if (!ordemServicoId) {
      return res.status(400).json({ message: "ordem de serviço é obrigatória" });
    }

    // Buscar documentos selecionados ou todos se não especificado
    let docsExistentes;
    if (documentosSelecionados && documentosSelecionados.length > 0) {
      // Buscar todos os documentos primeiro
      const todosDocumentos = await db.select().from(documentos)
        .where(eq(documentos.ordemServicoId, parseInt(ordemServicoId)));
      
      // Ordenar documentos conforme a ordem selecionada no frontend
      docsExistentes = documentosSelecionados.map(id => 
        todosDocumentos.find(doc => doc.id === id)
      ).filter(doc => doc !== undefined);
    } else {
      docsExistentes = await db.select().from(documentos)
        .where(eq(documentos.ordemServicoId, parseInt(ordemServicoId)));
    }
    
    console.log(`Criando PDF real com ${docsExistentes.length} documentos existentes`);

    // Criar PDF consolidado REAL usando pdf-lib
    const pdfDoc = await PDFDocument.create();
    let documentosProcessados = 0;

    for (const doc of docsExistentes) {
      if (doc.consolidado) continue; // Pular PDFs consolidados anteriores
      
      try {
        const caminhoCompleto = path.join(uploadPath, doc.caminho);
        
        // Verificar se arquivo existe
        try {
          await fs.promises.access(caminhoCompleto);
        } catch {
          console.log(`Arquivo não encontrado: ${caminhoCompleto}`);
          continue;
        }

        const arquivoBuffer = await fs.promises.readFile(caminhoCompleto);
        
        // Processar imagens (PNG, JPG, JPEG)
        if (['.png', '.jpg', '.jpeg'].includes(doc.tipo.toLowerCase())) {
          // Converter imagem para JPEG se necessário e otimizar
          const imagemProcessada = await sharp(arquivoBuffer)
            .jpeg({ quality: 85 })
            .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
            .toBuffer();
          
          const imagem = await pdfDoc.embedJpg(imagemProcessada);
          const page = pdfDoc.addPage([595, 842]); // A4
          
          // Calcular dimensões para caber na página
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
          
          // Centralizar imagem na página
          const x = (595 - imgWidth) / 2;
          const y = (842 - imgHeight) / 2;
          
          page.drawImage(imagem, {
            x: x,
            y: y,
            width: imgWidth,
            height: imgHeight,
          });
          
          documentosProcessados++;
          
        } else if (doc.tipo.toLowerCase() === '.pdf') {
          // Processar PDFs existentes
          const pdfExistente = await PDFDocument.load(arquivoBuffer);
          const paginas = await pdfDoc.copyPages(pdfExistente, pdfExistente.getPageIndices());
          paginas.forEach((page) => pdfDoc.addPage(page));
          documentosProcessados++;
        }
        
      } catch (error) {
        console.error(`Erro ao processar documento ${doc.nome}:`, error);
      }
    }

    // Salvar PDF consolidado
    const pdfBytes = await pdfDoc.save();
    const nomeArquivo = nomePersonalizado ? `${nomePersonalizado}.pdf` : `PDF_Consolidado_${new Date().toISOString().split('T')[0]}.pdf`;
    const caminhoArquivo = path.join(uploadPath, nomeArquivo);
    
    await fs.promises.writeFile(caminhoArquivo, pdfBytes);

    // Salvar no banco
    const [documento] = await db.insert(documentos).values({
      ordemServicoId: parseInt(ordemServicoId),
      nome: nomeArquivo,
      caminho: caminhoArquivo,
      tamanho: pdfBytes.length,
      tipo: '.pdf',
      ordem: 9999,
      consolidado: true
    }).returning();

    console.log(`PDF consolidado criado com ID: ${documento.id} - ${documentosProcessados} documentos processados`);
    
    res.json({ 
      message: `PDF consolidado criado com sucesso - ${documentosProcessados} documentos processados`,
      documento,
      documentosProcessados
    });

  } catch (error: any) {
    console.error('Erro ao criar PDF:', error);
    res.status(500).json({ message: "Erro ao criar PDF consolidado", erro: error.message });
  }
});

/**
 * PATCH /api/documentos-simples/:id/renomear
 * Renomear documento
 */
router.patch('/:id/renomear', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { novoNome } = req.body;

    if (!novoNome || typeof novoNome !== 'string') {
      return res.status(400).json({ message: "Nome é obrigatório" });
    }

    const documento = await db.select().from(documentos).where(eq(documentos.id, id)).limit(1);
    if (!documento[0]) {
      return res.status(404).json({ message: "Documento não encontrado" });
    }

    // Manter a extensão original
    const extensaoOriginal = path.extname(documento[0].nome);
    const nomeCompleto = novoNome.endsWith(extensaoOriginal) ? novoNome : `${novoNome}${extensaoOriginal}`;

    await db.update(documentos)
      .set({ nome: nomeCompleto })
      .where(eq(documentos.id, id));

    res.json({ message: "Documento renomeado com sucesso" });
  } catch (error) {
    console.error('Erro ao renomear documento:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * GET /api/documentos-simples/:id/preview
 * Preview de imagem
 */
router.get('/:id/preview', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const documento = await db.select().from(documentos).where(eq(documentos.id, id)).limit(1);
    if (!documento[0]) {
      return res.status(404).json({ message: "Documento não encontrado" });
    }

    const caminhoArquivo = path.join(uploadPath, documento[0].caminho);
    
    // Verificar se é imagem
    const ext = path.extname(documento[0].nome).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.gif', '.bmp'].includes(ext)) {
      return res.status(400).json({ message: "Arquivo não é uma imagem" });
    }

    // Verificar se arquivo existe
    try {
      await fs.promises.access(caminhoArquivo);
    } catch {
      return res.status(404).json({ message: "Arquivo não encontrado" });
    }

    // Definir content-type correto
    const contentType = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp'
    }[ext] || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const fileStream = fs.createReadStream(caminhoArquivo);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Erro ao obter preview:', error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export { router as documentosSimplesRoutes };