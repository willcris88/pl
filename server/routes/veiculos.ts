/**
 * ROTAS DE VEÍCULOS
 * 
 * CRUD para gerenciamento de veículos da frota.
 * Usado tanto pelo admin quanto pelo sistema de motoristas.
 */

import { Router } from 'express';
import { db } from '../db.js';
import { veiculos } from '../../shared/schema.js';
import { eq, desc, like, and } from 'drizzle-orm';
import { AuditLogger } from '../audit-middleware.js';
import { z } from 'zod';

const router = Router();

// Schema de validação
const inserirVeiculoSchema = z.object({
  placa: z.string().min(7, "Placa deve ter pelo menos 7 caracteres"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  marca: z.string().min(1, "Marca é obrigatória"),
  ano: z.number().min(1900, "Ano inválido"),
  cor: z.string().optional(),
  chassi: z.string().optional(),
  renavam: z.string().optional(),
  combustivel: z.string().optional(),
  capacidade: z.number().optional(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  ativo: z.boolean().default(true),
  observacoes: z.string().optional(),
});

// Middleware de autenticação simples
function requireAuth(req: any, res: any, next: any) {
  // Para o sistema de motoristas, não validamos sessão
  // Para admin, a validação é feita nas rotas principais
  next();
}

// GET - Listar todos os veículos
router.get('/', async (req: any, res: any) => {
  try {
    const { search, categoria, ativo } = req.query;

    console.log('Buscando veículos com filtros:', { search, categoria, ativo });

    let query = db.select().from(veiculos);

    // Aplicar filtros
    const conditions = [];
    
    if (search) {
      conditions.push(
        like(veiculos.placa, `%${search}%`),
        like(veiculos.modelo, `%${search}%`),
        like(veiculos.marca, `%${search}%`)
      );
    }
    
    if (categoria) {
      conditions.push(eq(veiculos.categoria, categoria));
    }
    
    if (ativo !== undefined) {
      conditions.push(eq(veiculos.ativo, ativo === 'true'));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const resultados = await query.orderBy(desc(veiculos.criadoEm));

    console.log(`Encontrados ${resultados.length} veículos`);
    res.json(resultados);

  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar veículo por ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const veiculo = await db
      .select()
      .from(veiculos)
      .where(eq(veiculos.id, parseInt(id)))
      .limit(1);

    if (veiculo.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    res.json(veiculo[0]);

  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Criar novo veículo
router.post('/', requireAuth, async (req: any, res: any) => {
  try {
    console.log('Criando novo veículo:', req.body);

    // Validar dados
    const dadosVeiculo = inserirVeiculoSchema.parse(req.body);

    // Verificar se placa já existe
    const veiculoExistente = await db
      .select()
      .from(veiculos)
      .where(eq(veiculos.placa, dadosVeiculo.placa.toUpperCase()))
      .limit(1);

    if (veiculoExistente.length > 0) {
      return res.status(400).json({ error: 'Placa já cadastrada' });
    }

    // Inserir veículo
    const [novoVeiculo] = await db
      .insert(veiculos)
      .values({
        ...dadosVeiculo,
        placa: dadosVeiculo.placa.toUpperCase(),
      })
      .returning();

    // Log de auditoria (se usuário autenticado)
    if (req.user) {
      await AuditLogger.logCreate(
        'veiculos',
        novoVeiculo.id,
        req,
        `Veículo criado: ${novoVeiculo.marca} ${novoVeiculo.modelo} - ${novoVeiculo.placa}`
      );
    }

    console.log('Veículo criado com sucesso:', novoVeiculo.id);
    res.status(201).json(novoVeiculo);

  } catch (error: any) {
    console.error('Erro ao criar veículo:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT - Atualizar veículo
router.put('/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    console.log(`Atualizando veículo ${id}:`, req.body);

    // Validar dados
    const dadosVeiculo = inserirVeiculoSchema.partial().parse(req.body);

    // Verificar se veículo existe
    const veiculoExistente = await db
      .select()
      .from(veiculos)
      .where(eq(veiculos.id, parseInt(id)))
      .limit(1);

    if (veiculoExistente.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Se alterando placa, verificar duplicatas
    if (dadosVeiculo.placa) {
      const placaExistente = await db
        .select()
        .from(veiculos)
        .where(
          and(
            eq(veiculos.placa, dadosVeiculo.placa.toUpperCase()),
            eq(veiculos.id, parseInt(id))
          )
        )
        .limit(1);

      if (placaExistente.length > 0 && placaExistente[0].id !== parseInt(id)) {
        return res.status(400).json({ error: 'Placa já cadastrada para outro veículo' });
      }
    }

    // Atualizar veículo
    const [veiculoAtualizado] = await db
      .update(veiculos)
      .set({
        ...dadosVeiculo,
        placa: dadosVeiculo.placa ? dadosVeiculo.placa.toUpperCase() : undefined,
        atualizadoEm: new Date(),
      })
      .where(eq(veiculos.id, parseInt(id)))
      .returning();

    // Log de auditoria (se usuário autenticado)
    if (req.user) {
      await AuditLogger.logUpdate(
        'veiculos',
        parseInt(id),
        req,
        `Veículo atualizado: ${veiculoAtualizado.marca} ${veiculoAtualizado.modelo} - ${veiculoAtualizado.placa}`
      );
    }

    console.log('Veículo atualizado com sucesso');
    res.json(veiculoAtualizado);

  } catch (error: any) {
    console.error('Erro ao atualizar veículo:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE - Excluir veículo
router.delete('/:id', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    console.log(`Excluindo veículo ${id}`);

    // Buscar veículo antes de excluir para logs
    const veiculo = await db
      .select()
      .from(veiculos)
      .where(eq(veiculos.id, parseInt(id)))
      .limit(1);

    if (veiculo.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Excluir veículo
    await db
      .delete(veiculos)
      .where(eq(veiculos.id, parseInt(id)));

    // Log de auditoria (se usuário autenticado)
    if (req.user) {
      await AuditLogger.logDelete(
        'veiculos',
        parseInt(id),
        req,
        `Veículo excluído: ${veiculo[0].marca} ${veiculo[0].modelo} - ${veiculo[0].placa}`
      );
    }

    console.log('Veículo excluído com sucesso');
    res.json({ message: 'Veículo excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;