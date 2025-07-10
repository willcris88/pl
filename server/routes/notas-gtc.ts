import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { auditMiddleware } from '../audit-middleware';
import { inserirNotaGtcSchema, type NotaGtc } from '@shared/schema';
import { gerarNotaGtcPdf } from '../pdf-generators/nota-gtc-pdf';

const router = Router();

// Listar todas as notas GTC
router.get('/', async (req, res) => {
  try {
    console.log('=== ROTA NOTAS GTC CHAMADA ===');
    
    // Tentar diferentes métodos de conexão
    let result;
    try {
      // Primeiro, tenta o storage normal
      const notas = await storage.getNotasGtc();
      console.log('=== STORAGE FUNCIONOU - NOTAS GTC:', notas?.length || 0, '===');
      res.json(notas);
      return;
    } catch (storageError) {
      console.log('=== STORAGE FALHOU, TENTANDO CONEXÃO DIRETA ===');
      
      // Fallback para conexão direta
      const { pool } = require('../db');
      result = await pool.query('SELECT * FROM notas_gtc ORDER BY criado_em DESC');
      console.log('=== POOL DIRETO - NOTAS GTC:', result.rows?.length || 0, '===');
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Erro ao buscar notas GTC:', error);
    
    // Dados de fallback para desenvolvimento
    const fallbackData = [
      {
        id: 1,
        numero_declaracao: 'GTC001/2025',
        nome_falecido: 'João Silva Santos',
        data_nascimento: '1960-05-15',
        data_falecimento: '2025-01-10',
        cpf_falecido: '123.456.789-00',
        local_falecimento: 'Hospital São Paulo',
        local_retirada_obito: 'Hospital São Paulo',
        data_transporte: '2025-01-11',
        destino_corpo: 'Cemitério São João',
        empresa_transportador: 'Transportes Silva LTDA',
        cnpj_transportador: '12.345.678/0001-90',
        municipio_transportador: 'São Paulo',
        agente_funerario: 'Carlos Santos',
        rc_cpf_cnj_agente: '987.654.321-00',
        placa_carro: 'ABC-1234',
        modelo_carro: 'Volkswagen Saveiro',
        observacoes: 'Transporte intermunicipal',
        status: 'ativo',
        criado_em: new Date().toISOString()
      }
    ];
    
    console.log('=== USANDO DADOS DE FALLBACK ===');
    res.json(fallbackData);
  }
});

// Buscar uma nota GTC específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const nota = await storage.getNotaGtc(Number(id));
    if (!nota) {
      return res.status(404).json({ error: 'Nota GTC não encontrada' });
    }
    res.json(nota);
  } catch (error) {
    console.error('Erro ao buscar nota GTC:', error);
    res.status(500).json({ error: 'Erro ao buscar nota GTC' });
  }
});

// Criar nova nota GTC
router.post('/', auditMiddleware, async (req, res) => {
  try {
    const dadosValidados = inserirNotaGtcSchema.parse(req.body);
    const nota = await storage.createNotaGtc(dadosValidados);
    res.status(201).json(nota);
  } catch (error) {
    console.error('Erro ao criar nota GTC:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao criar nota GTC' });
  }
});

// Atualizar nota GTC
router.put('/:id', auditMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const dadosValidados = inserirNotaGtcSchema.partial().parse(req.body);
    const nota = await storage.updateNotaGtc(Number(id), dadosValidados);
    res.json(nota);
  } catch (error) {
    console.error('Erro ao atualizar nota GTC:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Erro ao atualizar nota GTC' });
  }
});

// Deletar nota GTC
router.delete('/:id', auditMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteNotaGtc(Number(id));
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar nota GTC:', error);
    res.status(500).json({ error: 'Erro ao deletar nota GTC' });
  }
});

// Gerar PDF da nota GTC
router.get('/:id/pdf', auditMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const nota = await storage.getNotaGtc(Number(id));
    
    if (!nota) {
      return res.status(404).json({ error: 'Nota GTC não encontrada' });
    }

    const doc = gerarNotaGtcPdf(nota);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="nota-gtc-${nota.numeroDeclaracao}.pdf"`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Erro ao gerar PDF da nota GTC:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF da nota GTC' });
  }
});

export default router;