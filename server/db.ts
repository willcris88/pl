import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { createMySQLConnection } from "./mysql-config";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Função para determinar e criar conexão com banco
function createDatabaseConnection() {
  const dbType = process.env.DB_TYPE || 'postgresql';
  
  console.log(`Configurando conexão para: ${dbType}`);
  
  if (dbType === 'mysql') {
    console.log('Usando MySQL como banco de dados');
    return createMySQLConnection();
  }
  
  // PostgreSQL/Neon (padrão)
  console.log('Usando PostgreSQL/Neon como banco de dados');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool, schema });
}

export const db = createDatabaseConnection();

// Manter export do pool para compatibilidade com PostgreSQL
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });