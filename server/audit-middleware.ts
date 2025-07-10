import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { InserirLogAuditoria } from '@shared/schema';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class AuditLogger {
  private static getClientIp(req: Request): string {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private static getUserAgent(req: Request): string {
    return req.get('User-Agent') || 'unknown';
  }

  public static async logAction(
    usuarioId: number,
    acao: string,
    tabela: string,
    registroId?: number,
    dadosAnteriores?: any,
    dadosNovos?: any,
    detalhes?: string,
    req?: Request
  ): Promise<void> {
    try {
      const log: InserirLogAuditoria = {
        usuarioId,
        acao,
        tabela,
        registroId,
        dadosAnteriores,
        dadosNovos,
        detalhes,
        enderecoIp: req ? this.getClientIp(req) : undefined,
        userAgent: req ? this.getUserAgent(req) : undefined,
      };

      await storage.createLogAuditoria(log);
    } catch (error) {
    }
  }

  public static async logLogin(usuarioId: number, req: Request): Promise<void> {
    await this.logAction(
      usuarioId,
      'LOGIN',
      'usuarios',
      usuarioId,
      null,
      null,
      'Usuário fez login no sistema',
      req
    );
  }

  public static async logLogout(usuarioId: number, req: Request): Promise<void> {
    await this.logAction(
      usuarioId,
      'LOGOUT',
      'usuarios',
      usuarioId,
      null,
      null,
      'Usuário fez logout do sistema',
      req
    );
  }

  public static async logCreate(
    usuarioId: number,
    tabela: string,
    registroId: number,
    dadosNovos: any,
    detalhes: string,
    req: Request
  ): Promise<void> {
    await this.logAction(
      usuarioId,
      'CREATE',
      tabela,
      registroId,
      null,
      dadosNovos,
      detalhes,
      req
    );
  }

  public static async logUpdate(
    usuarioId: number,
    tabela: string,
    registroId: number,
    dadosAnteriores: any,
    dadosNovos: any,
    detalhes: string,
    req: Request
  ): Promise<void> {
    await this.logAction(
      usuarioId,
      'UPDATE',
      tabela,
      registroId,
      dadosAnteriores,
      dadosNovos,
      detalhes,
      req
    );
  }

  public static async logDelete(
    usuarioId: number,
    tabela: string,
    registroId: number,
    dadosAnteriores: any,
    detalhes: string,
    req: Request
  ): Promise<void> {
    await this.logAction(
      usuarioId,
      'DELETE',
      tabela,
      registroId,
      dadosAnteriores,
      null,
      detalhes,
      req
    );
  }
}

// Middleware para capturar todas as requests e gerar logs automaticamente
export function auditMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Salvar o método original de response para interceptar
  const originalSend = res.send;

  res.send = function(data: any) {
    // Só logar se o usuário estiver autenticado e a response foi bem-sucedida
    if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
      const method = req.method;
      const path = req.path;
      
      // Determinar ação baseada no método HTTP
      let acao = '';
      let tabela = '';
      let detalhes = '';
      
      if (path.includes('/api/ordens-servico')) {
        tabela = 'ordens_servico';
        if (method === 'POST') {
          acao = 'CREATE';
          detalhes = 'Criou nova ordem de serviço';
        } else if (method === 'PUT' || method === 'PATCH') {
          acao = 'UPDATE';
          detalhes = 'Atualizou ordem de serviço';
        } else if (method === 'DELETE') {
          acao = 'DELETE';
          detalhes = 'Excluiu ordem de serviço';
        }
      } else if (path.includes('/api/pendencias')) {
        tabela = 'pendencias';
        if (method === 'POST') {
          acao = 'CREATE';
          detalhes = 'Criou nova pendência';
        } else if (method === 'PUT' || method === 'PATCH') {
          acao = 'UPDATE';
          detalhes = 'Atualizou pendência';
        } else if (method === 'DELETE') {
          acao = 'DELETE';
          detalhes = 'Excluiu pendência';
        }
      } else if (path.includes('/api/motoristas')) {
        tabela = 'motoristas';
        if (method === 'POST') {
          acao = 'CREATE';
          detalhes = 'Criou novo motorista';
        } else if (method === 'PUT' || method === 'PATCH') {
          acao = 'UPDATE';
          detalhes = 'Atualizou motorista';
        }
      } else if (path.includes('/api/fornecedores')) {
        tabela = 'fornecedores';
        if (method === 'POST') {
          acao = 'CREATE';
          detalhes = 'Criou novo fornecedor';
        } else if (method === 'PUT' || method === 'PATCH') {
          acao = 'UPDATE';
          detalhes = 'Atualizou fornecedor';
        } else if (method === 'DELETE') {
          acao = 'DELETE';
          detalhes = 'Excluiu fornecedor';
        }
      } else if (path.includes('/api/produtos')) {
        tabela = 'produtos';
        if (method === 'POST') {
          acao = 'CREATE';
          detalhes = 'Criou novo produto';
        } else if (method === 'PUT' || method === 'PATCH') {
          acao = 'UPDATE';
          detalhes = 'Atualizou produto';
        } else if (method === 'DELETE') {
          acao = 'DELETE';
          detalhes = 'Excluiu produto';
        }
      } else if (path.includes('/api/documentos')) {
        tabela = 'documentos';
        if (method === 'POST') {
          acao = 'CREATE';
          detalhes = 'Fez upload de documento';
        } else if (method === 'DELETE') {
          acao = 'DELETE';
          detalhes = 'Excluiu documento';
        }
      }

      // Registrar o log se for uma operação relevante
      if (acao && tabela) {
        // Fazer log de forma assíncrona sem bloquear a response
        setImmediate(async () => {
          try {
            await AuditLogger.logAction(
              req.user!.id,
              acao,
              tabela,
              undefined,
              undefined,
              undefined,
              detalhes,
              req
            );
          } catch (error) {
          }
        });
      }
    }

    // Chamar o método original
    return originalSend.call(this, data);
  };

  next();
}