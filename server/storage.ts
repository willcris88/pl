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
import { db, pool } from "./db";
import { eq, desc, like, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

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
    // Configuração do store de sessões baseada no ambiente
    const sessionStoreType = process.env.SESSION_STORE || 'postgresql';
    
    if (sessionStoreType === 'postgresql') {
      this.sessionStore = new PostgresSessionStore({ 
        pool, 
        createTableIfMissing: true 
      });
    } else {
      // Para desenvolvimento ou casos específicos, usa MemoryStore
      const MemoryStore = require('memorystore')(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // Limpa sessões expiradas a cada 24h
      });
    }
  }

  // Usuários
  async getUsuarios(): Promise<Usuario[]> {
    const usersList = await pool.query('SELECT id, email, nome, ativo, criado_em FROM usuarios ORDER BY nome');
    return usersList.rows.map(row => ({
      id: row.id,
      email: row.email,
      nome: row.nome,
      ativo: row.ativo,
      senha: '', // Não retornar senha
      criadoEm: row.criado_em
    }));
  }

  async getUser(id: number): Promise<Usuario | undefined> {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async getUserByUsername(username: string): Promise<Usuario | undefined> {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [username]);
    return result.rows[0] || undefined;
  }

  async getUserByEmail(email: string): Promise<Usuario | undefined> {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return result.rows[0] || undefined;
  }

  async createUser(user: InserirUsuario): Promise<Usuario> {
    const result = await pool.query(
      'INSERT INTO usuarios (email, senha, nome, ativo) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.email, user.senha, user.nome, user.ativo || true]
    );
    return result.rows[0];
  }

  // Ordens de Serviço
  async getOrdemServico(id: number): Promise<OrdemServico | undefined> {
    const result = await pool.query('SELECT * FROM ordens_servico WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async getOrdensServico(filtros?: any): Promise<OrdemServico[]> {
    let query = 'SELECT * FROM ordens_servico';
    const params: any[] = [];

    if (filtros?.numeroOs) {
      query += ' WHERE numero_os ILIKE $1';
      params.push(`%${filtros.numeroOs}%`);
    } else if (filtros?.nomeFalecido) {
      query += ' WHERE nome_falecido ILIKE $1';
      params.push(`%${filtros.nomeFalecido}%`);
    }

    query += ' ORDER BY criado_em DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  async createOrdemServico(ordem: InserirOrdemServico): Promise<OrdemServico> {
    const result = await pool.query(
      `INSERT INTO ordens_servico 
       (numero_os, nome_falecido, plano, contratante, cpf_falecido, cnpj_contratante, 
        peso, altura, sexo, religiao, data_nascimento, data_falecimento, endereco_corpo, 
        local_velorio, endereco_sepultamento, data_hora_sepultamento, nome_responsavel, 
        telefone_responsavel, telefone2_responsavel, documento_responsavel, grau_parentesco, 
        sinistro, descricao_servico, status, usuario_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) 
       RETURNING *`,
      [
        ordem.numeroOs, ordem.nomeFalecido, ordem.plano, ordem.contratante,
        ordem.cpfFalecido, ordem.cnpjContratante, ordem.peso, ordem.altura,
        ordem.sexo, ordem.religiao, ordem.dataNascimento, ordem.dataFalecimento,
        ordem.enderecoCorpo, ordem.localVelorio, ordem.enderecoSepultamento,
        ordem.dataHoraSepultamento, ordem.nomeResponsavel, ordem.telefoneResponsavel,
        ordem.telefone2Responsavel, ordem.documentoResponsavel, ordem.grauParentesco,
        ordem.sinistro, ordem.descricaoServico, ordem.status, ordem.usuarioId
      ]
    );
    return result.rows[0];
  }

  async updateOrdemServico(id: number, ordem: Partial<InserirOrdemServico>): Promise<OrdemServico> {
    const fields = Object.keys(ordem).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(ordem);
    
    const result = await pool.query(
      `UPDATE ordens_servico SET ${fields}, atualizado_em = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteOrdemServico(id: number): Promise<void> {
    await pool.query('DELETE FROM ordens_servico WHERE id = $1', [id]);
  }

  // Contratos
  async getContratos(ordemServicoId: number): Promise<Contrato[]> {
    const result = await pool.query('SELECT * FROM contratos WHERE ordem_servico_id = $1', [ordemServicoId]);
    return result.rows;
  }

  async createContrato(contrato: InserirContrato): Promise<Contrato> {
    const result = await pool.query(
      'INSERT INTO contratos (ordem_servico_id, observacoes, valor_contrato, data_contrato) VALUES ($1, $2, $3, $4) RETURNING *',
      [contrato.ordemServicoId, contrato.observacoes, contrato.valorContrato, contrato.dataContrato]
    );
    return result.rows[0];
  }

  async updateContrato(id: number, contrato: Partial<InserirContrato>): Promise<Contrato> {
    const fields = Object.keys(contrato).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(contrato);
    
    const result = await pool.query(
      `UPDATE contratos SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  // Pendências
  async getPendencias(ordemServicoId: number): Promise<Pendencia[]> {
    const result = await pool.query(
      'SELECT * FROM pendencias WHERE ordem_servico_id = $1 ORDER BY criado_em DESC',
      [ordemServicoId]
    );
    return result.rows.map(row => ({
      id: row.id,
      ordemServicoId: row.ordem_servico_id,
      tipo: row.tipo,
      status: row.status,
      usuario: row.usuario,
      descricao: row.descricao,
      criadoEm: row.criado_em
    }));
  }

  async createPendencia(pendencia: InserirPendencia): Promise<Pendencia> {
    const result = await pool.query(
      'INSERT INTO pendencias (ordem_servico_id, tipo, status, usuario, descricao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [pendencia.ordemServicoId, pendencia.tipo, pendencia.status, pendencia.usuario, pendencia.descricao]
    );
    return result.rows[0];
  }

  async updatePendencia(id: number, pendencia: Partial<InserirPendencia>): Promise<Pendencia> {
    const fields = Object.keys(pendencia).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(pendencia);
    
    const result = await pool.query(
      `UPDATE pendencias SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deletePendencia(id: number): Promise<void> {
    await pool.query('DELETE FROM pendencias WHERE id = $1', [id]);
  }

  // Fornecedores
  async getFornecedores(): Promise<Fornecedor[]> {
    const result = await pool.query('SELECT * FROM fornecedores ORDER BY nome');
    return result.rows;
  }

  async getFornecedor(id: number): Promise<Fornecedor | undefined> {
    const result = await pool.query('SELECT * FROM fornecedores WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createFornecedor(fornecedor: InserirFornecedor): Promise<Fornecedor> {
    const result = await pool.query(
      `INSERT INTO fornecedores 
       (status, nome, email, telefone, celular, responsavel, cep, endereco, 
        bairro, cidade, estado, numero_endereco, complemento, cpf_cnpj, 
        discriminacao, usuario) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
       RETURNING *`,
      [
        fornecedor.status, fornecedor.nome, fornecedor.email, fornecedor.telefone,
        fornecedor.celular, fornecedor.responsavel, fornecedor.cep, fornecedor.endereco,
        fornecedor.bairro, fornecedor.cidade, fornecedor.estado, fornecedor.numeroEndereco,
        fornecedor.complemento, fornecedor.cpfCnpj, fornecedor.discriminacao, fornecedor.usuario
      ]
    );
    return result.rows[0];
  }

  async updateFornecedor(id: number, fornecedor: Partial<InserirFornecedor>): Promise<Fornecedor> {
    const fields = Object.keys(fornecedor).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(fornecedor);
    
    const result = await pool.query(
      `UPDATE fornecedores SET ${fields}, data_update = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteFornecedor(id: number): Promise<void> {
    await pool.query('DELETE FROM fornecedores WHERE id = $1', [id]);
  }

  // Prestadoras
  async getPrestadoras(): Promise<Prestadora[]> {
    const result = await pool.query('SELECT * FROM prestadoras ORDER BY nome');
    return result.rows;
  }

  async getPrestadora(id: number): Promise<Prestadora | undefined> {
    const result = await pool.query('SELECT * FROM prestadoras WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createPrestadora(prestadora: InserirPrestadora): Promise<Prestadora> {
    const result = await pool.query(
      'INSERT INTO prestadoras (nome, cnpj, endereco, telefone, email, contato) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [prestadora.nome, prestadora.cnpj, prestadora.endereco, prestadora.telefone, prestadora.email, prestadora.contato]
    );
    return result.rows[0];
  }

  async updatePrestadora(id: number, prestadora: Partial<InserirPrestadora>): Promise<Prestadora> {
    const fields = Object.keys(prestadora).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(prestadora);
    
    const result = await pool.query(
      `UPDATE prestadoras SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deletePrestadora(id: number): Promise<void> {
    await pool.query('DELETE FROM prestadoras WHERE id = $1', [id]);
  }

  // Produtos
  async getProdutos(): Promise<Produto[]> {
    const result = await pool.query('SELECT * FROM produtos ORDER BY nome');
    return result.rows;
  }

  async getProduto(id: number): Promise<Produto | undefined> {
    const result = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createProduto(produto: InserirProduto): Promise<Produto> {
    const result = await pool.query(
      `INSERT INTO produtos 
       (nome, descricao, categoria, codigo_interno, unidade_medida, estoque_minimo, 
        estoque_atual, preco_compra, preco_venda, fornecedor_id, observacoes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        produto.nome, produto.descricao, produto.categoria, produto.codigoInterno,
        produto.unidadeMedida, produto.estoqueMinimo, produto.estoqueAtual,
        produto.precoCompra, produto.precoVenda, produto.fornecedorId, produto.observacoes
      ]
    );
    return result.rows[0];
  }

  async updateProduto(id: number, produto: Partial<InserirProduto>): Promise<Produto> {
    const fields = Object.keys(produto).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(produto);
    
    const result = await pool.query(
      `UPDATE produtos SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteProduto(id: number): Promise<void> {
    await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
  }

  // Produtos OS
  async getProdutosOs(): Promise<ProdutoOs[]> {
    const result = await pool.query('SELECT * FROM produtos_os ORDER BY nome');
    return result.rows;
  }

  async getProdutoOs(id: number): Promise<ProdutoOs | undefined> {
    const result = await pool.query('SELECT * FROM produtos_os WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createProdutoOs(produto: InserirProdutoOs): Promise<ProdutoOs> {
    const result = await pool.query(
      'INSERT INTO produtos_os (nome, categoria, preco_unitario, descricao) VALUES ($1, $2, $3, $4) RETURNING *',
      [produto.nome, produto.categoria, produto.precoUnitario, produto.descricao]
    );
    return result.rows[0];
  }

  async updateProdutoOs(id: number, produto: Partial<InserirProdutoOs>): Promise<ProdutoOs> {
    const fields = Object.keys(produto).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(produto);
    
    const result = await pool.query(
      `UPDATE produtos_os SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteProdutoOs(id: number): Promise<void> {
    await pool.query('DELETE FROM produtos_os WHERE id = $1', [id]);
  }

  // Motoristas
  async getMotoristas(ordemServicoId?: number): Promise<Motorista[]> {
    let query = 'SELECT * FROM motoristas';
    const params: any[] = [];

    if (ordemServicoId) {
      query += ' WHERE ordem_servico_id = $1';
      params.push(ordemServicoId);
    }

    query += ' ORDER BY nome';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  async createMotorista(motorista: InserirMotorista): Promise<Motorista> {
    const result = await pool.query(
      'INSERT INTO motoristas (nome, cnh, telefone, email, ordem_servico_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [motorista.nome, motorista.cnh, motorista.telefone, motorista.email, motorista.ordemServicoId]
    );
    return result.rows[0];
  }

  async updateMotorista(id: number, motorista: Partial<InserirMotorista>): Promise<Motorista> {
    const fields = Object.keys(motorista).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(motorista);
    
    const result = await pool.query(
      `UPDATE motoristas SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  // Documentos
  async getDocumentos(ordemServicoId: number): Promise<Documento[]> {
    const result = await pool.query('SELECT * FROM documentos WHERE ordem_servico_id = $1', [ordemServicoId]);
    return result.rows;
  }

  async getDocumento(id: number): Promise<Documento | undefined> {
    const result = await pool.query('SELECT * FROM documentos WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createDocumento(documento: InserirDocumento): Promise<Documento> {
    const result = await pool.query(
      'INSERT INTO documentos (nome, caminho, tipo, tamanho, ordem_servico_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [documento.nome, documento.caminho, documento.tipo, documento.tamanho, documento.ordemServicoId]
    );
    return result.rows[0];
  }

  async updateDocumento(id: number, data: Partial<InserirDocumento>): Promise<Documento> {
    const fields = Object.keys(data).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(data);
    
    const result = await pool.query(
      `UPDATE documentos SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteDocumento(id: number): Promise<void> {
    await pool.query('DELETE FROM documentos WHERE id = $1', [id]);
  }

  // Logs de Auditoria
  async getLogsAuditoria(usuarioId?: number): Promise<LogAuditoria[]> {
    let query = 'SELECT * FROM logs_auditoria';
    const params: any[] = [];

    if (usuarioId) {
      query += ' WHERE usuario_id = $1';
      params.push(usuarioId);
    }

    query += ' ORDER BY criado_em DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  async createLogAuditoria(log: InserirLogAuditoria): Promise<LogAuditoria> {
    const result = await pool.query(
      `INSERT INTO logs_auditoria 
       (acao, tabela, registro_id, usuario_id, dados_anteriores, dados_novos, 
        ip_address, user_agent, detalhes_adicionais) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        log.acao, log.tabela, log.registroId, log.usuarioId, 
        log.dadosAnteriores, log.dadosNovos, log.ipAddress, 
        log.userAgent, log.detalhesAdicionais
      ]
    );
    return result.rows[0];
  }

  // Notas Contratuais
  async getNotasContratuais(ordemServicoId?: number): Promise<NotaContratual[]> {
    let query = 'SELECT * FROM notas_contratuais';
    const params: any[] = [];

    if (ordemServicoId) {
      query += ' WHERE ordem_servico_id = $1';
      params.push(ordemServicoId);
    }

    query += ' ORDER BY criado_em DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  async getNotaContratual(id: number): Promise<NotaContratual | undefined> {
    const result = await pool.query('SELECT * FROM notas_contratuais WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createNotaContratual(nota: InserirNotaContratual): Promise<NotaContratual> {
    const result = await pool.query(
      `INSERT INTO notas_contratuais 
       (ordem_servico_id, numero_nc, valor_total, data_vencimento, status, 
        observacoes, contratante_nome, contratante_documento) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        nota.ordemServicoId, nota.numeroNc, nota.valorTotal, nota.dataVencimento,
        nota.status, nota.observacoes, nota.contratanteNome, nota.contratanteDocumento
      ]
    );
    return result.rows[0];
  }

  async updateNotaContratual(id: number, nota: Partial<InserirNotaContratual>): Promise<NotaContratual> {
    const fields = Object.keys(nota).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(nota);
    
    const result = await pool.query(
      `UPDATE notas_contratuais SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteNotaContratual(id: number): Promise<void> {
    await pool.query('DELETE FROM notas_contratuais WHERE id = $1', [id]);
  }

  // Pagamentos Nota Contratual
  async getPagamentosNotaContratual(notaContratualId: number): Promise<PagamentoNotaContratual[]> {
    const result = await pool.query('SELECT * FROM pagamentos_nota_contratual WHERE nota_contratual_id = $1', [notaContratualId]);
    return result.rows;
  }

  async createPagamentoNotaContratual(pagamento: InserirPagamentoNotaContratual): Promise<PagamentoNotaContratual> {
    const result = await pool.query(
      `INSERT INTO pagamentos_nota_contratual 
       (nota_contratual_id, valor_pagamento, data_pagamento, forma_pagamento, 
        observacoes, recibo_numero) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        pagamento.notaContratualId, pagamento.valorPagamento, pagamento.dataPagamento,
        pagamento.formaPagamento, pagamento.observacoes, pagamento.reciboNumero
      ]
    );
    return result.rows[0];
  }

  async deletePagamentoNotaContratual(id: number): Promise<void> {
    await pool.query('DELETE FROM pagamentos_nota_contratual WHERE id = $1', [id]);
  }

  // Óbitos
  async getObitos(): Promise<Obito[]> {
    const result = await pool.query('SELECT * FROM obitos ORDER BY criado_em DESC');
    return result.rows;
  }

  async getObito(id: number): Promise<Obito | undefined> {
    const result = await pool.query('SELECT * FROM obitos WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createObito(obito: InserirObito): Promise<Obito> {
    const result = await pool.query(
      `INSERT INTO obitos 
       (nome, sexo, cor_raca, estado_civil, profissao, data_nascimento, 
        naturalidade, nome_pai, nome_mae, rg, cpf, deixa_bens, testamento, 
        nome_conjuge, filhos, endereco, bairro, cidade, uf, cep, observacoes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) 
       RETURNING *`,
      [
        obito.nome, obito.sexo, obito.corRaca, obito.estadoCivil, obito.profissao,
        obito.dataNascimento, obito.naturalidade, obito.nomePai, obito.nomeMae,
        obito.rg, obito.cpf, obito.deixaBens, obito.testamento, obito.nomeConjuge,
        obito.filhos, obito.endereco, obito.bairro, obito.cidade, obito.uf,
        obito.cep, obito.observacoes
      ]
    );
    return result.rows[0];
  }

  async updateObito(id: number, obito: Partial<InserirObito>): Promise<Obito> {
    const fields = Object.keys(obito).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(obito);
    
    const result = await pool.query(
      `UPDATE obitos SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteObito(id: number): Promise<void> {
    await pool.query('DELETE FROM obitos WHERE id = $1', [id]);
  }

  // Eventos Calendário
  async getEventosCalendario(): Promise<EventoCalendario[]> {
    const result = await pool.query('SELECT * FROM eventos_calendario ORDER BY data_inicio, hora_inicio');
    return result.rows;
  }

  async getEventoCalendario(id: number): Promise<EventoCalendario | undefined> {
    const result = await pool.query('SELECT * FROM eventos_calendario WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createEventoCalendario(evento: InserirEventoCalendario): Promise<EventoCalendario> {
    const result = await pool.query(
      `INSERT INTO eventos_calendario 
       (titulo, descricao, data_inicio, hora_inicio, hora_fim, usuario_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [evento.titulo, evento.descricao, evento.dataInicio, evento.horaInicio, evento.horaFim, evento.usuarioId]
    );
    return result.rows[0];
  }

  async updateEventoCalendario(id: number, evento: Partial<InserirEventoCalendario>): Promise<EventoCalendario> {
    const fields = Object.keys(evento).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(evento);
    
    const result = await pool.query(
      `UPDATE eventos_calendario SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteEventoCalendario(id: number): Promise<void> {
    await pool.query('DELETE FROM eventos_calendario WHERE id = $1', [id]);
  }

  // Livro Caixa
  async getLivroCaixa(): Promise<any[]> {
    const result = await pool.query(`
      SELECT * FROM livro_caixa 
      ORDER BY data_lancamento DESC, criado_em DESC
    `);
    return result.rows;
  }

  async createLancamentoCaixa(lancamento: any): Promise<any> {
    const result = await pool.query(
      `INSERT INTO livro_caixa 
       (data_lancamento, tipo_lancamento, categoria, descricao, valor, 
        forma_pagamento, numero_documento, observacoes, usuario_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        lancamento.dataLancamento, lancamento.tipoLancamento, lancamento.categoria,
        lancamento.descricao, lancamento.valor, lancamento.formaPagamento,
        lancamento.numeroDocumento, lancamento.observacoes, lancamento.usuarioId
      ]
    );
    return result.rows[0];
  }

  async updateLancamentoCaixa(id: number, lancamento: any): Promise<any> {
    const fields = Object.keys(lancamento).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(lancamento);
    
    const result = await pool.query(
      `UPDATE livro_caixa SET ${fields}, atualizado_em = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteLancamentoCaixa(id: number): Promise<void> {
    await pool.query('DELETE FROM livro_caixa WHERE id = $1', [id]);
  }

  // Notas ND
  async getNotasNd(): Promise<NotaNd[]> {
    const result = await pool.query('SELECT * FROM notas_nd ORDER BY criado_em DESC');
    return result.rows;
  }

  async getNotaNd(id: number): Promise<NotaNd | undefined> {
    const result = await pool.query('SELECT * FROM notas_nd WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createNotaNd(nota: InserirNotaNd): Promise<NotaNd> {
    const result = await pool.query(
      `INSERT INTO notas_nd 
       (numero_processo, nome_falecido, contratada, data, valor, observacoes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [nota.numeroProcesso, nota.nomeFalecido, nota.contratada, nota.data, nota.valor, nota.observacoes, nota.status || 'pendente']
    );
    return result.rows[0];
  }

  async updateNotaNd(id: number, nota: Partial<InserirNotaNd>): Promise<NotaNd> {
    const fields = Object.keys(nota).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(nota);
    
    const result = await pool.query(
      `UPDATE notas_nd SET ${fields}, atualizado_em = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteNotaNd(id: number): Promise<void> {
    await pool.query('DELETE FROM notas_nd WHERE id = $1', [id]);
  }

  // Notas GTC
  async getNotasGtc(): Promise<NotaGtc[]> {
    const result = await pool.query('SELECT * FROM notas_gtc ORDER BY criado_em DESC');
    return result.rows;
  }

  async getNotaGtc(id: number): Promise<NotaGtc | undefined> {
    const result = await pool.query('SELECT * FROM notas_gtc WHERE id = $1', [id]);
    return result.rows[0] || undefined;
  }

  async createNotaGtc(nota: InserirNotaGtc): Promise<NotaGtc> {
    const result = await pool.query(
      `INSERT INTO notas_gtc 
       (numero_declaracao, nome_falecido, data_nascimento, data_falecimento, cpf_falecido, 
        local_falecimento, local_retirada_obito, data_transporte, destino_corpo, 
        empresa_transportador, cnpj_transportador, municipio_transportador, 
        agente_funerario, rc_cpf_cnj_agente, placa_carro, modelo_carro, observacoes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
       RETURNING *`,
      [
        nota.numeroDeclaracao, nota.nomeFalecido, nota.dataNascimento, nota.dataFalecimento,
        nota.cpfFalecido, nota.localFalecimento, nota.localRetiradaObito, nota.dataTransporte,
        nota.destinoCorpo, nota.empresaTransportador, nota.cnpjTransportador,
        nota.municipioTransportador, nota.agenteFunerario, nota.rcCpfCnjAgente,
        nota.placaCarro, nota.modeloCarro, nota.observacoes, nota.status
      ]
    );
    return result.rows[0];
  }

  async updateNotaGtc(id: number, nota: Partial<InserirNotaGtc>): Promise<NotaGtc> {
    const fields = Object.keys(nota).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(nota);
    
    const result = await pool.query(
      `UPDATE notas_gtc SET ${fields}, atualizado_em = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async deleteNotaGtc(id: number): Promise<void> {
    await pool.query('DELETE FROM notas_gtc WHERE id = $1', [id]);
  }
}

export const storage = new DatabaseStorage();