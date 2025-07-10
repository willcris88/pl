import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../shared/schema';

// Configuração para MySQL
export function createMySQLConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada para MySQL');
  }

  const connection = mysql.createConnection(process.env.DATABASE_URL);
  return drizzle(connection, { schema });
}

// Função para testar conexão MySQL
export async function testMySQLConnection() {
  try {
    const connection = mysql.createConnection(process.env.DATABASE_URL || '');
    await connection.execute('SELECT 1');
    await connection.end();
    console.log('✓ Conexão MySQL estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('✗ Erro na conexão MySQL:', error);
    return false;
  }
}