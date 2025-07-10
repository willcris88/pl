/**
 * Script para migrar senhas de motoristas para criptografia reversível
 */

import { criptografarSenha, descriptografarSenha } from '../server/crypto-utils.js';

async function testarCriptografia() {
  console.log('=== TESTE DE CRIPTOGRAFIA REVERSÍVEL ===');
  
  const senhasOriginais = ['123456', 'motorista123', 'senha123', 'funeraria2025'];
  
  for (const senha of senhasOriginais) {
    console.log(`\nSenha original: ${senha}`);
    
    const senhaCriptografada = criptografarSenha(senha);
    console.log(`Criptografada: ${senhaCriptografada}`);
    
    const senhaDescriptografada = descriptografarSenha(senhaCriptografada);
    console.log(`Descriptografada: ${senhaDescriptografada}`);
    
    const sucesso = senha === senhaDescriptografada;
    console.log(`Teste: ${sucesso ? '✓ SUCESSO' : '✗ FALHA'}`);
    
    if (sucesso) {
      console.log(`Query SQL: UPDATE motoristas SET senha = '${senhaCriptografada}' WHERE email = 'exemplo@email.com';`);
    }
  }
}

// Executar teste
testarCriptografia().catch(console.error);