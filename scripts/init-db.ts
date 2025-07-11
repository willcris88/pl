import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { usuarios } from "../shared/schema";
import { hashPassword } from "../server/auth";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar ou conectar ao banco SQLite
const sqlite = new Database("./local-database.db");
const db = drizzle(sqlite);

async function initializeDatabase() {
  console.log("🗄️ Inicializando banco de dados SQLite...");

  try {
    // Criar tabela de usuários
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        nome TEXT NOT NULL,
        ativo INTEGER NOT NULL DEFAULT 1,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tabela de usuários criada");

    // Verificar se já existe um usuário administrador
    const existingUser = sqlite.prepare("SELECT * FROM usuarios WHERE email = ?").get("admin@sistema.com");
    
    if (!existingUser) {
      // Criar usuário administrador padrão
      const hashedPassword = await hashPassword("123456");
      
      sqlite.prepare(`
        INSERT INTO usuarios (email, senha, nome, ativo) 
        VALUES (?, ?, ?, ?)
      `).run("admin@sistema.com", hashedPassword, "Administrador", 1);
      
      console.log("✅ Usuário administrador criado:");
      console.log("   📧 Email: admin@sistema.com");
      console.log("   🔑 Senha: 123456");
    } else {
      console.log("ℹ️ Usuário administrador já existe");
    }

    console.log("🎉 Banco de dados inicializado com sucesso!");
    
  } catch (error) {
    console.error("❌ Erro ao inicializar banco:", error);
  } finally {
    sqlite.close();
  }
}

// Executar se for chamado diretamente (ES modules)
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase };