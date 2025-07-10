/**
 * Utilitários de criptografia reversível para senhas de motoristas
 * Usa AES-256-GCM para criptografia simétrica segura
 */

import crypto from 'crypto';

// Chave secreta para criptografia (em produção, use variável de ambiente)
const SECRET_KEY = process.env.MOTORISTA_CRYPTO_KEY || 'chave-secreta-sistema-funeraria-2025-key-256bits';

// Garantir que a chave tenha 32 bytes (256 bits)
const CRYPTO_KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);

/**
 * Criptografa uma senha de forma reversível
 * @param {string} senha - Senha em texto puro
 * @returns {string} - Senha criptografada no formato: iv:encrypted:authTag
 */
function criptografarSenha(senha) {
  try {
    const iv = crypto.randomBytes(16); // Vetor de inicialização
    const cipher = crypto.createCipheriv('aes-256-gcm', CRYPTO_KEY, iv);
    cipher.setAAD(Buffer.from('motorista-auth', 'utf8'));
    
    let encrypted = cipher.update(senha, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  } catch (error) {
    console.error('Erro ao criptografar senha:', error);
    throw new Error('Falha na criptografia');
  }
}

/**
 * Descriptografa uma senha criptografada
 * @param {string} senhaCriptografada - Senha no formato: iv:encrypted:authTag
 * @returns {string} - Senha em texto puro
 */
function descriptografarSenha(senhaCriptografada) {
  try {
    const [ivHex, encrypted, authTagHex] = senhaCriptografada.split(':');
    
    if (!ivHex || !encrypted || !authTagHex) {
      throw new Error('Formato de senha criptografada inválido');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', CRYPTO_KEY, iv);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from('motorista-auth', 'utf8'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar senha:', error);
    throw new Error('Falha na descriptografia');
  }
}

/**
 * Verifica se uma senha está correta
 * @param {string} senhaDigitada - Senha digitada pelo usuário
 * @param {string} senhaCriptografada - Senha criptografada do banco
 * @returns {boolean} - True se a senha estiver correta
 */
function verificarSenha(senhaDigitada, senhaCriptografada) {
  try {
    const senhaDescriptografada = descriptografarSenha(senhaCriptografada);
    return senhaDigitada === senhaDescriptografada;
  } catch (error) {
    console.error('Erro na verificação da senha:', error);
    return false;
  }
}

/**
 * Migra senhas de hash scrypt para criptografia reversível
 * @param {string} senhaOriginal - Senha original em texto puro
 * @returns {string} - Senha criptografada
 */
function migrarSenhaParaCriptografia(senhaOriginal) {
  return criptografarSenha(senhaOriginal);
}

export {
  criptografarSenha,
  descriptografarSenha,
  verificarSenha,
  migrarSenhaParaCriptografia
};