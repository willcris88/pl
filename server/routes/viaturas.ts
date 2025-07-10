/**
 * ROTAS DE VIATURAS - Sistema de Veículos da Empresa
 * 
 * Gerencia os veículos da empresa (viaturas) com:
 * - Cadastro de veículos (nome, modelo, placa)
 * - Listagem e busca de veículos
 * - Atualização de informações
 * - Controle de status ativo/inativo
 * 
 * Integração com sistema de logs de auditoria
 */

import type { Express } from "express";
import { db } from "../db";
import { viaturas, inserirViaturaSchema, type Viatura, type InserirViatura } from "@shared/schema";
import { eq, ilike, or, desc } from "drizzle-orm";
import { AuditLogger } from "../audit-middleware";

export function registrarRotasViaturas(app: Express) {
  // Middleware de autenticação
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    next();
  }

  // GET /api/viaturas - Listar todas as viaturas
  app.get("/api/viaturas", requireAuth, async (req, res) => {
    try {
      const { busca } = req.query;
      
      let query = db.select().from(viaturas);
      
      if (busca) {
        query = query.where(
          or(
            ilike(viaturas.nome, `%${busca}%`),
            ilike(viaturas.modelo, `%${busca}%`),
            ilike(viaturas.placa, `%${busca}%`)
          )
        );
      }
      
      const resultados = await query.orderBy(desc(viaturas.criadoEm));
      
      res.json(resultados);
    } catch (error) {
      console.error("Erro ao buscar viaturas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // GET /api/viaturas/:id - Buscar viatura por ID
  app.get("/api/viaturas/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [viatura] = await db
        .select()
        .from(viaturas)
        .where(eq(viaturas.id, parseInt(id)));
      
      if (!viatura) {
        return res.status(404).json({ message: "Viatura não encontrada" });
      }
      
      res.json(viatura);
    } catch (error) {
      console.error("Erro ao buscar viatura:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // POST /api/viaturas - Criar nova viatura
  app.post("/api/viaturas", requireAuth, async (req, res) => {
    try {
      const dadosViatura = inserirViaturaSchema.parse(req.body);
      
      const [novaViatura] = await db
        .insert(viaturas)
        .values(dadosViatura)
        .returning();
      
      // Log de auditoria
      await AuditLogger.logCreate(
        req.user?.id || 0,
        "viaturas",
        novaViatura.id,
        `Viatura criada: ${novaViatura.nome} - ${novaViatura.placa}`,
        req
      );
      
      res.status(201).json(novaViatura);
    } catch (error) {
      console.error("Erro ao criar viatura:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // PATCH /api/viaturas/:id - Atualizar viatura
  app.patch("/api/viaturas/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const dadosViatura = inserirViaturaSchema.partial().parse(req.body);
      
      const [viaturaAtualizada] = await db
        .update(viaturas)
        .set({
          ...dadosViatura,
          atualizadoEm: new Date(),
        })
        .where(eq(viaturas.id, parseInt(id)))
        .returning();
      
      if (!viaturaAtualizada) {
        return res.status(404).json({ message: "Viatura não encontrada" });
      }
      
      // Log de auditoria
      await AuditLogger.logUpdate(
        req.user?.id || 0,
        "viaturas",
        parseInt(id),
        `Viatura atualizada: ${viaturaAtualizada.nome} - ${viaturaAtualizada.placa}`,
        req
      );
      
      res.json(viaturaAtualizada);
    } catch (error) {
      console.error("Erro ao atualizar viatura:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // DELETE /api/viaturas/:id - Excluir viatura
  app.delete("/api/viaturas/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const [viatura] = await db
        .select()
        .from(viaturas)
        .where(eq(viaturas.id, parseInt(id)));
      
      if (!viatura) {
        return res.status(404).json({ message: "Viatura não encontrada" });
      }
      
      await db
        .delete(viaturas)
        .where(eq(viaturas.id, parseInt(id)));
      
      // Log de auditoria
      await AuditLogger.logDelete(
        req.user?.id || 0,
        "viaturas",
        parseInt(id),
        `Viatura excluída: ${viatura.nome} - ${viatura.placa}`,
        req
      );
      
      res.json({ message: "Viatura excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir viatura:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // GET /api/viaturas/ativas - Listar apenas viaturas ativas
  app.get("/api/viaturas/ativas", requireAuth, async (req, res) => {
    try {
      const viaturasAtivas = await db
        .select()
        .from(viaturas)
        .where(eq(viaturas.ativo, true))
        .orderBy(viaturas.nome);
      
      res.json(viaturasAtivas);
    } catch (error) {
      console.error("Erro ao buscar viaturas ativas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
}

export default registrarRotasViaturas;