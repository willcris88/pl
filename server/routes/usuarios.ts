/**
 * ROTAS DE USUÁRIOS
 * 
 * Este arquivo contém todas as rotas relacionadas aos usuários:
 * - GET /api/usuarios - Listar usuários
 * - GET /api/usuarios/:id - Buscar usuário específico
 * - POST /api/usuarios - Criar novo usuário
 * - PATCH /api/usuarios/:id - Atualizar usuário
 * - DELETE /api/usuarios/:id - Excluir usuário
 * 
 * MANUTENÇÃO:
 * - Todas as funções de validação estão em ../functions/usuarios.ts
 * - Logs de auditoria são automáticos
 * - Middleware de autenticação obrigatório
 */

import { Router } from "express";
import { storage } from "../storage";
import { AuditLogger } from "../audit-middleware";
import { inserirUsuarioSchema } from "@shared/schema";

const router = Router();

// Middleware de autenticação para todas as rotas
router.use((req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
});

/**
 * GET /api/usuarios
 * Lista todos os usuários (apenas admin)
 */
router.get("/", async (req: any, res) => {
  try {
    // Verificar se é admin (implementar verificação de role)
    const usuarios = await storage.getUsuarios();
    res.json(usuarios);
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * GET /api/usuarios/:id
 * Busca um usuário específico
 */
router.get("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const usuario = await storage.getUser(id);
    
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    // Remover senha da resposta
    const { senha, ...usuarioSemSenha } = usuario;
    res.json(usuarioSemSenha);
  } catch (error: any) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * POST /api/usuarios
 * Cria um novo usuário
 */
router.post("/", async (req: any, res) => {
  try {
    const validatedData = inserirUsuarioSchema.parse(req.body);
    const novoUsuario = await storage.createUser(validatedData);
    
    // Log de auditoria
    await AuditLogger.logCreate("usuarios", novoUsuario.id, req, {
      nome: novoUsuario.nome,
      email: novoUsuario.email
    });
    
    // Remover senha da resposta
    const { senha, ...usuarioSemSenha } = novoUsuario;
    res.status(201).json(usuarioSemSenha);
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * PATCH /api/usuarios/:id
 * Atualiza um usuário existente
 */
router.patch("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = inserirUsuarioSchema.partial().parse(req.body);
    
    const usuarioAtualizado = await storage.updateUser(id, validatedData);
    
    // Log de auditoria
    await AuditLogger.logUpdate("usuarios", id, req, {
      alteracoes: Object.keys(validatedData).join(', ')
    });
    
    // Remover senha da resposta
    const { senha, ...usuarioSemSenha } = usuarioAtualizado;
    res.json(usuarioSemSenha);
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

/**
 * DELETE /api/usuarios/:id
 * Exclui um usuário
 */
router.delete("/:id", async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const usuario = await storage.getUser(id);
    
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    await storage.deleteUser(id);
    
    // Log de auditoria
    await AuditLogger.logDelete("usuarios", id, req, {
      nome: usuario.nome,
      email: usuario.email
    });
    
    res.json({ message: "Usuário excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default router;