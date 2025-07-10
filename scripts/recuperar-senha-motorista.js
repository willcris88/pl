/**
 * Script para recuperar senhas de motoristas (descriptografia)
 * USO: node recuperar-senha-motorista.js EMAIL_DO_MOTORISTA
 */

import { descriptografarSenha } from '../server/crypto-utils.js';
import { db } from '../server/db.js';
import { motoristas } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function recuperarSenhaMotorista(emailMotorista) {
  try {
    console.log(`=== RECUPERANDO SENHA DO MOTORISTA: ${emailMotorista} ===`);
    
    // Buscar motorista no banco
    const motorista = await db
      .select()
      .from(motoristas)
      .where(eq(motoristas.email, emailMotorista));
    
    if (motorista.length === 0) {
      console.log('❌ Motorista não encontrado!');
      return;
    }
    
    const motoristaData = motorista[0];
    console.log(`Motorista encontrado: ${motoristaData.nome} ${motoristaData.sobrenome}`);
    console.log(`Status: ${motoristaData.ativo ? 'Ativo' : 'Inativo'}`);
    
    // Descriptografar senha
    const senhaDescriptografada = descriptografarSenha(motoristaData.senha);
    
    console.log('\n=== RESULTADO ===');
    console.log(`Email: ${motoristaData.email}`);
    console.log(`Senha criptografada: ${motoristaData.senha}`);
    console.log(`Senha descriptografada: ${senhaDescriptografada}`);
    console.log('\n✅ Senha recuperada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao recuperar senha:', error.message);
  }
}

// Executar script
const emailArg = process.argv[2];
if (!emailArg) {
  console.log('Uso: node recuperar-senha-motorista.js EMAIL_DO_MOTORISTA');
  console.log('Exemplo: node recuperar-senha-motorista.js carlos.silva@funeraria.com');
  process.exit(1);
}

recuperarSenhaMotorista(emailArg).catch(console.error);