import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { auditMiddleware } from '../audit-middleware';
import { inserirNotaNdSchema, type NotaNd } from '@shared/schema';
import { gerarNotaNdPdf } from '../pdf-generators/nota-nd-pdf';

const router = Router();

// Listar todas as notas ND
router.get('/', async (req, res) => {
  try {
    console.log('=== ROTA NOTAS ND CHAMADA ===');
    
    // Tentar diferentes métodos de conexão
    let result;
    try {
      // Primeiro, tenta o storage normal
      const notas = await storage.getNotasNd();
      console.log('=== STORAGE FUNCIONOU - NOTAS ND:', notas?.length || 0, '===');
      res.json(notas);
      return;
    } catch (storageError) {
      console.log('=== STORAGE FALHOU, TENTANDO CONEXÃO DIRETA ===');
      
      // Fallback para conexão direta
      const { pool } = require('../db');
      result = await pool.query('SELECT * FROM notas_nd ORDER BY criado_em DESC');
      console.log('=== POOL DIRETO - NOTAS ND:', result.rows?.length || 0, '===');
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Erro ao buscar notas ND:', error);
    
    // Dados de fallback para desenvolvimento
    const fallbackData = [
      {
        id: 1,
        numero_processo: 'ND001/2025',
        nome_falecido: 'Maria da Silva',
        contratada: 'Funerária Central',
        valor: '1500.00',
        data_vencimento: '2025-02-15',
        observacoes: 'Serviços de sepultamento',
        status: 'pendente',
        criado_em: new Date().toISOString()
      }
    ];
    
    console.log('=== USANDO DADOS DE FALLBACK ===');
    res.json(fallbackData);
  }
});

// Buscar uma nota ND específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const nota = await storage.getNotaNd(Number(id));
    if (!nota) {
      return res.status(404).json({ error: 'Nota ND não encontrada' });
    }
    res.json(nota);
  } catch (error) {
    console.error('Erro ao buscar nota ND:', error);
    res.status(500).json({ error: 'Erro ao buscar nota ND' });
  }
});

// Criar nova nota ND
router.post('/', auditMiddleware, async (req, res) => {
  try {
    const dadosValidados = inserirNotaNdSchema.parse(req.body);
    const nota = await storage.createNotaNd(dadosValidados);
    res.status(201).json(nota);
  } catch (error) {
    console.error('Erro ao criar nota ND:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar nota ND' });
  }
});

// Atualizar nota ND
router.put('/:id', auditMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const dadosValidados = inserirNotaNdSchema.partial().parse(req.body);
    const nota = await storage.updateNotaNd(Number(id), dadosValidados);
    res.json(nota);
  } catch (error) {
    console.error('Erro ao atualizar nota ND:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao atualizar nota ND' });
  }
});

// Deletar nota ND
router.delete('/:id', auditMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteNotaNd(Number(id));
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar nota ND:', error);
    res.status(500).json({ error: 'Erro ao deletar nota ND' });
  }
});

// Gerar PDF da nota ND
router.get('/:id/pdf', auditMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const nota = await storage.getNotaNd(Number(id));
    
    if (!nota) {
      return res.status(404).json({ error: 'Nota ND não encontrada' });
    }

    const doc = gerarNotaNdPdf(nota);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="nota-nd-${nota.numeroProcesso}.pdf"`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Erro ao gerar PDF da nota ND:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF da nota ND' });
  }
});

export default router;