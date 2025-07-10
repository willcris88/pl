import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de usuários
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Tabela de ordens de serviço
export const ordensServico = pgTable("ordens_servico", {
  id: serial("id").primaryKey(),
  numeroOs: text("numero_os").notNull(),
  nomeFalecido: text("nome_falecido").notNull(),
  plano: text("plano").notNull(),
  contratante: text("contratante"),
  cpfFalecido: text("cpf_falecido"),
  cnpjContratante: text("cnpj_contratante"),
  peso: decimal("peso"),
  altura: text("altura"),
  sexo: text("sexo"),
  religiao: text("religiao"),
  dataNascimento: timestamp("data_nascimento"),
  dataFalecimento: timestamp("data_falecimento"),
  enderecoCorpo: text("endereco_corpo"),
  localVelorio: text("local_velorio"),
  enderecoSepultamento: text("endereco_sepultamento"),
  dataHoraSepultamento: timestamp("data_hora_sepultamento"),
  nomeResponsavel: text("nome_responsavel"),
  telefoneResponsavel: text("telefone_responsavel"),
  telefone2Responsavel: text("telefone2_responsavel"),
  documentoResponsavel: text("documento_responsavel"),
  grauParentesco: text("grau_parentesco"),
  sinistro: boolean("sinistro").default(false),
  descricaoServico: text("descricao_servico"),
  status: text("status").notNull().default("pendente"),
  usuarioId: integer("usuario_id").references(() => usuarios.id),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabela de contratos
export const contratos = pgTable("contratos", {
  id: serial("id").primaryKey(),
  ordemServicoId: integer("ordem_servico_id").references(() => ordensServico.id),
  observacoes: text("observacoes"),
  valorContrato: decimal("valor_contrato"),
  dataContrato: timestamp("data_contrato"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Tabela de pendências
export const pendencias = pgTable("pendencias", {
  id: serial("id").primaryKey(),
  ordemServicoId: integer("ordem_servico_id").references(() => ordensServico.id),
  tipo: text("tipo").notNull(), // Tipo da pendência (ex: FALTA DOCUMENTACAO, LIBEROU, etc.)
  status: text("status").notNull().default("PENDENTE"),
  usuario: text("usuario"),
  descricao: text("descricao"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Tabela de fornecedores
export const fornecedores = pgTable("fornecedores", {
  id: serial("id").primaryKey(),
  status: integer("status").notNull().default(0), // 0 = inativo, 1 = ativo
  nome: text("nome").notNull(),
  email: text("email"),
  telefone: text("telefone"),
  celular: text("celular"),
  responsavel: varchar("responsavel", { length: 255 }),
  cep: text("cep"),
  endereco: text("endereco"),
  bairro: varchar("bairro", { length: 255 }),
  cidade: text("cidade"),
  estado: varchar("estado", { length: 255 }),
  numeroEndereco: integer("numero_endereco").notNull().default(0),
  complemento: text("complemento"),
  dataUpdate: timestamp("data_update"),
  dataRegistro: timestamp("data_registro").defaultNow(),
  cpfCnpj: text("cpf_cnpj"),
  discriminacao: varchar("discriminacao", { length: 128 }),
  usuario: varchar("usuario", { length: 255 }),
});

// Tabela de produtos
export const produtos = pgTable("produtos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(), // Nome do produto (ex: Coroa de Flores)
  descricao: text("descricao"), // Descrição detalhada
  categoria: text("categoria"), // Categoria (ex: Flores, Urnas, etc)
  codigoInterno: varchar("codigo_interno", { length: 50 }), // Código interno do produto
  unidadeMedida: varchar("unidade_medida", { length: 20 }), // Unidade (peça, kg, etc)
  estoqueMinimo: integer("estoque_minimo"), // Estoque mínimo
  estoqueAtual: integer("estoque_atual"), // Estoque atual
  observacoes: text("observacoes"), // Observações sobre o produto
  ativo: boolean("ativo").default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow()
});

// Tabela de relacionamento produto-fornecedor (múltiplos preços)
export const produtosFornecedores = pgTable("produtos_fornecedores", {
  id: serial("id").primaryKey(),
  produtoId: integer("produto_id").references(() => produtos.id).notNull(),
  fornecedorId: integer("fornecedor_id").references(() => fornecedores.id).notNull(),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  codigoFornecedor: varchar("codigo_fornecedor", { length: 50 }), // Código do produto no fornecedor
  tempoEntrega: integer("tempo_entrega"), // Tempo de entrega em dias
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow()
});

// Tabela de produtos da ordem de serviço
export const produtosOrdemServico = pgTable("produtos_ordem_servico", {
  id: serial("id").primaryKey(),
  ordemServicoId: integer("ordem_servico_id").references(() => ordensServico.id),
  produtoId: integer("produto_id").references(() => produtos.id),
  quantidade: integer("quantidade").notNull(),
  valor: decimal("valor").notNull(),
  tipo: text("tipo").default("produto"), // produto, veiculo, servico
  nome: text("nome"), // Nome do item quando não for produto
  categoria: text("categoria"), // Categoria do item quando não for produto
  notaContratualId: integer("nota_contratual_id").references(() => notasContratuais.id), // Vinculo com nota contratual
  numeroNc: varchar("numero_nc", { length: 20 }), // Número da NC para controle visual
  disponivel: boolean("disponivel").default(true), // Se está disponível para gerar nova NC
});

// Tabela de prestadoras de serviços (separada dos fornecedores de produtos)
export const prestadoras = pgTable("prestadoras", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  // Endereço completo
  endereco: text("endereco"),
  bairro: varchar("bairro", { length: 255 }),
  cidade: varchar("cidade", { length: 255 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  numeroEndereco: varchar("numero_endereco", { length: 10 }),
  complemento: varchar("complemento", { length: 255 }),
  servicos: text("servicos"), // Descrição dos serviços oferecidos
  valorPadrao: decimal("valor_padrao", { precision: 10, scale: 2 }), // Valor padrão do serviço
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabela produtos_os - itens vinculados às ordens de serviço (produtos, veículos, serviços)
export const produtosOs = pgTable("produtos_os", {
  id: serial("id").primaryKey(),
  ordemServicoId: integer("ordem_servico_id").references(() => ordensServico.id),
  tipo: varchar("tipo", { length: 50 }).notNull(), // 'produto', 'veiculo', 'servico'
  // Para produtos e veículos
  produtoId: integer("produto_id").references(() => produtos.id),
  fornecedorId: integer("fornecedor_id").references(() => fornecedores.id),
  // Para serviços
  prestadoraId: integer("prestadora_id").references(() => prestadoras.id),
  // Dados do item
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: varchar("categoria", { length: 100 }),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).default('1'),
  valorUnitario: decimal("valor_unitario", { precision: 10, scale: 2 }),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabela de motoristas (cadastro geral de motoristas)
export const motoristas = pgTable("motoristas", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(), // Nome do motorista
  sobrenome: text("sobrenome").notNull(), // Sobrenome do motorista
  senha: text("senha").notNull(), // Senha criptografada
  telefone: text("telefone"), // Telefone do motorista
  email: text("email"), // Email do motorista
  cnh: text("cnh"), // Carteira de habilitação
  validadeCnh: timestamp("validade_cnh"), // Validade da CNH
  ativo: boolean("ativo").default(true), // Status ativo/inativo
  observacoes: text("observacoes"), // Observações adicionais
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabela de viaturas da empresa
export const viaturas = pgTable("viaturas", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  modelo: varchar("modelo", { length: 100 }).notNull(),
  placa: varchar("placa", { length: 20 }).notNull().unique(),
  cor: varchar("cor", { length: 50 }),
  ano: integer("ano"),
  km: integer("km").default(0),
  combustivel: varchar("combustivel", { length: 20 }).default("gasolina"),
  status: varchar("status", { length: 20 }).default("disponivel"), // disponivel, em_uso, manutencao
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabela de serviços de motorista
export const servicosMotorista = pgTable("servicos_motorista", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  valorPadrao: decimal("valor_padrao", { precision: 10, scale: 2 }),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabela de veículos associados a ordens de serviço (atualizada)
export const veiculosOs = pgTable("veiculos_os", {
  id: serial("id").primaryKey(),
  ordemServicoId: integer("ordem_servico_id").references(() => ordensServico.id),
  motoristaId: integer("motorista_id").references(() => motoristas.id),
  viaturaId: integer("viatura_id").references(() => viaturas.id),
  tipoServico: varchar("tipo_servico", { length: 100 }),
  enderecoRetirada: text("endereco_retirada"),
  enderecoDestino: text("endereco_destino"),
  tipoVeiculo: text("tipo_veiculo"), // Para compatibilidade com código existente
  placaVeiculo: text("placa_veiculo"), // Para compatibilidade com código existente
  observacoes: text("observacoes"),
  dataHoraChamada: timestamp("data_hora_chamada"),
  dataHoraSaida: timestamp("data_hora_saida"),
  dataHoraChegada: timestamp("data_hora_chegada"),
  valor: decimal("valor", { precision: 10, scale: 2 }),
  status: text("status").default("agendado"), // agendado, em_andamento, concluido, cancelado
  checklistSaida: boolean("checklist_saida").default(false),
  checklistChegada: boolean("checklist_chegada").default(false),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabela de fotos do checklist
export const checklistFotos = pgTable("checklist_fotos", {
  id: serial("id").primaryKey(),
  veiculoOsId: integer("veiculo_os_id").references(() => veiculosOs.id).notNull(),
  tipo: varchar("tipo", { length: 20 }).notNull(), // saida, chegada
  posicao: varchar("posicao", { length: 20 }).notNull(), // frente, tras, lateral_esquerda, lateral_direita
  nomeArquivo: varchar("nome_arquivo", { length: 255 }).notNull(),
  caminhoArquivo: varchar("caminho_arquivo", { length: 500 }).notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Tabela de documentos
export const documentos = pgTable("documentos", {
  id: serial("id").primaryKey(),
  ordemServicoId: integer("ordem_servico_id").references(() => ordensServico.id),
  nome: text("nome").notNull(),
  caminho: text("caminho").notNull(),
  tamanho: integer("tamanho"),
  tipo: text("tipo").notNull(),
  ordem: integer("ordem").default(0),
  consolidado: boolean("consolidado").default(false),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Tabela de logs de auditoria
export const logsAuditoria = pgTable("logs_auditoria", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  acao: text("acao").notNull(), // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  tabela: text("tabela").notNull(), // usuarios, ordens_servico, pendencias, etc.
  registroId: integer("registro_id"), // ID do registro afetado
  dadosAnteriores: json("dados_anteriores"), // Estado anterior para UPDATEs
  dadosNovos: json("dados_novos"), // Estado novo para CREATEs e UPDATEs
  detalhes: text("detalhes"), // Descrição textual da ação
  enderecoIp: text("endereco_ip"),
  userAgent: text("user_agent"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// Tabela para notas contratuais
export const notasContratuais = pgTable("notas_contratuais", {
  id: serial("id").primaryKey(),
  ordemServicoId: integer("ordem_servico_id").notNull().references(() => ordensServico.id),
  numeroNota: varchar("numero_nota", { length: 20 }).notNull().unique(),
  nomeContratante: varchar("nome_contratante", { length: 255 }).notNull(),
  cpfCnpjContratante: varchar("cpf_cnpj_contratante", { length: 20 }).notNull(),
  enderecoContratante: text("endereco_contratante").notNull(),
  cidadeContratante: varchar("cidade_contratante", { length: 100 }).notNull(),
  telefoneContratante: varchar("telefone_contratante", { length: 20 }),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  observacoes: text("observacoes"),
  status: varchar("status", { length: 20 }).default("pendente").notNull(), // pendente, pago, cancelado
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
});

// Tabela para pagamentos das notas contratuais
export const pagamentosNotaContratual = pgTable("pagamentos_nota_contratual", {
  id: serial("id").primaryKey(),
  notaContratualId: integer("nota_contratual_id").notNull().references(() => notasContratuais.id),
  formaPagamento: varchar("forma_pagamento", { length: 50 }).notNull(), // DINHEIRO, CARTAO, TRANSFERENCIA, PIX
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  dataPagamento: timestamp("data_pagamento").notNull(),
  operador: varchar("operador", { length: 100 }).notNull(),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// Tabela de notas ND (Nota de Débito)
export const notasNd = pgTable("notas_nd", {
  id: serial("id").primaryKey(),
  numeroProcesso: text("numero_processo").notNull(),
  nomeFalecido: text("nome_falecido").notNull(),
  contratada: text("contratada").notNull(), // Prestadora contratada
  data: text("data").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  observacoes: text("observacoes"),
  status: text("status").default("pendente"),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabela de notas GTC (Guia de Transporte de Cadáveres)
export const notasGtc = pgTable("notas_gtc", {
  id: serial("id").primaryKey(),
  numeroDeclaracao: text("numero_declaracao").notNull(),
  nomeFalecido: text("nome_falecido").notNull(),
  dataNascimento: text("data_nascimento"),
  dataFalecimento: text("data_falecimento"),
  cpfFalecido: text("cpf_falecido"),
  localFalecimento: text("local_falecimento"),
  localRetiradaObito: text("local_retirada_obito"),
  dataTransporte: text("data_transporte"),
  destinoCorpo: text("destino_corpo"),
  empresaTransportador: text("empresa_transportador"),
  cnpjTransportador: text("cnpj_transportador"),
  municipioTransportador: text("municipio_transportador"),
  agenteFunerario: text("agente_funerario"),
  rcCpfCnjAgente: text("rc_cpf_cnj_agente"),
  placaCarro: text("placa_carro"),
  modeloCarro: text("modelo_carro"),
  observacoes: text("observacoes"),
  status: text("status").default("ativo"),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabela de óbitos
export const obitos = pgTable("obitos", {
  id: serial("id").primaryKey(),
  // Informações gerais
  natimorto: text("natimorto"),
  tipo: text("tipo"),
  data: text("data"),
  
  // Campos específicos para natimorto
  idade: text("idade"),
  descIdade: text("desc_idade"),
  horaNasc: text("hora_nasc"),
  localNasc: text("local_nasc"),
  gestacao: text("gestacao"),
  duracao: text("duracao"),
  avoPaterno: text("avo_paterno"),
  avoMaterno: text("avo_materno"),
  avoPaterna: text("avo_paterna"),
  avoMaterna: text("avo_materna"),
  nomeTestemunha1: text("nome_testemunha1"),
  rgCpfCnjTestemunha1: text("rg_cpf_cnj_testemunha1"),
  idadeTestemunha1: text("idade_testemunha1"),
  enderecoTestemunha1: text("endereco_testemunha1"),
  bairroTestemunha1: text("bairro_testemunha1"),
  
  // Dados do falecido
  nome: text("nome").notNull(),
  sexo: text("sexo"),
  cor: text("cor"),
  nascimento: text("nascimento"),
  profissao: text("profissao"),
  naturalidade: text("naturalidade"),
  estadoCivil: text("estado_civil"),
  rg: text("rg"),
  cpf: text("cpf"),
  deixaBens: text("deixa_bens"),
  testamento: text("testamento"),
  cep: text("cep"),
  endereco: text("endereco"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  estado: text("estado"),
  
  // Filiação
  nomePai: text("nome_pai"),
  estadoCivilPai: text("estado_civil_pai"),
  nomeMae: text("nome_mae"),
  estadoCivilMae: text("estado_civil_mae"),
  
  // Dados cônjuge
  nomeConjuge: text("nome_conjuge"),
  
  // Informações adicionais
  filhos: text("filhos"),
  observacoes: text("observacoes"),
  
  // Dados gerais - informações do óbito
  dataFalecimento: text("data_falecimento"),
  horaFalecimento: text("hora_falecimento"),
  localFalecimento: text("local_falecimento"),
  cidadeFalecimento: text("cidade_falecimento"),
  ufFalecimento: text("uf_falecimento"),
  
  dataSepultamento: text("data_sepultamento"),
  horaSepultamento: text("hora_sepultamento"),
  localSepultamento: text("local_sepultamento"),
  cidadeSepultamento: text("cidade_sepultamento"),
  ufSepultamento: text("uf_sepultamento"),
  
  // Declaração médica
  medico1: text("medico1"),
  crm1: text("crm1"),
  medico2: text("medico2"),
  crm2: text("crm2"),
  causaMorte: text("causa_morte"),
  
  // Dados do declarante
  declarante: text("declarante"),
  rgDeclarante: text("rg_declarante"),
  cpfDeclarante: text("cpf_declarante"),
  grauParentesco: text("grau_parentesco"),
  telefoneDeclarante: text("telefone_declarante"),
  cepDeclarante: text("cep_declarante"),
  enderecoDeclarante: text("endereco_declarante"),
  bairroDeclarante: text("bairro_declarante"),
  cidadeDeclarante: text("cidade_declarante"),
  ufDeclarante: text("uf_declarante"),
  
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabela de pets
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  data: text("data"),
  agenteFunerario: text("agente_funerario"),
  numeroLacre: text("numero_lacre"),
  nome: text("nome"),
  raca: text("raca"),
  cor: text("cor"),
  peso: text("peso"),
  utilizaMarcapasso: text("utiliza_marcapasso"),
  especie: text("especie"),
  localObito: text("local_obito"),
  causaFalecimento: text("causa_falecimento"),
  crematorio: text("crematorio"),
  tipoCremacao: text("tipo_cremacao"),
  nomeTutor: text("nome_tutor"),
  cpf: text("cpf"),
  rg: text("rg"),
  cep: text("cep"),
  endereco: text("endereco"),
  telefoneCelular: text("telefone_celular"),
  telefoneFixo: text("telefone_fixo"),
  email: text("email"),
  contratante: text("contratante"),
  seguro: text("seguro"),
  numeroSinistro: text("numero_sinistro"),
  valorCobertura: text("valor_cobertura"),
  documentos: text("documentos"),
  valorPago: text("valor_pago"),
  servicoContratado: text("servico_contratado"),
  descricoes: text("descricoes"),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Tabelas do sistema de chat
export const chatMensagens = pgTable("chat_mensagens", {
  id: serial("id").primaryKey(),
  remetenteId: integer("remetente_id").references(() => usuarios.id).notNull(),
  destinatarioId: integer("destinatario_id").references(() => usuarios.id).notNull(),
  conteudo: text("conteudo").notNull(),
  lida: boolean("lida").default(false),
  criadaEm: timestamp("criada_em").defaultNow(),
});

export const chatPresenca = pgTable("chat_presenca", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull().unique(),
  online: boolean("online").default(false),
  ultimaAtividade: timestamp("ultima_atividade").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Relações
export const usuariosRelations = relations(usuarios, ({ many }) => ({
  ordensServico: many(ordensServico),
  logsAuditoria: many(logsAuditoria),
}));

export const ordensServicoRelations = relations(ordensServico, ({ one, many }) => ({
  usuario: one(usuarios, {
    fields: [ordensServico.usuarioId],
    references: [usuarios.id],
  }),
  contratos: many(contratos),
  pendencias: many(pendencias),
  produtos: many(produtosOrdemServico),
  motoristas: many(motoristas),
  documentos: many(documentos),
}));

export const contratosRelations = relations(contratos, ({ one }) => ({
  ordemServico: one(ordensServico, {
    fields: [contratos.ordemServicoId],
    references: [ordensServico.id],
  }),
}));

export const pendenciasRelations = relations(pendencias, ({ one }) => ({
  ordemServico: one(ordensServico, {
    fields: [pendencias.ordemServicoId],
    references: [ordensServico.id],
  }),
}));

export const produtosOrdemServicoRelations = relations(produtosOrdemServico, ({ one }) => ({
  ordemServico: one(ordensServico, {
    fields: [produtosOrdemServico.ordemServicoId],
    references: [ordensServico.id],
  }),
  produto: one(produtos, {
    fields: [produtosOrdemServico.produtoId],
    references: [produtos.id],
  }),
}));

export const motoristasRelations = relations(motoristas, ({ many }) => ({
  veiculosOs: many(veiculosOs),
}));

export const veiculosOsRelations = relations(veiculosOs, ({ one, many }) => ({
  ordemServico: one(ordensServico, {
    fields: [veiculosOs.ordemServicoId],
    references: [ordensServico.id],
  }),
  motorista: one(motoristas, {
    fields: [veiculosOs.motoristaId],
    references: [motoristas.id],
  }),
  viatura: one(viaturas, {
    fields: [veiculosOs.viaturaId],
    references: [viaturas.id],
  }),
  fotos: many(checklistFotos),
}));

export const documentosRelations = relations(documentos, ({ one }) => ({
  ordemServico: one(ordensServico, {
    fields: [documentos.ordemServicoId],
    references: [ordensServico.id],
  }),
}));

export const logsAuditoriaRelations = relations(logsAuditoria, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [logsAuditoria.usuarioId],
    references: [usuarios.id],
  }),
}));

// Relações de notas contratuais
export const notasContratuaisRelations = relations(notasContratuais, ({ one, many }) => ({
  ordemServico: one(ordensServico, {
    fields: [notasContratuais.ordemServicoId],
    references: [ordensServico.id],
  }),
  pagamentos: many(pagamentosNotaContratual),
}));

// Relações de pagamentos
export const pagamentosNotaContratualRelations = relations(pagamentosNotaContratual, ({ one }) => ({
  notaContratual: one(notasContratuais, {
    fields: [pagamentosNotaContratual.notaContratualId],
    references: [notasContratuais.id],
  }),
}));

// Relações de fornecedores
export const fornecedoresRelations = relations(fornecedores, ({ many }) => ({
  produtosFornecedores: many(produtosFornecedores),
}));

// Relações de produtos
export const produtosRelations = relations(produtos, ({ many }) => ({
  fornecedores: many(produtosFornecedores),
  ordensServico: many(produtosOrdemServico),
}));

// Relações de produtos-fornecedores
export const produtosFornecedoresRelations = relations(produtosFornecedores, ({ one }) => ({
  produto: one(produtos, {
    fields: [produtosFornecedores.produtoId],
    references: [produtos.id],
  }),
  fornecedor: one(fornecedores, {
    fields: [produtosFornecedores.fornecedorId],
    references: [fornecedores.id],
  }),
}));

// Schemas de inserção
export const inserirUsuarioSchema = createInsertSchema(usuarios).omit({
  id: true,
  criadoEm: true,
});

export const inserirOrdemServicoSchema = createInsertSchema(ordensServico).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
}).extend({
  dataNascimento: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  dataFalecimento: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  dataHoraSepultamento: z.string().optional().transform((str) => str ? new Date(str) : undefined),
});

export const inserirContratoSchema = createInsertSchema(contratos).omit({
  id: true,
  criadoEm: true,
});

export const inserirPendenciaSchema = createInsertSchema(pendencias).omit({
  id: true,
  criadoEm: true,
});

export const inserirFornecedorSchema = createInsertSchema(fornecedores).omit({
  id: true,
  dataRegistro: true,
});

export const inserirProdutoSchema = createInsertSchema(produtos).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export const inserirProdutoFornecedorSchema = createInsertSchema(produtosFornecedores).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export const inserirPrestadoraSchema = createInsertSchema(prestadoras).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export const inserirProdutoOsSchema = createInsertSchema(produtosOs).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export const inserirMotoristaSchema = createInsertSchema(motoristas).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export const inserirVeiculoOsSchema = createInsertSchema(veiculosOs).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export const inserirDocumentoSchema = createInsertSchema(documentos).omit({
  id: true,
  criadoEm: true,
});

export const inserirLogAuditoriaSchema = createInsertSchema(logsAuditoria).omit({
  id: true,
  criadoEm: true,
});

export const inserirNotaContratualSchema = createInsertSchema(notasContratuais).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export const inserirPagamentoNotaContratualSchema = createInsertSchema(pagamentosNotaContratual).omit({
  id: true,
  criadoEm: true,
});

// Schemas das novas tabelas - Notas ND e GTC
export const inserirNotaNdSchema = createInsertSchema(notasNd).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export const inserirNotaGtcSchema = createInsertSchema(notasGtc).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

// Tipos
export type Usuario = typeof usuarios.$inferSelect;
export type InserirUsuario = z.infer<typeof inserirUsuarioSchema>;
export type OrdemServico = typeof ordensServico.$inferSelect;
export type InserirOrdemServico = z.infer<typeof inserirOrdemServicoSchema>;
export type Contrato = typeof contratos.$inferSelect;
export type InserirContrato = z.infer<typeof inserirContratoSchema>;
export type Pendencia = typeof pendencias.$inferSelect;
export type InserirPendencia = z.infer<typeof inserirPendenciaSchema>;
export type Fornecedor = typeof fornecedores.$inferSelect;
export type InserirFornecedor = z.infer<typeof inserirFornecedorSchema>;
export type Prestadora = typeof prestadoras.$inferSelect;
export type InserirPrestadora = z.infer<typeof inserirPrestadoraSchema>;
export type Produto = typeof produtos.$inferSelect;
export type InserirProduto = z.infer<typeof inserirProdutoSchema>;
export type ProdutoFornecedor = typeof produtosFornecedores.$inferSelect;
export type InserirProdutoFornecedor = z.infer<typeof inserirProdutoFornecedorSchema>;
export type ProdutoOs = typeof produtosOs.$inferSelect;
export type InserirProdutoOs = z.infer<typeof inserirProdutoOsSchema>;
export type Motorista = typeof motoristas.$inferSelect;
export type InserirMotorista = z.infer<typeof inserirMotoristaSchema>;
export type VeiculoOs = typeof veiculosOs.$inferSelect;
export type InserirVeiculoOs = z.infer<typeof inserirVeiculoOsSchema>;
export type Documento = typeof documentos.$inferSelect;
export type InserirDocumento = z.infer<typeof inserirDocumentoSchema>;
export type LogAuditoria = typeof logsAuditoria.$inferSelect;
export type InserirLogAuditoria = z.infer<typeof inserirLogAuditoriaSchema>;

// Tipos das novas tabelas - Notas ND e GTC
export type NotaNd = typeof notasNd.$inferSelect;
export type InserirNotaNd = z.infer<typeof inserirNotaNdSchema>;
export type NotaGtc = typeof notasGtc.$inferSelect;
export type InserirNotaGtc = z.infer<typeof inserirNotaGtcSchema>;

// Schemas de óbitos
export const inserirObitoSchema = createInsertSchema(obitos).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export type Obito = typeof obitos.$inferSelect;
export type InserirObito = z.infer<typeof inserirObitoSchema>;

// Schemas de pets
export const inserirPetSchema = createInsertSchema(pets).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export type Pet = typeof pets.$inferSelect;
export type InserirPet = z.infer<typeof inserirPetSchema>;

// Schemas de serviços de motorista
export const inserirServicoMotoristaSchema = createInsertSchema(servicosMotorista).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export type ServicoMotorista = typeof servicosMotorista.$inferSelect;
export type InserirServicoMotorista = z.infer<typeof inserirServicoMotoristaSchema>;

// ===== CALENDÁRIO PESSOAL =====
export const eventosCalendario = pgTable("eventos_calendario", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").notNull().references(() => usuarios.id),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  descricao: text("descricao"),
  dataInicio: varchar("data_inicio", { length: 10 }).notNull(),
  horaInicio: varchar("hora_inicio", { length: 5 }),
  dataFim: varchar("data_fim", { length: 10 }),
  horaFim: varchar("hora_fim", { length: 5 }),
  diaInteiro: boolean("dia_inteiro").default(false),
  tipoEvento: varchar("tipo_evento", { length: 50 }).default('pessoal'),
  prioridade: varchar("prioridade", { length: 20 }).default('normal'),
  status: varchar("status", { length: 20 }).default('pendente'),
  localizacao: varchar("localizacao", { length: 200 }),
  participantes: text("participantes"),
  lembrete: boolean("lembrete").default(false),
  minutosLembrete: integer("minutos_lembrete").default(15),
  recorrencia: varchar("recorrencia", { length: 50 }),
  cor: varchar("cor", { length: 7 }).default('#3b82f6'),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow()
});

export const inserirEventoCalendarioSchema = createInsertSchema(eventosCalendario).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export type EventoCalendario = typeof eventosCalendario.$inferSelect;
export type InserirEventoCalendario = z.infer<typeof inserirEventoCalendarioSchema>;

// Compatibilidade com o blueprint de auth
export const users = usuarios;
export const insertUserSchema = inserirUsuarioSchema.extend({
  username: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
}).pick({
  username: true,
  password: true,
  nome: true,
}).extend({
  email: z.string().email("Email inválido").optional(),
});
export type User = Usuario & { username?: string; password?: string };
export type InsertUser = z.infer<typeof insertUserSchema>;

// Relações das novas tabelas - viaturas e checklist
export const viaturasRelations = relations(viaturas, ({ many }) => ({
  veiculosOs: many(veiculosOs),
}));

export const checklistFotosRelations = relations(checklistFotos, ({ one }) => ({
  veiculoOs: one(veiculosOs, {
    fields: [checklistFotos.veiculoOsId],
    references: [veiculosOs.id],
  }),
}));

// Schemas das novas tabelas
export const inserirViaturaSchema = createInsertSchema(viaturas).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

// ===== SISTEMA DE CHAT INTERNO =====

// Tabela de mensagens do chat
export const mensagensChat = pgTable("mensagens_chat", {
  id: serial("id").primaryKey(),
  remetenteId: integer("remetente_id").references(() => usuarios.id).notNull(),
  destinatarioId: integer("destinatario_id").references(() => usuarios.id).notNull(),
  conteudo: text("conteudo").notNull(),
  lida: boolean("lida").notNull().default(false),
  criadaEm: timestamp("criada_em").defaultNow(),
});

// Tabela de usuários online (status de conexão)
export const usuariosOnline = pgTable("usuarios_online", {
  usuarioId: integer("usuario_id").references(() => usuarios.id).primaryKey(),
  ultimaAtividade: timestamp("ultima_atividade").defaultNow(),
});

// Relações do chat
export const mensagensChatRelations = relations(mensagensChat, ({ one }) => ({
  remetente: one(usuarios, {
    fields: [mensagensChat.remetenteId],
    references: [usuarios.id],
  }),
  destinatario: one(usuarios, {
    fields: [mensagensChat.destinatarioId],
    references: [usuarios.id],
  }),
}));

export const usuariosOnlineRelations = relations(usuariosOnline, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [usuariosOnline.usuarioId],
    references: [usuarios.id],
  }),
}));

// Schemas do chat
export const inserirMensagemChatSchema = createInsertSchema(mensagensChat).omit({
  id: true,
  criadaEm: true,
});

export const inserirUsuarioOnlineSchema = createInsertSchema(usuariosOnline);

// Tipos do chat
export type MensagemChat = typeof mensagensChat.$inferSelect;
export type InserirMensagemChat = z.infer<typeof inserirMensagemChatSchema>;
export type UsuarioOnline = typeof usuariosOnline.$inferSelect;
export type InserirUsuarioOnline = z.infer<typeof inserirUsuarioOnlineSchema>;

export const inserirChecklistFotoSchema = createInsertSchema(checklistFotos).omit({
  id: true,
  criadoEm: true,
});

// Tipos das novas tabelas
export type Viatura = typeof viaturas.$inferSelect;
export type InserirViatura = z.infer<typeof inserirViaturaSchema>;
export type ChecklistFoto = typeof checklistFotos.$inferSelect;
export type InserirChecklistFoto = z.infer<typeof inserirChecklistFotoSchema>;

// Tabela de livro caixa - transações financeiras
export const livroCaixa = pgTable("livro_caixa", {
  id: serial("id").primaryKey(),
  numeroLancamento: text("numero_lancamento").notNull().unique(), // Número sequencial do lançamento
  data: timestamp("data").notNull().defaultNow(),
  tipo: text("tipo").notNull(), // "entrada" ou "saida"
  categoria: text("categoria").notNull(), // Categoria da transação
  subcategoria: text("subcategoria"), // Subcategoria da transação
  descricao: text("descricao").notNull(), // Descrição detalhada
  valor: decimal("valor", { precision: 12, scale: 2 }).notNull(), // Valor da transação
  formaPagamento: text("forma_pagamento").notNull(), // DINHEIRO, PIX, CARTAO_DEBITO, CARTAO_CREDITO, TRANSFERENCIA_BANCARIA, CHEQUE, BOLETO
  
  // Dados do pagador/recebedor
  nomeContato: text("nome_contato"),
  cpfCnpjContato: text("cpf_cnpj_contato"),
  telefoneContato: text("telefone_contato"),
  emailContato: text("email_contato"),
  
  // Dados bancários (se aplicável)
  banco: text("banco"),
  agencia: text("agencia"),
  conta: text("conta"),
  numeroDocumento: text("numero_documento"), // Número do cheque, boleto, etc.
  
  // Relacionamentos
  ordemServicoId: integer("ordem_servico_id").references(() => ordensServico.id),
  notaContratualId: integer("nota_contratual_id").references(() => notasContratuais.id),
  fornecedorId: integer("fornecedor_id").references(() => fornecedores.id),
  prestadoraId: integer("prestadora_id").references(() => prestadoras.id),
  
  // Dados de controle
  status: text("status").default("confirmado"), // pendente, confirmado, cancelado
  observacoes: text("observacoes"),
  numeroComprovante: text("numero_comprovante"), // Número do comprovante/recibo
  
  // Dados de auditoria
  usuarioId: integer("usuario_id").references(() => usuarios.id).notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// Relações do livro caixa
export const livroCaixaRelations = relations(livroCaixa, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [livroCaixa.usuarioId],
    references: [usuarios.id],
  }),
  ordemServico: one(ordensServico, {
    fields: [livroCaixa.ordemServicoId],
    references: [ordensServico.id],
  }),
  notaContratual: one(notasContratuais, {
    fields: [livroCaixa.notaContratualId],
    references: [notasContratuais.id],
  }),
  fornecedor: one(fornecedores, {
    fields: [livroCaixa.fornecedorId],
    references: [fornecedores.id],
  }),
  prestadora: one(prestadoras, {
    fields: [livroCaixa.prestadoraId],
    references: [prestadoras.id],
  }),
}));

// Schemas do livro caixa
export const inserirLivroCaixaSchema = createInsertSchema(livroCaixa).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export type LivroCaixa = typeof livroCaixa.$inferSelect;
export type InserirLivroCaixa = z.infer<typeof inserirLivroCaixaSchema>;



export type NotaContratual = typeof notasContratuais.$inferSelect;
export type InserirNotaContratual = z.infer<typeof inserirNotaContratualSchema>;
export type PagamentoNotaContratual = typeof pagamentosNotaContratual.$inferSelect;
export type InserirPagamentoNotaContratual = z.infer<typeof inserirPagamentoNotaContratualSchema>;

// ===== TABELA MOTORISTAS ORDEM SERVICO =====
export const motoristas_ordem_servico = pgTable('motoristas_ordem_servico', {
  id: serial('id').primaryKey(),
  ordemServicoId: integer('ordem_servico_id').references(() => ordensServico.id, { onDelete: 'cascade' }).notNull(),
  motoristaId: integer('motorista_id').references(() => motoristas.id, { onDelete: 'cascade' }).notNull(),
  veiculoProdutoId: integer('veiculo_produto_id').references(() => produtosOrdemServico.id, { onDelete: 'cascade' }),
  horaSaida: timestamp('hora_saida'),
  horaChegada: timestamp('hora_chegada'),
  status: varchar('status', { length: 50 }).default('em_andamento'),
  observacoes: text('observacoes'),
  // Novos campos para informações do serviço
  dataServico: varchar('data_servico', { length: 20 }),
  horaServico: varchar('hora_servico', { length: 10 }),
  localOrigem: text('local_origem'),
  localDestino: text('local_destino'),
  tipoVeiculo: varchar('tipo_veiculo', { length: 255 }),
  criadoEm: timestamp('criado_em').defaultNow(),
  atualizadoEm: timestamp('atualizado_em').defaultNow()
});

export const inserirMotoristasOrdemServicoSchema = createInsertSchema(motoristas_ordem_servico).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export type SelectMotoristasOrdemServico = typeof motoristas_ordem_servico.$inferSelect;
export type InserirMotoristasOrdemServico = z.infer<typeof inserirMotoristasOrdemServicoSchema>;

// ===== TABELAS PARA SISTEMA MOTORISTA =====

// Tabela de veículos
export const veiculos = pgTable("veiculos", {
  id: serial("id").primaryKey(),
  placa: varchar("placa", { length: 10 }).notNull().unique(),
  modelo: varchar("modelo", { length: 100 }).notNull(),
  marca: varchar("marca", { length: 50 }).notNull(),
  ano: integer("ano").notNull(),
  cor: varchar("cor", { length: 30 }),
  chassi: varchar("chassi", { length: 50 }),
  renavam: varchar("renavam", { length: 20 }),
  combustivel: varchar("combustivel", { length: 20 }),
  capacidade: integer("capacidade"), // Número de passageiros
  categoria: varchar("categoria", { length: 30 }).notNull(), // funeraria, ambulancia, transporte
  ativo: boolean("ativo").default(true).notNull(),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
});

// Tabela de checklist de saída
export const checklist_saida = pgTable("checklist_saida", {
  id: serial("id").primaryKey(),
  motoristaOrdemServicoId: integer("motorista_ordem_servico_id").references(() => motoristas_ordem_servico.id, { onDelete: "cascade" }).notNull(),
  placaVeiculo: varchar("placa_veiculo", { length: 10 }).notNull(),
  foto1Path: text("foto1_path").notNull(), // Foto frontal do veículo
  foto2Path: text("foto2_path").notNull(), // Foto traseira do veículo
  foto3Path: text("foto3_path").notNull(), // Foto lateral direita
  foto4Path: text("foto4_path").notNull(), // Foto lateral esquerda
  observacoesSaida: text("observacoes_saida"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// Tabela de checklist de chegada
export const checklist_chegada = pgTable("checklist_chegada", {
  id: serial("id").primaryKey(),
  motoristaOrdemServicoId: integer("motorista_ordem_servico_id").references(() => motoristas_ordem_servico.id, { onDelete: "cascade" }).notNull(),
  foto1Path: text("foto1_path").notNull(), // Foto frontal do veículo na chegada
  foto2Path: text("foto2_path").notNull(), // Foto traseira do veículo na chegada
  foto3Path: text("foto3_path").notNull(), // Foto lateral direita na chegada
  foto4Path: text("foto4_path").notNull(), // Foto lateral esquerda na chegada
  observacoesChegada: text("observacoes_chegada"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// Schemas para as novas tabelas
export const inserirVeiculoSchema = createInsertSchema(veiculos).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export const inserirChecklistSaidaSchema = createInsertSchema(checklist_saida).omit({
  id: true,
  criadoEm: true,
});

export const inserirChecklistChegadaSchema = createInsertSchema(checklist_chegada).omit({
  id: true,
  criadoEm: true,
});

// Tipos das novas tabelas
export type Veiculo = typeof veiculos.$inferSelect;
export type InserirVeiculo = z.infer<typeof inserirVeiculoSchema>;
export type ChecklistSaida = typeof checklist_saida.$inferSelect;
export type InserirChecklistSaida = z.infer<typeof inserirChecklistSaidaSchema>;
export type ChecklistChegada = typeof checklist_chegada.$inferSelect;
export type InserirChecklistChegada = z.infer<typeof inserirChecklistChegadaSchema>;

// Schemas e tipos de chat
export const inserirChatMensagemSchema = createInsertSchema(chatMensagens).omit({
  id: true,
  criadaEm: true,
});

export const inserirChatPresencaSchema = createInsertSchema(chatPresenca).omit({
  id: true,
  ultimaAtividade: true,
  atualizadoEm: true,
});

export type ChatMensagem = typeof chatMensagens.$inferSelect;
export type InserirChatMensagem = z.infer<typeof inserirChatMensagemSchema>;
export type ChatPresenca = typeof chatPresenca.$inferSelect;
export type InserirChatPresenca = z.infer<typeof inserirChatPresencaSchema>;
