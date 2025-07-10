/**
 * ROTAS DE AUTENTICAÇÃO DE MOTORISTAS
 * 
 * Sistema de login específico para motoristas usando email e CNH como credenciais.
 * Não utiliza sessões, apenas retorna os dados do motorista para localStorage.
 */

import { Router } from 'express';
import { db } from '../db.js';
import { motoristas } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { verificarSenha } from '../crypto-utils.js';

const router = Router();

// Schema de validação para login
const motoristaLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

// POST - Login do motorista
router.post('/login', async (req: any, res: any) => {
  try {
    console.log('Tentativa de login de motorista:', req.body);

    // Validar dados de entrada
    const { email, senha } = motoristaLoginSchema.parse(req.body);

    // Buscar motorista no banco
    const motorista = await db
      .select({
        id: motoristas.id,
        nome: motoristas.nome,
        sobrenome: motoristas.sobrenome,
        email: motoristas.email,
        telefone: motoristas.telefone,
        cnh: motoristas.cnh,
        senha: motoristas.senha,
        ativo: motoristas.ativo,
      })
      .from(motoristas)
      .where(
        and(
          eq(motoristas.email, email),
          eq(motoristas.ativo, true)
        )
      )
      .limit(1);

    if (motorista.length === 0) {
      console.log('Motorista não encontrado ou inativo');
      return res.status(401).json({ error: 'Credenciais inválidas ou motorista inativo' });
    }

    // Verificar senha usando criptografia reversível
    const motoristaEncontrado = motorista[0];
    const senhaCorreta = verificarSenha(senha, motoristaEncontrado.senha);
    
    if (!senhaCorreta) {
      console.log('Senha incorreta');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const motoristaLogado = motoristaEncontrado;
    console.log('Motorista logado com sucesso:', motoristaLogado.nome);

    // Retornar dados do motorista (sem senha)
    res.status(200).json({
      id: motoristaLogado.id,
      nome: motoristaLogado.nome,
      sobrenome: motoristaLogado.sobrenome,
      email: motoristaLogado.email,
      telefone: motoristaLogado.telefone,
      cnh: motoristaLogado.cnh,
    });

  } catch (error: any) {
    console.error('Erro no login de motorista:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;