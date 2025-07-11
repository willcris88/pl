/**
 * ROTAS DE BACKUP DO BANCO DE DADOS
 * 
 * Sistema simplificado para SQLite
 */

import { Router } from 'express';
import { auditMiddleware } from '../audit-middleware';

const router = Router();

/**
 * Placeholder para download de backup
 * TODO: Implementar backup do SQLite
 */
router.get('/download', auditMiddleware, async (req, res) => {
  try {
    // Para SQLite, podemos simplesmente copiar o arquivo de banco
    res.status(501).json({ 
      message: 'Funcionalidade de backup não implementada para SQLite',
      note: 'O banco SQLite está salvo em ./local-database.db'
    });
    
  } catch (error) {
    console.error('Erro ao gerar backup:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar backup do banco de dados',
      details: error.message 
    });
  }
});

/**
 * Informações básicas do banco SQLite
 */
router.get('/info', auditMiddleware, async (req, res) => {
  try {
    res.json({
      database_type: 'SQLite',
      database_file: './local-database.db',
      message: 'Banco SQLite funcionando'
    });
    
  } catch (error) {
    console.error('Erro ao obter informações do banco:', error);
    res.status(500).json({ error: 'Erro ao obter informações do banco' });
  }
});

export default router;