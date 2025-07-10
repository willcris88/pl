/**
 * Script de inicialização para desenvolvimento
 * Valida ambiente antes de iniciar o servidor
 */

const { validateEnvironment } = require('./scripts/validate-env');

async function startDevelopment() {
  console.log('🚀 Iniciando Sistema de Gestão Funerária\n');

  try {
    // Validar configurações antes de iniciar
    validateEnvironment();
    
    console.log('\n🔄 Iniciando servidor de desenvolvimento...\n');
    
    // Iniciar o servidor principal
    require('./server/index');
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error.message);
    console.log('\n📋 Verifique:');
    console.log('   1. Arquivo .env configurado corretamente');
    console.log('   2. Banco de dados rodando');
    console.log('   3. Dependências instaladas (npm install)');
    console.log('\n📖 Consulte INSTALACAO-WINDOWS.md para ajuda');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  startDevelopment();
}

module.exports = { startDevelopment };