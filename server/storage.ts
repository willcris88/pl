import { 
  usuarios, 
  ordensServico, 
  contratos, 
  pendencias, 
  fornecedores,
  prestadoras,
  produtos, 
  produtosFornecedores,
  produtosOs,
  produtosOrdemServico, 
  motoristas, 
  documentos,
  logsAuditoria,
  notasContratuais,
  pagamentosNotaContratual,
  obitos,
  eventosCalendario,
  pets,
  chatMensagens,
  chatPresenca,
  notasNd,
  notasGtc,
  type Usuario, 
  type InserirUsuario,
  type OrdemServico,
  type InserirOrdemServico,
  type Contrato,
  type InserirContrato,
  type Pendencia,
  type InserirPendencia,
  type Fornecedor,
  type InserirFornecedor,
  type Prestadora,
  type InserirPrestadora,
  type Produto,
  type InserirProduto,
  type ProdutoFornecedor,
  type InserirProdutoFornecedor,
  type ProdutoOs,
  type InserirProdutoOs,
  type Motorista,
  type InserirMotorista,
  type Documento,
  type InserirDocumento,
  type LogAuditoria,
  type InserirLogAuditoria,
  type NotaContratual,
  type InserirNotaContratual,
  type PagamentoNotaContratual,
  type InserirPagamentoNotaContratual,
  type Obito,
  type InserirObito,
  type EventoCalendario,
  type InserirEventoCalendario,
  type NotaNd,
  type InserirNotaNd,
  type NotaGtc,
  type InserirNotaGtc
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, sql } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";

// Configuração do store de sessões para SQLite
const sessionStoreType = process.env.SESSION_STORE || 'memory';
const memoryStore = MemoryStore(session);

export interface IStorage {
  // Usuários
  getUsuarios(): Promise<Usuario[]>;
  getUser(id: number): Promise<Usuario | undefined>;
  getUserByUsername(username: string): Promise<Usuario | undefined>;
  getUserByEmail(email: string): Promise<Usuario | undefined>;
  createUser(user: InserirUsuario): Promise<Usuario>;

  // Ordens de Serviço
  getOrdemServico(id: number): Promise<OrdemServico | undefined>;
  getOrdensServico(filtros?: any): Promise<OrdemServico[]>;
  createOrdemServico(ordem: InserirOrdemServico): Promise<OrdemServico>;
  updateOrdemServico(id: number, ordem: Partial<InserirOrdemServico>): Promise<OrdemServico>;
  deleteOrdemServico(id: number): Promise<void>;

  // Contratos
  getContratos(ordemServicoId: number): Promise<Contrato[]>;
  createContrato(contrato: InserirContrato): Promise<Contrato>;
  updateContrato(id: number, contrato: Partial<InserirContrato>): Promise<Contrato>;

  // Pendências
  getPendencias(ordemServicoId: number): Promise<Pendencia[]>;
  createPendencia(pendencia: InserirPendencia): Promise<Pendencia>;
  updatePendencia(id: number, pendencia: Partial<InserirPendencia>): Promise<Pendencia>;
  deletePendencia(id: number): Promise<void>;

  // Fornecedores
  getFornecedores(): Promise<Fornecedor[]>;
  getFornecedor(id: number): Promise<Fornecedor | undefined>;
  createFornecedor(fornecedor: InserirFornecedor): Promise<Fornecedor>;
  updateFornecedor(id: number, fornecedor: Partial<InserirFornecedor>): Promise<Fornecedor>;
  deleteFornecedor(id: number): Promise<void>;

  // Prestadoras
  getPrestadoras(): Promise<Prestadora[]>;
  getPrestadora(id: number): Promise<Prestadora | undefined>;
  createPrestadora(prestadora: InserirPrestadora): Promise<Prestadora>;
  updatePrestadora(id: number, prestadora: Partial<InserirPrestadora>): Promise<Prestadora>;
  deletePrestadora(id: number): Promise<void>;

  // Produtos
  getProdutos(): Promise<Produto[]>;
  getProduto(id: number): Promise<Produto | undefined>;
  createProduto(produto: InserirProduto): Promise<Produto>;
  updateProduto(id: number, produto: Partial<InserirProduto>): Promise<Produto>;
  deleteProduto(id: number): Promise<void>;

  // Produtos OS
  getProdutosOs(): Promise<ProdutoOs[]>;
  getProdutoOs(id: number): Promise<ProdutoOs | undefined>;
  createProdutoOs(produto: InserirProdutoOs): Promise<ProdutoOs>;
  updateProdutoOs(id: number, produto: Partial<InserirProdutoOs>): Promise<ProdutoOs>;
  deleteProdutoOs(id: number): Promise<void>;

  // Motoristas
  getMotoristas(ordemServicoId?: number): Promise<Motorista[]>;
  createMotorista(motorista: InserirMotorista): Promise<Motorista>;
  updateMotorista(id: number, motorista: Partial<InserirMotorista>): Promise<Motorista>;

  // Documentos
  getDocumentos(ordemServicoId: number): Promise<Documento[]>;
  getDocumento(id: number): Promise<Documento | undefined>;
  createDocumento(documento: InserirDocumento): Promise<Documento>;
  updateDocumento(id: number, data: Partial<InserirDocumento>): Promise<Documento>;
  deleteDocumento(id: number): Promise<void>;

  // Logs de Auditoria
  getLogsAuditoria(usuarioId?: number): Promise<LogAuditoria[]>;
  createLogAuditoria(log: InserirLogAuditoria): Promise<LogAuditoria>;

  // Notas Contratuais
  getNotasContratuais(ordemServicoId?: number): Promise<NotaContratual[]>;
  getNotaContratual(id: number): Promise<NotaContratual | undefined>;
  createNotaContratual(nota: InserirNotaContratual): Promise<NotaContratual>;
  updateNotaContratual(id: number, nota: Partial<InserirNotaContratual>): Promise<NotaContratual>;
  deleteNotaContratual(id: number): Promise<void>;

  // Pagamentos Nota Contratual
  getPagamentosNotaContratual(notaContratualId: number): Promise<PagamentoNotaContratual[]>;
  createPagamentoNotaContratual(pagamento: InserirPagamentoNotaContratual): Promise<PagamentoNotaContratual>;
  deletePagamentoNotaContratual(id: number): Promise<void>;

  // Óbitos
  getObitos(): Promise<Obito[]>;
  getObito(id: number): Promise<Obito | undefined>;
  createObito(obito: InserirObito): Promise<Obito>;
  updateObito(id: number, obito: Partial<InserirObito>): Promise<Obito>;
  deleteObito(id: number): Promise<void>;

  // Eventos Calendário
  getEventosCalendario(): Promise<EventoCalendario[]>;
  getEventoCalendario(id: number): Promise<EventoCalendario | undefined>;
  createEventoCalendario(evento: InserirEventoCalendario): Promise<EventoCalendario>;
  updateEventoCalendario(id: number, evento: Partial<InserirEventoCalendario>): Promise<EventoCalendario>;
  deleteEventoCalendario(id: number): Promise<void>;

  // Livro Caixa
  getLivroCaixa(): Promise<any[]>;
  createLancamentoCaixa(lancamento: any): Promise<any>;
  updateLancamentoCaixa(id: number, lancamento: any): Promise<any>;
  deleteLancamentoCaixa(id: number): Promise<void>;

  // Notas ND
  getNotasNd(): Promise<NotaNd[]>;
  getNotaNd(id: number): Promise<NotaNd | undefined>;
  createNotaNd(nota: InserirNotaNd): Promise<NotaNd>;
  updateNotaNd(id: number, nota: Partial<InserirNotaNd>): Promise<NotaNd>;
  deleteNotaNd(id: number): Promise<void>;

  // Notas GTC
  getNotasGtc(): Promise<NotaGtc[]>;
  getNotaGtc(id: number): Promise<NotaGtc | undefined>;
  createNotaGtc(nota: InserirNotaGtc): Promise<NotaGtc>;
  updateNotaGtc(id: number, nota: Partial<InserirNotaGtc>): Promise<NotaGtc>;
  deleteNotaGtc(id: number): Promise<void>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    // Para SQLite, usar MemoryStore para sessões
    this.sessionStore = new memoryStore({
      checkPeriod: 86400000 // Limpa sessões expiradas a cada 24h
    });
  }

  // Usuários
  async getUsuarios(): Promise<Usuario[]> {
    const usersList = await db.select({
      id: usuarios.id,
      email: usuarios.email,
      nome: usuarios.nome,
      ativo: usuarios.ativo,
      criadoEm: usuarios.criadoEm
    }).from(usuarios).orderBy(usuarios.nome);
    
    return usersList.map(user => ({
      ...user,
      senha: '' // Não retornar senha
    }));
  }

  async getUser(id: number): Promise<Usuario | undefined> {
    const result = await db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<Usuario | undefined> {
    const result = await db.select().from(usuarios).where(eq(usuarios.email, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<Usuario | undefined> {
    const result = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InserirUsuario): Promise<Usuario> {
    const result = await db.insert(usuarios).values({
      email: user.email,
      senha: user.senha,
      nome: user.nome,
      ativo: user.ativo ?? true
    }).returning();
    return result[0];
  }

  // Ordens de Serviço
  async getOrdemServico(id: number): Promise<OrdemServico | undefined> {
    return undefined; // Placeholder
  }

  async getOrdensServico(filtros?: any): Promise<OrdemServico[]> {
    return []; // Placeholder
  }

  async createOrdemServico(ordem: InserirOrdemServico): Promise<OrdemServico> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateOrdemServico(id: number, ordem: Partial<InserirOrdemServico>): Promise<OrdemServico> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteOrdemServico(id: number): Promise<void> {
    // Placeholder
  }

  // Contratos
  async getContratos(ordemServicoId: number): Promise<Contrato[]> {
    return []; // Placeholder
  }

  async createContrato(contrato: InserirContrato): Promise<Contrato> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateContrato(id: number, contrato: Partial<InserirContrato>): Promise<Contrato> {
    throw new Error("Not implemented"); // Placeholder
  }

  // Pendências
  async getPendencias(ordemServicoId: number): Promise<Pendencia[]> {
    return []; // Placeholder
  }

  async createPendencia(pendencia: InserirPendencia): Promise<Pendencia> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updatePendencia(id: number, pendencia: Partial<InserirPendencia>): Promise<Pendencia> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deletePendencia(id: number): Promise<void> {
    // Placeholder
  }

  // Fornecedores
  async getFornecedores(): Promise<Fornecedor[]> {
    return []; // Placeholder
  }

  async getFornecedor(id: number): Promise<Fornecedor | undefined> {
    return undefined; // Placeholder
  }

  async createFornecedor(fornecedor: InserirFornecedor): Promise<Fornecedor> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateFornecedor(id: number, fornecedor: Partial<InserirFornecedor>): Promise<Fornecedor> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteFornecedor(id: number): Promise<void> {
    // Placeholder
  }

  // Prestadoras
  async getPrestadoras(): Promise<Prestadora[]> {
    return []; // Placeholder
  }

  async getPrestadora(id: number): Promise<Prestadora | undefined> {
    return undefined; // Placeholder
  }

  async createPrestadora(prestadora: InserirPrestadora): Promise<Prestadora> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updatePrestadora(id: number, prestadora: Partial<InserirPrestadora>): Promise<Prestadora> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deletePrestadora(id: number): Promise<void> {
    // Placeholder
  }

  // Produtos
  async getProdutos(): Promise<Produto[]> {
    return []; // Placeholder
  }

  async getProduto(id: number): Promise<Produto | undefined> {
    return undefined; // Placeholder
  }

  async createProduto(produto: InserirProduto): Promise<Produto> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateProduto(id: number, produto: Partial<InserirProduto>): Promise<Produto> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteProduto(id: number): Promise<void> {
    // Placeholder
  }

  // Produtos OS
  async getProdutosOs(): Promise<ProdutoOs[]> {
    return []; // Placeholder
  }

  async getProdutoOs(id: number): Promise<ProdutoOs | undefined> {
    return undefined; // Placeholder
  }

  async createProdutoOs(produto: InserirProdutoOs): Promise<ProdutoOs> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateProdutoOs(id: number, produto: Partial<InserirProdutoOs>): Promise<ProdutoOs> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteProdutoOs(id: number): Promise<void> {
    // Placeholder
  }

  // Motoristas
  async getMotoristas(ordemServicoId?: number): Promise<Motorista[]> {
    return []; // Placeholder
  }

  async createMotorista(motorista: InserirMotorista): Promise<Motorista> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateMotorista(id: number, motorista: Partial<InserirMotorista>): Promise<Motorista> {
    throw new Error("Not implemented"); // Placeholder
  }

  // Documentos
  async getDocumentos(ordemServicoId: number): Promise<Documento[]> {
    return []; // Placeholder
  }

  async getDocumento(id: number): Promise<Documento | undefined> {
    return undefined; // Placeholder
  }

  async createDocumento(documento: InserirDocumento): Promise<Documento> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateDocumento(id: number, data: Partial<InserirDocumento>): Promise<Documento> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteDocumento(id: number): Promise<void> {
    // Placeholder
  }

  // Logs de Auditoria
  async getLogsAuditoria(usuarioId?: number): Promise<LogAuditoria[]> {
    return []; // Placeholder
  }

  async createLogAuditoria(log: InserirLogAuditoria): Promise<LogAuditoria> {
    throw new Error("Not implemented"); // Placeholder
  }

  // Notas Contratuais
  async getNotasContratuais(ordemServicoId?: number): Promise<NotaContratual[]> {
    return []; // Placeholder
  }

  async getNotaContratual(id: number): Promise<NotaContratual | undefined> {
    return undefined; // Placeholder
  }

  async createNotaContratual(nota: InserirNotaContratual): Promise<NotaContratual> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateNotaContratual(id: number, nota: Partial<InserirNotaContratual>): Promise<NotaContratual> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteNotaContratual(id: number): Promise<void> {
    // Placeholder
  }

  // Pagamentos Nota Contratual
  async getPagamentosNotaContratual(notaContratualId: number): Promise<PagamentoNotaContratual[]> {
    return []; // Placeholder
  }

  async createPagamentoNotaContratual(pagamento: InserirPagamentoNotaContratual): Promise<PagamentoNotaContratual> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deletePagamentoNotaContratual(id: number): Promise<void> {
    // Placeholder
  }

  // Óbitos
  async getObitos(): Promise<Obito[]> {
    return []; // Placeholder
  }

  async getObito(id: number): Promise<Obito | undefined> {
    return undefined; // Placeholder
  }

  async createObito(obito: InserirObito): Promise<Obito> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateObito(id: number, obito: Partial<InserirObito>): Promise<Obito> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteObito(id: number): Promise<void> {
    // Placeholder
  }

  // Eventos Calendário
  async getEventosCalendario(): Promise<EventoCalendario[]> {
    return []; // Placeholder
  }

  async getEventoCalendario(id: number): Promise<EventoCalendario | undefined> {
    return undefined; // Placeholder
  }

  async createEventoCalendario(evento: InserirEventoCalendario): Promise<EventoCalendario> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateEventoCalendario(id: number, evento: Partial<InserirEventoCalendario>): Promise<EventoCalendario> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteEventoCalendario(id: number): Promise<void> {
    // Placeholder
  }

  // Livro Caixa
  async getLivroCaixa(): Promise<any[]> {
    return []; // Placeholder
  }

  async createLancamentoCaixa(lancamento: any): Promise<any> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateLancamentoCaixa(id: number, lancamento: any): Promise<any> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteLancamentoCaixa(id: number): Promise<void> {
    // Placeholder
  }

  // Notas ND
  async getNotasNd(): Promise<NotaNd[]> {
    return []; // Placeholder
  }

  async getNotaNd(id: number): Promise<NotaNd | undefined> {
    return undefined; // Placeholder
  }

  async createNotaNd(nota: InserirNotaNd): Promise<NotaNd> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateNotaNd(id: number, nota: Partial<InserirNotaNd>): Promise<NotaNd> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteNotaNd(id: number): Promise<void> {
    // Placeholder
  }

  // Notas GTC
  async getNotasGtc(): Promise<NotaGtc[]> {
    return []; // Placeholder
  }

  async getNotaGtc(id: number): Promise<NotaGtc | undefined> {
    return undefined; // Placeholder
  }

  async createNotaGtc(nota: InserirNotaGtc): Promise<NotaGtc> {
    throw new Error("Not implemented"); // Placeholder
  }

  async updateNotaGtc(id: number, nota: Partial<InserirNotaGtc>): Promise<NotaGtc> {
    throw new Error("Not implemented"); // Placeholder
  }

  async deleteNotaGtc(id: number): Promise<void> {
    // Placeholder
  }
}

export const storage = new DatabaseStorage();