/**
 * Script para criptografar senhas de motoristas usando scrypt
 * Usa a mesma criptografia do painel principal
 */

const crypto = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function gerarHashesSenhas() {
  const senhas = ['123456', 'senha123', 'motorista123'];
  
  console.log('=== HASHES DE SENHAS PARA MOTORISTAS ===');
  
  for (const senha of senhas) {
    const hash = await hashPassword(senha);
    console.log(`Senha: ${senha}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
  
  console.log('\n=== QUERY SQL PARA ATUALIZAR MOTORISTAS ===');
  const hash123456 = await hashPassword('123456');
  console.log(`UPDATE motoristas SET senha = '${hash123456}' WHERE ativo = true;`);
}

gerarHashesSenhas().catch(console.error);