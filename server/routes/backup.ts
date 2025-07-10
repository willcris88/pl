/**
 * ROTAS DE BACKUP DO BANCO DE DADOS
 * 
 * Sistema para gerar backup completo do banco PostgreSQL
 * com compatibilidade para MySQL
 */

import { Router } from 'express';
import { pool } from '../db';
import { auditMiddleware } from '../audit-middleware';

const router = Router();

/**
 * Gera backup completo do banco de dados
 * Retorna arquivo SQL compatível com MySQL
 */
router.get('/download', auditMiddleware, async (req, res) => {
  try {
    console.log('=== INICIANDO BACKUP DO BANCO DE DADOS ===');
    
    // Obter todas as tabelas do banco
    const tablesQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.tablename);
    
    console.log(`=== ENCONTRADAS ${tables.length} TABELAS ===`);
    
    let sqlBackup = '';
    
    // Cabeçalho do backup
    sqlBackup += `-- ================================================\n`;
    sqlBackup += `-- BACKUP COMPLETO DO BANCO DE DADOS\n`;
    sqlBackup += `-- Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    sqlBackup += `-- Sistema: Funerária Central de Barueri\n`;
    sqlBackup += `-- ================================================\n\n`;
    
    sqlBackup += `-- Configurações MySQL\n`;
    sqlBackup += `SET FOREIGN_KEY_CHECKS = 0;\n`;
    sqlBackup += `SET AUTOCOMMIT = 0;\n`;
    sqlBackup += `START TRANSACTION;\n\n`;
    
    // Para cada tabela, fazer backup dos dados
    for (const tableName of tables) {
      try {
        console.log(`=== FAZENDO BACKUP DA TABELA: ${tableName} ===`);
        
        // Obter estrutura da tabela
        const columnsQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position;
        `;
        
        const columnsResult = await pool.query(columnsQuery, [tableName]);
        const columns = columnsResult.rows;
        
        if (columns.length === 0) continue;
        
        // Cabeçalho da tabela
        sqlBackup += `-- ================================================\n`;
        sqlBackup += `-- TABELA: ${tableName}\n`;
        sqlBackup += `-- ================================================\n\n`;
        
        // Criar estrutura da tabela (comentado para referência)
        sqlBackup += `-- Estrutura da tabela ${tableName}\n`;
        sqlBackup += `-- Colunas: ${columns.map(col => `${col.column_name} (${col.data_type})`).join(', ')}\n\n`;
        
        // Obter dados da tabela
        const dataQuery = `SELECT * FROM "${tableName}" ORDER BY 1;`;
        const dataResult = await pool.query(dataQuery);
        const rows = dataResult.rows;
        
        if (rows.length > 0) {
          // Truncar tabela antes de inserir (MySQL)
          sqlBackup += `TRUNCATE TABLE \`${tableName}\`;\n\n`;
          
          // Preparar INSERT statements
          const columnNames = columns.map(col => `\`${col.column_name}\``).join(', ');
          sqlBackup += `INSERT INTO \`${tableName}\` (${columnNames}) VALUES\n`;
          
          const insertValues = rows.map(row => {
            const values = columns.map(col => {
              const value = row[col.column_name];
              
              if (value === null) {
                return 'NULL';
              }
              
              // Tratar diferentes tipos de dados
              if (col.data_type === 'boolean') {
                return value ? '1' : '0';
              }
              
              if (col.data_type.includes('int') || col.data_type === 'numeric' || col.data_type === 'decimal') {
                return value.toString();
              }
              
              if (col.data_type.includes('timestamp') || col.data_type.includes('date')) {
                return `'${new Date(value).toISOString().slice(0, 19).replace('T', ' ')}'`;
              }
              
              if (col.data_type === 'json' || col.data_type === 'jsonb') {
                return `'${JSON.stringify(value).replace(/'/g, "\\'")}'`;
              }
              
              // String/text - escapar aspas
              return `'${value.toString().replace(/'/g, "\\'")}'`;
            });
            
            return `(${values.join(', ')})`;
          });
          
          sqlBackup += insertValues.join(',\n');
          sqlBackup += `;\n\n`;
          
          console.log(`=== TABELA ${tableName}: ${rows.length} REGISTROS ===`);
        } else {
          sqlBackup += `-- Tabela ${tableName} está vazia\n\n`;
        }
        
      } catch (error) {
        console.error(`Erro ao fazer backup da tabela ${tableName}:`, error);
        sqlBackup += `-- ERRO ao fazer backup da tabela ${tableName}: ${error.message}\n\n`;
      }
    }
    
    // Rodapé do backup
    sqlBackup += `-- ================================================\n`;
    sqlBackup += `-- FIM DO BACKUP\n`;
    sqlBackup += `-- ================================================\n\n`;
    
    sqlBackup += `COMMIT;\n`;
    sqlBackup += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    sqlBackup += `SET AUTOCOMMIT = 1;\n`;
    
    console.log('=== BACKUP CONCLUÍDO COM SUCESSO ===');
    
    // Configurar headers para download
    const fileName = `backup_funeraria_${new Date().toISOString().slice(0, 10)}_${new Date().toTimeString().slice(0, 8).replace(/:/g, '-')}.sql`;
    
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', Buffer.byteLength(sqlBackup, 'utf8'));
    
    res.send(sqlBackup);
    
  } catch (error) {
    console.error('Erro ao gerar backup:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar backup do banco de dados',
      details: error.message 
    });
  }
});

/**
 * Obter informações do banco para estatísticas
 */
router.get('/info', auditMiddleware, async (req, res) => {
  try {
    const tablesQuery = `
      SELECT 
        t.tablename,
        COALESCE(c.reltuples::bigint, 0) as estimated_rows
      FROM pg_tables t
      LEFT JOIN pg_class c ON c.relname = t.tablename
      WHERE t.schemaname = 'public'
      ORDER BY t.tablename;
    `;
    
    const result = await pool.query(tablesQuery);
    const tables = result.rows;
    
    const totalRows = tables.reduce((sum, table) => sum + parseInt(table.estimated_rows), 0);
    
    res.json({
      total_tables: tables.length,
      total_rows: totalRows,
      tables: tables,
      database_size: '~' + Math.round(totalRows * 0.001) + 'KB estimado'
    });
    
  } catch (error) {
    console.error('Erro ao obter informações do banco:', error);
    res.status(500).json({ error: 'Erro ao obter informações do banco' });
  }
});

export default router;