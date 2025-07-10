import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { livroCaixa, inserirLivroCaixaSchema } from "@shared/schema";
import { eq, desc, and, gte, lte, ilike, sql } from "drizzle-orm";
import { AuditLogger } from "../audit-middleware";

const router = Router();

/**
 * Rotas do Livro Caixa
 * Sistema completo para gerenciamento de transações financeiras
 */

// Listar transações do livro caixa
router.get("/", async (req, res) => {
  try {
    const { page = 1, limite = 10, busca, tipo, categoria, dataInicio, dataFim } = req.query;
    const offset = (Number(page) - 1) * Number(limite);
    
    let query = db
      .select({
        id: livroCaixa.id,
        numeroLancamento: livroCaixa.numeroLancamento,
        data: livroCaixa.data,
        tipo: livroCaixa.tipo,
        categoria: livroCaixa.categoria,
        subcategoria: livroCaixa.subcategoria,
        descricao: livroCaixa.descricao,
        valor: livroCaixa.valor,
        formaPagamento: livroCaixa.formaPagamento,
        nomeContato: livroCaixa.nomeContato,
        status: livroCaixa.status,
        numeroComprovante: livroCaixa.numeroComprovante,
        criadoEm: livroCaixa.criadoEm,
      })
      .from(livroCaixa)
      .orderBy(desc(livroCaixa.data), desc(livroCaixa.id))
      .limit(Number(limite))
      .offset(offset);

    const whereConditions = [];

    if (busca) {
      whereConditions.push(
        sql`(
          ${livroCaixa.descricao} ILIKE ${`%${busca}%`} OR
          ${livroCaixa.nomeContato} ILIKE ${`%${busca}%`} OR
          ${livroCaixa.numeroLancamento} ILIKE ${`%${busca}%`} OR
          ${livroCaixa.numeroComprovante} ILIKE ${`%${busca}%`}
        )`
      );
    }

    if (tipo) {
      whereConditions.push(eq(livroCaixa.tipo, tipo as string));
    }

    if (categoria) {
      whereConditions.push(eq(livroCaixa.categoria, categoria as string));
    }

    if (dataInicio) {
      whereConditions.push(gte(livroCaixa.data, new Date(dataInicio as string)));
    }

    if (dataFim) {
      whereConditions.push(lte(livroCaixa.data, new Date(dataFim as string)));
    }

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    const transacoes = await query;

    // Contar total de registros
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(livroCaixa);

    if (whereConditions.length > 0) {
      countQuery = countQuery.where(and(...whereConditions));
    }

    const [{ count }] = await countQuery;

    // Calcular totais
    const totaisQuery = db
      .select({
        totalEntradas: sql<number>`COALESCE(SUM(CASE WHEN ${livroCaixa.tipo} = 'entrada' THEN ${livroCaixa.valor} ELSE 0 END), 0)`,
        totalSaidas: sql<number>`COALESCE(SUM(CASE WHEN ${livroCaixa.tipo} = 'saida' THEN ${livroCaixa.valor} ELSE 0 END), 0)`,
      })
      .from(livroCaixa);

    const [totais] = await totaisQuery;
    const saldoAtual = Number(totais.totalEntradas) - Number(totais.totalSaidas);

    res.json({
      transacoes,
      total: count,
      totalPages: Math.ceil(count / Number(limite)),
      currentPage: Number(page),
      resumo: {
        totalEntradas: totais.totalEntradas,
        totalSaidas: totais.totalSaidas,
        saldoAtual,
      },
    });
  } catch (error) {
    console.error("Erro ao listar transações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Obter transação específica
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [transacao] = await db
      .select()
      .from(livroCaixa)
      .where(eq(livroCaixa.id, Number(id)));

    if (!transacao) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }

    res.json(transacao);
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Criar nova transação
router.post("/", async (req, res) => {
  try {
    const validatedData = inserirLivroCaixaSchema.parse(req.body);
    
    // Gerar número de lançamento automático
    const [ultimoLancamento] = await db
      .select({ numeroLancamento: livroCaixa.numeroLancamento })
      .from(livroCaixa)
      .orderBy(desc(livroCaixa.id))
      .limit(1);

    let proximoNumero = 1;
    if (ultimoLancamento?.numeroLancamento) {
      const numeroAtual = parseInt(ultimoLancamento.numeroLancamento.replace(/\D/g, ''));
      proximoNumero = numeroAtual + 1;
    }

    const numeroLancamento = `LC${String(proximoNumero).padStart(6, '0')}`;

    const [novaTransacao] = await db
      .insert(livroCaixa)
      .values({
        ...validatedData,
        numeroLancamento,
        usuarioId: req.user?.id,
      })
      .returning();

    // Log de auditoria
    await AuditLogger.logCreate(
      'livro_caixa',
      novaTransacao.id,
      { transacao: novaTransacao },
      req.user?.id,
      req
    );

    res.status(201).json(novaTransacao);
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Atualizar transação
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = inserirLivroCaixaSchema.partial().parse(req.body);

    const [transacaoAtual] = await db
      .select()
      .from(livroCaixa)
      .where(eq(livroCaixa.id, Number(id)));

    if (!transacaoAtual) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }

    const [transacaoAtualizada] = await db
      .update(livroCaixa)
      .set({
        ...validatedData,
        atualizadoEm: new Date(),
      })
      .where(eq(livroCaixa.id, Number(id)))
      .returning();

    // Log de auditoria
    await AuditLogger.logUpdate(
      'livro_caixa',
      Number(id),
      { antes: transacaoAtual, depois: transacaoAtualizada },
      req.user?.id,
      req
    );

    res.json(transacaoAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }
    
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Cancelar transação (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [transacaoAtual] = await db
      .select()
      .from(livroCaixa)
      .where(eq(livroCaixa.id, Number(id)));

    if (!transacaoAtual) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }

    const [transacaoCancelada] = await db
      .update(livroCaixa)
      .set({
        status: "cancelado",
        atualizadoEm: new Date(),
      })
      .where(eq(livroCaixa.id, Number(id)))
      .returning();

    // Log de auditoria
    await AuditLogger.logDelete(
      'livro_caixa',
      Number(id),
      { transacao: transacaoAtual },
      req.user?.id,
      req
    );

    res.json({ message: "Transação cancelada com sucesso", transacao: transacaoCancelada });
  } catch (error) {
    console.error("Erro ao cancelar transação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Relatório de resumo financeiro
router.get("/relatorio/resumo", async (req, res) => {
  try {
    const { dataInicio, dataFim, categoria } = req.query;
    
    let query = db
      .select({
        tipo: livroCaixa.tipo,
        categoria: livroCaixa.categoria,
        total: sql<number>`SUM(${livroCaixa.valor})`,
        quantidade: sql<number>`COUNT(*)`,
      })
      .from(livroCaixa)
      .where(eq(livroCaixa.status, "confirmado"))
      .groupBy(livroCaixa.tipo, livroCaixa.categoria);

    const whereConditions = [eq(livroCaixa.status, "confirmado")];

    if (dataInicio) {
      whereConditions.push(gte(livroCaixa.data, new Date(dataInicio as string)));
    }

    if (dataFim) {
      whereConditions.push(lte(livroCaixa.data, new Date(dataFim as string)));
    }

    if (categoria) {
      whereConditions.push(eq(livroCaixa.categoria, categoria as string));
    }

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    const resumo = await query;

    // Calcular totais gerais
    const totaisGerais = resumo.reduce((acc, item) => {
      if (item.tipo === 'entrada') {
        acc.totalEntradas += Number(item.total);
        acc.quantidadeEntradas += Number(item.quantidade);
      } else {
        acc.totalSaidas += Number(item.total);
        acc.quantidadeSaidas += Number(item.quantidade);
      }
      return acc;
    }, {
      totalEntradas: 0,
      totalSaidas: 0,
      quantidadeEntradas: 0,
      quantidadeSaidas: 0,
    });

    const saldoLiquido = totaisGerais.totalEntradas - totaisGerais.totalSaidas;

    res.json({
      resumoPorCategoria: resumo,
      totaisGerais: {
        ...totaisGerais,
        saldoLiquido,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;