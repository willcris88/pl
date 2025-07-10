/**
 * ROTAS PARA SERVIÇOS DE MOTORISTA
 * 
 * Este arquivo contém todas as rotas relacionadas aos serviços de motorista.
 * Os serviços de motorista são utilizados no modal de adicionar veículos.
 */

import type { Express, Request, Response, Router } from "express";
import { Router as createRouter } from "express";
import { db } from "../db";
import { servicosMotorista } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { AuditLogger } from "../audit-middleware";

function requireAuth(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  next();
}

const router = createRouter();

export default function servicosMotoristaRoutes(): Router {
  // GET - Buscar todos os serviços de motorista ativos
  router.get("/", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = await db
        .select()
        .from(servicosMotorista)
        .where(eq(servicosMotorista.ativo, true))
        .orderBy(servicosMotorista.nome);
      
      console.log("Serviços de motorista encontrados:", result);
      res.json(result);
    } catch (error) {
      console.error("Erro ao buscar serviços de motorista:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // GET - Buscar serviço de motorista por ID
  router.get("/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        "SELECT * FROM servicos_motorista WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Serviço de motorista não encontrado" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao buscar serviço de motorista:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // POST - Criar novo serviço de motorista
  router.post("/", requireAuth, async (req: Request, res: Response) => {
    try {
      const { nome, descricao, valor_padrao, ativo = true } = req.body;

      if (!nome) {
        return res.status(400).json({ error: "Nome é obrigatório" });
      }

      const result = await db.query(
        "INSERT INTO servicos_motorista (nome, descricao, valor_padrao, ativo) VALUES ($1, $2, $3, $4) RETURNING *",
        [nome, descricao || null, valor_padrao || null, ativo]
      );

      const novoServico = result.rows[0];

      // Log de auditoria
      await AuditLogger.logCreate(
        'servicos_motorista',
        novoServico.id,
        novoServico,
        req as any
      );

      res.status(201).json(novoServico);
    } catch (error) {
      console.error("Erro ao criar serviço de motorista:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // PUT - Atualizar serviço de motorista
  router.put("/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { nome, descricao, valor_padrao, ativo } = req.body;

      if (!nome) {
        return res.status(400).json({ error: "Nome é obrigatório" });
      }

      // Buscar dados antigos para auditoria
      const dadosAntigos = await db.query("SELECT * FROM servicos_motorista WHERE id = $1", [id]);
      
      if (dadosAntigos.rows.length === 0) {
        return res.status(404).json({ error: "Serviço de motorista não encontrado" });
      }

      const result = await db.query(
        "UPDATE servicos_motorista SET nome = $1, descricao = $2, valor_padrao = $3, ativo = $4, atualizado_em = NOW() WHERE id = $5 RETURNING *",
        [nome, descricao || null, valor_padrao || null, ativo, id]
      );

      const servicoAtualizado = result.rows[0];

      // Log de auditoria
      await AuditLogger.logUpdate(
        'servicos_motorista',
        parseInt(id),
        dadosAntigos.rows[0],
        servicoAtualizado,
        req as any
      );

      res.json(servicoAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar serviço de motorista:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // DELETE - Excluir serviço de motorista
  router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Buscar dados para auditoria
      const dadosServico = await db.query("SELECT * FROM servicos_motorista WHERE id = $1", [id]);
      
      if (dadosServico.rows.length === 0) {
        return res.status(404).json({ error: "Serviço de motorista não encontrado" });
      }

      await db.query("DELETE FROM servicos_motorista WHERE id = $1", [id]);

      // Log de auditoria
      await AuditLogger.logDelete(
        'servicos_motorista',
        parseInt(id),
        dadosServico.rows[0],
        req as any
      );

      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir serviço de motorista:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  return router;
}