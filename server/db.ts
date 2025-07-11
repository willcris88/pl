import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import { createMySQLConnection } from "./mysql-config";

// Para desenvolvimento local, usar SQLite
const sqliteDb = new Database("./local-database.db");

// Função para determinar e criar conexão com banco
function createDatabaseConnection() {
  const dbType = process.env.DB_TYPE || 'sqlite';
  
  console.log(`Configurando conexão para: ${dbType}`);
  
  if (dbType === 'mysql') {
    console.log('Usando MySQL como banco de dados');
    return createMySQLConnection();
  }
  
  if (dbType === 'postgresql' && process.env.DATABASE_URL) {
    console.log('Usando PostgreSQL/Neon como banco de dados');
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const ws = require("ws");
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const { drizzle: drizzlePg } = require('drizzle-orm/neon-serverless');
    return drizzlePg({ client: pool, schema });
  }
  
  // SQLite (padrão para desenvolvimento)
  console.log('Usando SQLite como banco de dados');
  return drizzle(sqliteDb, { schema });
}

export const db = createDatabaseConnection();

// Export do SQLite db para compatibilidade
export const sqliteDatabase = sqliteDb;