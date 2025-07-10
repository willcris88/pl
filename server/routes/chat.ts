/**
 * Rotas do sistema de chat em tempo real
 * Sistema inspirado no Messenger com status online/offline
 * 
 * Funcionalidades:
 * - Lista de usuários online/offline
 * - Envio e recebimento de mensagens
 * - Atualização de status de presença
 * - Histórico de conversas
 */

import { Express } from "express";
import { db } from "../db";
import { chatMensagens, chatPresenca, usuarios } from "@shared/schema";
import { eq, and, or, desc, ne } from "drizzle-orm";
import { AuditLogger } from "../audit-middleware";

export function registerChatRoutes(app: Express) {
  
  // ========== MIDDLEWARE DE AUTENTICAÇÃO ==========
  function requireAuth(req: any, res: any, next: any) {
    console.log('🔐 Verificando autenticação:', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      session: req.session?.passport
    });
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    next();
  }
  
  // ========== ROTAS DE PRESENÇA DE USUÁRIOS ==========
  
  /**
   * GET /api/chat/usuarios - Lista todos os usuários com status online/offline
   */
  app.get("/api/chat/usuarios", async (req: any, res) => {
    try {
      console.log("🔍 API /api/chat/usuarios chamada");
      console.log("🔐 Usuário autenticado:", req.user?.id, req.user?.email);
      
      const usuarioAtual = req.user?.id;
      
      // Buscar todos os usuários exceto o atual
      const todosUsuarios = await db
        .select({
          id: usuarios.id,
          nome: usuarios.nome,
          email: usuarios.email,
        })
        .from(usuarios)
        .where(ne(usuarios.id, usuarioAtual))
        .orderBy(usuarios.nome);

      console.log("📊 Usuarios no banco (exceto atual):", todosUsuarios.length);

      // Buscar presença dos usuários
      const presencas = await db
        .select()
        .from(chatPresenca)
        .where(eq(chatPresenca.online, true));

      // Formatear com status de presença
      const usuariosFormatados = todosUsuarios.map(user => {
        const presenca = presencas.find(p => p.usuarioId === user.id);
        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          online: !!presenca,
          ultima_atividade: presenca?.ultimaAtividade || null,
        };
      });

      console.log("✅ Usuarios retornados:", usuariosFormatados.length);
      res.json(usuariosFormatados);
    } catch (error) {
      console.error("❌ Erro ao buscar usuários:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  /**
   * POST /api/chat/presenca - Atualiza status de presença do usuário
   */
  app.post("/api/chat/presenca", async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const { online } = req.body;
      const usuarioId = req.user.id;

      // Verifica se já existe registro de presença
      const presencaExistente = await db
        .select()
        .from(chatPresenca)
        .where(eq(chatPresenca.usuarioId, usuarioId))
        .limit(1);

      if (presencaExistente.length > 0) {
        // Atualiza presença existente
        await db
          .update(chatPresenca)
          .set({
            online,
            ultimaAtividade: new Date(),
            atualizadoEm: new Date(),
          })
          .where(eq(chatPresenca.usuarioId, usuarioId));
      } else {
        // Cria nova presença
        await db.insert(chatPresenca).values({
          usuarioId,
          online,
          ultimaAtividade: new Date(),
          atualizadoEm: new Date(),
        });
      }

      await AuditLogger.logAction("UPDATE", "chat_presenca", usuarioId, {
        acao: "atualizar_presenca",
        status: online ? "online" : "offline",
      }, req);

      res.json({ success: true, status: online ? "online" : "offline" });
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // ========== ROTAS DE MENSAGENS ==========

  /**
   * GET /api/chat/conversas - Busca todas as conversas do usuário atual
   */
  app.get("/api/chat/conversas", async (req: any, res) => {
    try {
      console.log("🔍 API /api/chat/conversas chamada");
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const usuarioAtual = req.user.id;
      console.log("👤 Buscando conversas para usuário:", usuarioAtual);

      // Buscar usuários simples primeiro
      const todosUsuarios = await db
        .select({
          id: usuarios.id,
          nome: usuarios.nome,
          email: usuarios.email,
        })
        .from(usuarios)
        .where(ne(usuarios.id, usuarioAtual))
        .orderBy(usuarios.nome);

      // Buscar presença separadamente
      const presencas = await db
        .select()
        .from(chatPresenca)
        .where(eq(chatPresenca.online, true));

      // Transformar em formato de conversas
      const conversasFormatadas = todosUsuarios.map(usuario => {
        const presenca = presencas.find(p => p.usuarioId === usuario.id);
        return {
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            online: !!presenca,
          },
          ultima_mensagem: null,
          mensagens_nao_lidas: 0,
        };
      });

      res.json(conversasFormatadas);
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  /**
   * GET /api/chat/mensagens/:usuarioId - Busca mensagens de uma conversa específica
   */
  app.get("/api/chat/mensagens/:usuarioId", async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const { usuarioId } = req.params;
      const usuarioAtual = req.user.id;

      const mensagens = await db
        .select({
          id: chatMensagens.id,
          conteudo: chatMensagens.conteudo,
          remetente_id: chatMensagens.remetenteId,
          destinatario_id: chatMensagens.destinatarioId,
          lida: chatMensagens.lida,
          criada_em: chatMensagens.criadaEm,
          remetente_nome: usuarios.nome,
        })
        .from(chatMensagens)
        .innerJoin(usuarios, eq(chatMensagens.remetenteId, usuarios.id))
        .where(
          or(
            and(eq(chatMensagens.remetenteId, usuarioAtual), eq(chatMensagens.destinatarioId, parseInt(usuarioId))),
            and(eq(chatMensagens.remetenteId, parseInt(usuarioId)), eq(chatMensagens.destinatarioId, usuarioAtual))
          )
        )
        .orderBy(chatMensagens.criadaEm)
        .limit(50);

      // Transformar resultado para formato esperado
      const mensagensFormatadas = mensagens.map(msg => ({
        id: msg.id,
        conteudo: msg.conteudo,
        remetente_id: msg.remetente_id,
        destinatario_id: msg.destinatario_id,
        lida: msg.lida,
        criada_em: msg.criada_em,
        remetente: {
          nome: msg.remetente_nome,
        },
      }));

      res.json(mensagensFormatadas);
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  /**
   * POST /api/chat/mensagens - Envia nova mensagem
   */
  app.post("/api/chat/mensagens", async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const { destinatario_id, conteudo } = req.body;
      const remetenteId = req.user.id;

      console.log("📨 Dados recebidos:", { destinatario_id, conteudo, remetenteId });

      if (!destinatario_id || !conteudo?.trim()) {
        return res.status(400).json({ error: "Destinatário e conteúdo são obrigatórios" });
      }

      const [novaMensagem] = await db
        .insert(chatMensagens)
        .values({
          remetenteId,
          destinatarioId: destinatario_id,
          conteudo: conteudo.trim(),
          lida: false,
          criadaEm: new Date(),
        })
        .returning();

      await AuditLogger.logAction("CREATE", "chat_mensagens", remetenteId, {
        acao: "enviar_mensagem",
        destinatario: destinatario_id,
        preview: conteudo.substring(0, 50),
      }, req);

      // Broadcast via WebSocket para notificações instantâneas
      const wsServer = (req as any).app.get('wsServer');
      if (wsServer) {
        const mensagemWS = {
          type: 'nova_mensagem',
          id: novaMensagem.id,
          conteudo: novaMensagem.conteudo,
          remetente_id: novaMensagem.remetenteId,
          destinatario_id: novaMensagem.destinatarioId,
          criada_em: novaMensagem.criadaEm,
          remetente: { nome: req.user.nome },
        };

        // Enviar para todos os clientes conectados (para notificações)
        wsServer.clients.forEach((client: any) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(mensagemWS));
          }
        });
      }

      res.json(novaMensagem);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  /**
   * PATCH /api/chat/mensagens/:id/lida - Marca mensagem como lida
   */
  app.patch("/api/chat/mensagens/:id/lida", async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const { id } = req.params;
      const usuarioId = req.user.id;

      await db
        .update(chatMensagens)
        .set({ lida: true })
        .where(and(eq(chatMensagens.id, parseInt(id)), eq(chatMensagens.destinatarioId, usuarioId)));

      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao marcar mensagem como lida:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  /**
   * GET /api/chat/nao-lidas - Conta mensagens não lidas do usuário atual
   */
  app.get("/api/chat/nao-lidas", async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const usuarioId = req.user.id;

      const naoLidas = await db
        .select({ count: chatMensagens.id })
        .from(chatMensagens)
        .where(and(eq(chatMensagens.destinatarioId, usuarioId), eq(chatMensagens.lida, false)));

      res.json({ count: naoLidas.length });
    } catch (error) {
      console.error("Erro ao contar mensagens não lidas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  /**
   * DELETE /api/chat/mensagens/:id - Excluir mensagem específica
   */
  app.delete("/api/chat/mensagens/:id", async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const { id } = req.params;
      const usuarioId = req.user.id;

      // Verificar se a mensagem existe e pertence ao usuário
      const mensagem = await db
        .select()
        .from(chatMensagens)
        .where(eq(chatMensagens.id, parseInt(id)))
        .limit(1);

      if (!mensagem.length) {
        return res.status(404).json({ error: "Mensagem não encontrada" });
      }

      // Só permitir exclusão se for o remetente da mensagem
      if (mensagem[0].remetenteId !== usuarioId) {
        return res.status(403).json({ error: "Você só pode excluir suas próprias mensagens" });
      }

      // Excluir a mensagem
      await db.delete(chatMensagens).where(eq(chatMensagens.id, parseInt(id)));

      await AuditLogger.logAction("DELETE", "chat_mensagens", usuarioId, {
        acao: "excluir_mensagem",
        mensagem_id: parseInt(id),
      }, req);

      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  /**
   * DELETE /api/chat/conversas/:userId - Limpar todas as mensagens de uma conversa
   */
  app.delete("/api/chat/conversas/:userId", async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const { userId } = req.params;
      const currentUserId = req.user.id;

      // Excluir todas as mensagens entre os dois usuários
      await db.delete(chatMensagens)
        .where(
          or(
            and(
              eq(chatMensagens.remetenteId, currentUserId),
              eq(chatMensagens.destinatarioId, parseInt(userId))
            ),
            and(
              eq(chatMensagens.remetenteId, parseInt(userId)),
              eq(chatMensagens.destinatarioId, currentUserId)
            )
          )
        );

      await AuditLogger.logAction("DELETE", "chat_mensagens", currentUserId, {
        acao: "limpar_conversa",
        conversa_com: parseInt(userId),
      }, req);

      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao limpar conversa:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
}