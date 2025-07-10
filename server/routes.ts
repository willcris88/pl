/**
 * ARQUIVO DE ROTAS PRINCIPAL - VERSÃO ORGANIZADA
 * 
 * Este arquivo contém apenas as importações das rotas modulares.
 * Todas as rotas estão organizadas em arquivos separados na pasta routes/
 * 
 * ESTRUTURA ORGANIZACIONAL:
 * - Rotas principais: usuarios, obitos, ordens-servico, calendario
 * - Rotas de gestão: fornecedores, prestadoras, produtos, produtos-os
 * - Rotas de relacionamentos: contratos, pendencias, motoristas, documentos
 * - Rotas de sistema: logs-auditoria
 * 
 * MANUTENÇÃO:
 * - Para adicionar nova rota, criar arquivo em routes/ e importar aqui
 * - Cada arquivo de rota é independente e autocontido
 * - Logs de auditoria automáticos em todas as rotas
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";

// ===== IMPORTAÇÕES DE ROTAS MODULARES =====
// Rotas principais do sistema
import usuariosRoutes from "./routes/usuarios";
import obitoRoutes from "./routes/obitos";
import ordensServicoRoutes from "./routes/ordens-servico"; 
import calendarioRoutes from "./routes/calendario";
import documentosRoutes from "./routes/documentos";
import petsRoutes from "./routes/pets";
import { documentosSimplesRoutes } from "./routes/documentos-simples";
import { documentosFuncionaisRoutes } from "./routes/documentos-funcionais";
import { documentosPdfRoutes } from "./routes/documentos-pdf";

// Rotas de gestão
import fornecedoresRoutes from "./routes/fornecedores";
import prestadorasRoutes from "./routes/prestadoras";
import produtosRoutes from "./routes/produtos";
import produtosOsRoutes from "./routes/produtos-os";

// Rotas de relacionamentos
import contratosRoutes from "./routes/contratos";
import pendenciasRoutes from "./routes/pendencias";
import motoristasRoutes from "./routes/motoristas";
import veiculosOsRoutes from "./routes/veiculos-os";
import viaturasRoutes from "./routes/viaturas";
import servicosMotoristaRoutes from "./routes/servicos-motorista";

// Rotas de sistema
import logsAuditoriaRoutes from "./routes/logs-auditoria";
import backupRoutes from "./routes/backup";
import motoristasOrdemServicoRoutes from "./routes/motoristas-ordem-servico";
import { registerChatRoutes } from "./routes/chat";

// Rotas do sistema de motoristas
import motoristaAuthRouter from './routes/motorista-auth.js';
import motoristaDashboardRouter from './routes/motorista-dashboard.js';
import veiculosRouter from './routes/veiculos.js';
import { notasContratuaisRouter } from './routes/notas-contratuais';
import { setupDeclaracaoObitoRoutes } from './routes/declaracao-obito';
import ataSomatoconservacaoRoutes from './routes/ata-somatoconservacao';
import livroCaixaRoutes from './routes/livro-caixa';

// Rotas de notas especiais
import notasNdRoutes from './routes/notas-nd';
import notasGtcRoutes from './routes/notas-gtc';

export function registerRoutes(app: Express): Server {
  // ===== CONFIGURAÇÃO DE AUTENTICAÇÃO =====
  setupAuth(app);

  // ===== REGISTRO DE ROTAS MODULARES =====
  console.log("=== REGISTRANDO ROTAS MODULARES ORGANIZADAS ===");
  
  // Rotas principais do sistema
  app.use("/api/usuarios", usuariosRoutes);
  app.use("/api/obitos", obitoRoutes);
  app.use("/api/ordens-servico", ordensServicoRoutes);
  app.use("/api/calendario", calendarioRoutes);
  app.use("/api/documentos", documentosRoutes);
  app.use("/api/pets", petsRoutes);
  app.use("/api/documentos-simples", documentosSimplesRoutes);
  app.use("/api/documentos-funcionais", documentosFuncionaisRoutes);
  app.use("/api/documentos-pdf", documentosPdfRoutes);
  
  // Rotas de gestão
  app.use("/api/fornecedores", fornecedoresRoutes);
  app.use("/api/prestadoras", prestadorasRoutes);
  app.use("/api/produtos", produtosRoutes);
  app.use("/api/produtos-os", produtosOsRoutes);
  
  // Rotas de relacionamentos
  app.use("/api/contratos", contratosRoutes);
  app.use("/api/pendencias", pendenciasRoutes);
  app.use("/api/motoristas", motoristasRoutes);
  app.use("/api/veiculos-os", veiculosOsRoutes);
  app.use("/api/viaturas", viaturasRoutes);
  app.use("/api/servicos-motorista", servicosMotoristaRoutes());
  
  // Rotas de sistema
  app.use("/api/logs-auditoria", logsAuditoriaRoutes);
  app.use("/api/backup", backupRoutes);
  app.use("/api/motoristas-ordem-servico", motoristasOrdemServicoRoutes);
  registerChatRoutes(app);
  
  // Rotas de notas contratuais
  app.use("/api/notas-contratuais", notasContratuaisRouter);
  
  // Rotas de declaração de óbito
  setupDeclaracaoObitoRoutes(app);
  
  // Rota de ata de somatoconservação
  app.use("/api/ata-somatoconservacao", ataSomatoconservacaoRoutes);
  
  // Rotas do livro caixa
  app.use("/api/livro-caixa", livroCaixaRoutes);
  
  // Rotas de notas especiais
  app.use("/api/notas-nd", notasNdRoutes);
  app.use("/api/notas-gtc", notasGtcRoutes);
  
  // Rotas do sistema de motoristas
  app.use("/api/motorista", motoristaAuthRouter);
  app.use("/api/motorista", motoristaDashboardRouter);
  app.use("/api/veiculos", veiculosRouter);
  
  console.log("=== TODAS AS ROTAS MODULARES REGISTRADAS COM SUCESSO ===");

  // ===== ROTAS DE UTILITÁRIOS =====
  
  // Rota para verificar usuário autenticado
  app.get("/api/user", (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autorizado" });
    }
    
    // Remover senha da resposta
    const { senha, ...usuarioSemSenha } = req.user;
    res.json(usuarioSemSenha);
  });

  // Rota de health check
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "Servidor funcionando normalmente" 
    });
  });

  // ===== CRIAÇÃO DO SERVIDOR HTTP =====
  const httpServer = createServer(app);
  console.log("=== SERVIDOR HTTP CRIADO COM SUCESSO ===");
  
  // ===== CONFIGURAÇÃO DO WEBSOCKET PARA CHAT =====
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  // Armazenar WebSocket server no app para acesso pelas rotas
  app.set('wsServer', wss);

  // Map para rastrear conexões dos usuários
  const userConnections = new Map<number, WebSocket>();

  wss.on('connection', (ws, req) => {
    let userId: number | null = null;

    console.log('Nova conexão WebSocket estabelecida');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'auth':
            // Autenticar usuário
            userId = data.userId;
            if (userId) {
              userConnections.set(userId, ws);
              (ws as any).userId = userId; // Adicionar userId no objeto WebSocket
              console.log(`Usuário ${userId} conectado ao chat`);
              
              // Notificar outros usuários que este usuário está online
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'user_online',
                    userId: userId
                  }));
                }
              });
            }
            break;

          case 'send_message':
            // Enviar mensagem
            if (userId && data.destinatarioId && data.conteudo) {
              // Buscar conexão do destinatário
              const destinatarioWs = userConnections.get(data.destinatarioId);
              
              // Notificar destinatário se estiver online
              if (destinatarioWs && destinatarioWs.readyState === WebSocket.OPEN) {
                destinatarioWs.send(JSON.stringify({
                  type: 'new_message',
                  remetenteId: userId,
                  destinatarioId: data.destinatarioId,
                  conteudo: data.conteudo,
                  criadaEm: new Date().toISOString()
                }));
              }

              // Confirmar para o remetente
              ws.send(JSON.stringify({
                type: 'message_sent',
                success: true
              }));
            }
            break;

          case 'mark_read':
            // Marcar mensagem como lida
            if (data.mensagemId && data.remetenteId) {
              const remetenteWs = userConnections.get(data.remetenteId);
              
              if (remetenteWs && remetenteWs.readyState === WebSocket.OPEN) {
                remetenteWs.send(JSON.stringify({
                  type: 'message_read',
                  mensagemId: data.mensagemId,
                  leitoPor: userId
                }));
              }
            }
            break;
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        userConnections.delete(userId);
        console.log(`Usuário ${userId} desconectado do chat`);
        
        // Notificar outros usuários que este usuário está offline
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'user_offline',
              userId: userId
            }));
          }
        });
      }
    });

    ws.on('error', (error) => {
      console.error('Erro na conexão WebSocket:', error);
    });
  });

  console.log("=== WEBSOCKET CHAT CONFIGURADO COM SUCESSO ===");

  return httpServer;
}