/**
 * Script para validar as configurações de ambiente
 * Especialmente útil para ambiente Windows
 */

const fs = require('fs');
const path = require('path');

function validateEnvironment() {
  console.log('🔍 Validando configurações do ambiente...\n');

  // Verificar arquivo .env
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado!');
    console.log('💡 Execute: copy .env.example .env');
    process.exit(1);
  }

  // Carregar variáveis
  require('dotenv').config();

  const required = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'PORT'
  ];

  const missing = [];
  const warnings = [];

  // Verificar variáveis obrigatórias
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // Verificar configurações específicas
  if (process.env.SESSION_SECRET === 'sua_chave_secreta_muito_segura_aqui') {
    warnings.push('SESSION_SECRET usando valor padrão - altere para produção');
  }

  if (!process.env.DB_TYPE) {
    warnings.push('DB_TYPE não definido - usando PostgreSQL como padrão');
  }

  // Verificar diretórios
  const dirs = ['uploads', 'logs'];
  dirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`📁 Criando diretório: ${dir}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Relatório
  if (missing.length > 0) {
    console.error('❌ Variáveis obrigatórias faltando:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.log('\n📝 Configure essas variáveis no arquivo .env');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Avisos:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
    console.log('');
  }

  console.log('✅ Configuração do ambiente validada!');
  console.log(`📊 Banco: ${process.env.DB_TYPE || 'postgresql'}`);
  console.log(`🌐 Porta: ${process.env.PORT || 3000}`);
  console.log(`🔐 Sessão: ${process.env.SESSION_SECRET ? 'Configurada' : 'Padrão'}`);
  
  return true;
}

// Executar se chamado diretamente
if (require.main === module) {
  validateEnvironment();
}

module.exports = { validateEnvironment };