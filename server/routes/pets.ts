/**
 * ROTAS DE PETS
 * Sistema completo de gerenciamento de pets com CRUD
 */

import { Router } from "express";
import { db } from "../db";
import { pets, inserirPetSchema } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { AuditLogger } from "../audit-middleware";

const router = Router();

// Middleware de autenticação
function requireAuth(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  next();
}

// GET /api/pets - Listar todos os pets
router.get("/", requireAuth, async (req, res) => {
  try {
    console.log("🔍 API /api/pets chamada");
    console.log("🔐 Usuário autenticado:", req.user?.id, req.user?.email);
    
    const listaPets = await db.select().from(pets).orderBy(pets.criadoEm);
    
    console.log("📊 Pets encontrados:", listaPets.length);
    
    res.json(listaPets);
  } catch (error) {
    console.error("❌ Erro ao buscar pets:", error);
    res.status(500).json({ error: "Erro ao buscar pets" });
  }
});

// GET /api/pets/:id - Buscar pet por ID
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 API /api/pets/:id chamada para ID:", id);
    
    const pet = await db.select().from(pets).where(eq(pets.id, parseInt(id))).limit(1);
    
    if (pet.length === 0) {
      return res.status(404).json({ error: "Pet não encontrado" });
    }
    
    console.log("✅ Pet encontrado:", pet[0].nome);
    res.json(pet[0]);
  } catch (error) {
    console.error("❌ Erro ao buscar pet:", error);
    res.status(500).json({ error: "Erro ao buscar pet" });
  }
});

// POST /api/pets - Criar novo pet
router.post("/", requireAuth, async (req, res) => {
  try {
    console.log("🔍 API /api/pets POST chamada");
    console.log("📝 Dados recebidos:", req.body);
    
    const dadosValidados = inserirPetSchema.parse(req.body);
    
    const [novoPet] = await db.insert(pets).values(dadosValidados).returning();
    
    console.log("✅ Pet criado com sucesso:", novoPet.nome);
    
    // Log de auditoria
    await AuditLogger.logCreate(
      req.user.id,
      "pets",
      novoPet.id,
      dadosValidados,
      req
    );
    
    res.status(201).json(novoPet);
  } catch (error) {
    console.error("❌ Erro ao criar pet:", error);
    res.status(500).json({ error: "Erro ao criar pet" });
  }
});

// PUT /api/pets/:id - Atualizar pet completo
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 API /api/pets PUT chamada para ID:", id);
    console.log("📝 Dados recebidos:", req.body);
    
    const dadosValidados = inserirPetSchema.parse(req.body);
    
    const [petAtualizado] = await db
      .update(pets)
      .set(dadosValidados)
      .where(eq(pets.id, parseInt(id)))
      .returning();
    
    if (!petAtualizado) {
      return res.status(404).json({ error: "Pet não encontrado" });
    }
    
    console.log("✅ Pet atualizado com sucesso:", petAtualizado.nome);
    
    // Log de auditoria
    await AuditLogger.logUpdate(
      req.user.id,
      "pets",
      parseInt(id),
      dadosValidados,
      req
    );
    
    res.json(petAtualizado);
  } catch (error) {
    console.error("❌ Erro ao atualizar pet:", error);
    res.status(500).json({ error: "Erro ao atualizar pet", details: error.message });
  }
});

// PATCH /api/pets/:id - Atualizar pet parcial
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 API /api/pets PATCH chamada para ID:", id);
    console.log("📝 Dados recebidos:", req.body);
    
    // Para PATCH, validamos apenas os campos enviados
    const dadosValidados = inserirPetSchema.partial().parse(req.body);
    
    const [petAtualizado] = await db
      .update(pets)
      .set(dadosValidados)
      .where(eq(pets.id, parseInt(id)))
      .returning();
    
    if (!petAtualizado) {
      return res.status(404).json({ error: "Pet não encontrado" });
    }
    
    console.log("✅ Pet atualizado com sucesso:", petAtualizado.nome);
    
    // Log de auditoria
    await AuditLogger.logUpdate(
      req.user.id,
      "pets",
      parseInt(id),
      dadosValidados,
      req
    );
    
    res.json(petAtualizado);
  } catch (error) {
    console.error("❌ Erro ao atualizar pet:", error);
    res.status(500).json({ error: "Erro ao atualizar pet", details: error.message });
  }
});

// DELETE /api/pets/:id - Excluir pet
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 API /api/pets DELETE chamada para ID:", id);
    
    const [petExcluido] = await db
      .delete(pets)
      .where(eq(pets.id, parseInt(id)))
      .returning();
    
    if (!petExcluido) {
      return res.status(404).json({ error: "Pet não encontrado" });
    }
    
    console.log("✅ Pet excluído com sucesso:", petExcluido.nome);
    
    // Log de auditoria
    await AuditLogger.logDelete(
      req.user.id,
      "pets",
      parseInt(id),
      req
    );
    
    res.json({ message: "Pet excluído com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao excluir pet:", error);
    res.status(500).json({ error: "Erro ao excluir pet" });
  }
});

export default router;