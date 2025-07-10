CREATE TABLE "checklist_fotos" (
	"id" serial PRIMARY KEY NOT NULL,
	"veiculo_os_id" integer NOT NULL,
	"tipo" varchar(20) NOT NULL,
	"posicao" varchar(20) NOT NULL,
	"nome_arquivo" varchar(255) NOT NULL,
	"caminho_arquivo" varchar(500) NOT NULL,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contratos" (
	"id" serial PRIMARY KEY NOT NULL,
	"ordem_servico_id" integer,
	"observacoes" text,
	"valor_contrato" numeric,
	"data_contrato" timestamp,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"ordem_servico_id" integer,
	"nome" text NOT NULL,
	"caminho" text NOT NULL,
	"tamanho" integer,
	"tipo" text NOT NULL,
	"ordem" integer DEFAULT 0,
	"consolidado" boolean DEFAULT false,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "eventos_calendario" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"titulo" varchar(200) NOT NULL,
	"descricao" text,
	"data_inicio" varchar(10) NOT NULL,
	"hora_inicio" varchar(5),
	"data_fim" varchar(10),
	"hora_fim" varchar(5),
	"dia_inteiro" boolean DEFAULT false,
	"tipo_evento" varchar(50) DEFAULT 'pessoal',
	"prioridade" varchar(20) DEFAULT 'normal',
	"status" varchar(20) DEFAULT 'pendente',
	"localizacao" varchar(200),
	"participantes" text,
	"lembrete" boolean DEFAULT false,
	"minutos_lembrete" integer DEFAULT 15,
	"recorrencia" varchar(50),
	"cor" varchar(7) DEFAULT '#3b82f6',
	"observacoes" text,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fornecedores" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" integer DEFAULT 0 NOT NULL,
	"nome" text NOT NULL,
	"email" text,
	"telefone" text,
	"celular" text,
	"responsavel" varchar(255),
	"cep" text,
	"endereco" text,
	"bairro" varchar(255),
	"cidade" text,
	"estado" varchar(255),
	"numero_endereco" integer DEFAULT 0 NOT NULL,
	"complemento" text,
	"data_update" timestamp,
	"data_registro" timestamp DEFAULT now(),
	"cpf_cnpj" text,
	"discriminacao" varchar(128),
	"usuario" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "logs_auditoria" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"acao" text NOT NULL,
	"tabela" text NOT NULL,
	"registro_id" integer,
	"dados_anteriores" json,
	"dados_novos" json,
	"detalhes" text,
	"endereco_ip" text,
	"user_agent" text,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "motoristas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"sobrenome" text NOT NULL,
	"senha" text NOT NULL,
	"telefone" text,
	"email" text,
	"cnh" text,
	"validade_cnh" timestamp,
	"ativo" boolean DEFAULT true,
	"observacoes" text,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notas_contratuais" (
	"id" serial PRIMARY KEY NOT NULL,
	"ordem_servico_id" integer NOT NULL,
	"numero_nota" varchar(20) NOT NULL,
	"nome_contratante" varchar(255) NOT NULL,
	"cpf_cnpj_contratante" varchar(20) NOT NULL,
	"endereco_contratante" text NOT NULL,
	"cidade_contratante" varchar(100) NOT NULL,
	"telefone_contratante" varchar(20),
	"valor_total" numeric(10, 2) NOT NULL,
	"observacoes" text,
	"status" varchar(20) DEFAULT 'pendente' NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notas_contratuais_numero_nota_unique" UNIQUE("numero_nota")
);
--> statement-breakpoint
CREATE TABLE "obitos" (
	"id" serial PRIMARY KEY NOT NULL,
	"natimorto" text,
	"tipo" text,
	"data" text,
	"idade" text,
	"desc_idade" text,
	"hora_nasc" text,
	"local_nasc" text,
	"gestacao" text,
	"duracao" text,
	"avo_paterno" text,
	"avo_materno" text,
	"avo_paterna" text,
	"avo_materna" text,
	"nome_testemunha1" text,
	"rg_cpf_cnj_testemunha1" text,
	"idade_testemunha1" text,
	"endereco_testemunha1" text,
	"bairro_testemunha1" text,
	"nome" text NOT NULL,
	"sexo" text,
	"cor" text,
	"nascimento" text,
	"profissao" text,
	"naturalidade" text,
	"estado_civil" text,
	"rg" text,
	"cpf" text,
	"deixa_bens" text,
	"testamento" text,
	"cep" text,
	"endereco" text,
	"bairro" text,
	"cidade" text,
	"estado" text,
	"nome_pai" text,
	"estado_civil_pai" text,
	"nome_mae" text,
	"estado_civil_mae" text,
	"nome_conjuge" text,
	"filhos" text,
	"observacoes" text,
	"data_falecimento" text,
	"hora_falecimento" text,
	"local_falecimento" text,
	"cidade_falecimento" text,
	"uf_falecimento" text,
	"data_sepultamento" text,
	"hora_sepultamento" text,
	"local_sepultamento" text,
	"cidade_sepultamento" text,
	"uf_sepultamento" text,
	"medico1" text,
	"crm1" text,
	"medico2" text,
	"crm2" text,
	"causa_morte" text,
	"declarante" text,
	"rg_declarante" text,
	"cpf_declarante" text,
	"grau_parentesco" text,
	"telefone_declarante" text,
	"cep_declarante" text,
	"endereco_declarante" text,
	"bairro_declarante" text,
	"cidade_declarante" text,
	"uf_declarante" text,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ordens_servico" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero_os" text NOT NULL,
	"nome_falecido" text NOT NULL,
	"plano" text NOT NULL,
	"contratante" text,
	"cpf_falecido" text,
	"cnpj_contratante" text,
	"peso" numeric,
	"altura" text,
	"sexo" text,
	"religiao" text,
	"data_nascimento" timestamp,
	"data_falecimento" timestamp,
	"endereco_corpo" text,
	"local_velorio" text,
	"endereco_sepultamento" text,
	"data_hora_sepultamento" timestamp,
	"nome_responsavel" text,
	"telefone_responsavel" text,
	"telefone2_responsavel" text,
	"documento_responsavel" text,
	"grau_parentesco" text,
	"sinistro" boolean DEFAULT false,
	"descricao_servico" text,
	"status" text DEFAULT 'pendente' NOT NULL,
	"usuario_id" integer,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pagamentos_nota_contratual" (
	"id" serial PRIMARY KEY NOT NULL,
	"nota_contratual_id" integer NOT NULL,
	"forma_pagamento" varchar(50) NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"data_pagamento" timestamp NOT NULL,
	"operador" varchar(100) NOT NULL,
	"observacoes" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pendencias" (
	"id" serial PRIMARY KEY NOT NULL,
	"ordem_servico_id" integer,
	"tipo" text NOT NULL,
	"status" text DEFAULT 'PENDENTE' NOT NULL,
	"usuario" text,
	"descricao" text,
	"criado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prestadoras" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(255) NOT NULL,
	"cnpj" varchar(18),
	"telefone" varchar(20),
	"email" varchar(255),
	"endereco" text,
	"bairro" varchar(255),
	"cidade" varchar(255),
	"estado" varchar(2),
	"cep" varchar(10),
	"numero_endereco" varchar(10),
	"complemento" varchar(255),
	"servicos" text,
	"valor_padrao" numeric(10, 2),
	"observacoes" text,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "produtos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"categoria" text,
	"codigo_interno" varchar(50),
	"unidade_medida" varchar(20),
	"estoque_minimo" integer,
	"estoque_atual" integer,
	"observacoes" text,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "produtos_fornecedores" (
	"id" serial PRIMARY KEY NOT NULL,
	"produto_id" integer NOT NULL,
	"fornecedor_id" integer NOT NULL,
	"preco" numeric(10, 2) NOT NULL,
	"codigo_fornecedor" varchar(50),
	"tempo_entrega" integer,
	"observacoes" text,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "produtos_ordem_servico" (
	"id" serial PRIMARY KEY NOT NULL,
	"ordem_servico_id" integer,
	"produto_id" integer,
	"quantidade" integer NOT NULL,
	"valor" numeric NOT NULL,
	"tipo" text DEFAULT 'produto',
	"nome" text,
	"categoria" text,
	"nota_contratual_id" integer,
	"numero_nc" varchar(20),
	"disponivel" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "produtos_os" (
	"id" serial PRIMARY KEY NOT NULL,
	"ordem_servico_id" integer,
	"tipo" varchar(50) NOT NULL,
	"produto_id" integer,
	"fornecedor_id" integer,
	"prestadora_id" integer,
	"nome" varchar(255) NOT NULL,
	"descricao" text,
	"categoria" varchar(100),
	"quantidade" numeric(10, 2) DEFAULT '1',
	"valor_unitario" numeric(10, 2),
	"valor_total" numeric(10, 2),
	"observacoes" text,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"senha" text NOT NULL,
	"nome" text NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now(),
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "veiculos_os" (
	"id" serial PRIMARY KEY NOT NULL,
	"ordem_servico_id" integer,
	"motorista_id" integer,
	"viatura_id" integer,
	"tipo_servico" varchar(100),
	"endereco_retirada" text,
	"endereco_destino" text,
	"tipo_veiculo" text,
	"placa_veiculo" text,
	"observacoes" text,
	"data_hora_chamada" timestamp,
	"data_hora_saida" timestamp,
	"data_hora_chegada" timestamp,
	"valor" numeric(10, 2),
	"status" text DEFAULT 'agendado',
	"checklist_saida" boolean DEFAULT false,
	"checklist_chegada" boolean DEFAULT false,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "viaturas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(100) NOT NULL,
	"modelo" varchar(100) NOT NULL,
	"placa" varchar(20) NOT NULL,
	"cor" varchar(50),
	"ano" integer,
	"km" integer DEFAULT 0,
	"combustivel" varchar(20) DEFAULT 'gasolina',
	"status" varchar(20) DEFAULT 'disponivel',
	"observacoes" text,
	"ativo" boolean DEFAULT true,
	"criado_em" timestamp DEFAULT now(),
	"atualizado_em" timestamp DEFAULT now(),
	CONSTRAINT "viaturas_placa_unique" UNIQUE("placa")
);
--> statement-breakpoint
ALTER TABLE "checklist_fotos" ADD CONSTRAINT "checklist_fotos_veiculo_os_id_veiculos_os_id_fk" FOREIGN KEY ("veiculo_os_id") REFERENCES "public"."veiculos_os"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_ordem_servico_id_ordens_servico_id_fk" FOREIGN KEY ("ordem_servico_id") REFERENCES "public"."ordens_servico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_ordem_servico_id_ordens_servico_id_fk" FOREIGN KEY ("ordem_servico_id") REFERENCES "public"."ordens_servico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_calendario" ADD CONSTRAINT "eventos_calendario_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notas_contratuais" ADD CONSTRAINT "notas_contratuais_ordem_servico_id_ordens_servico_id_fk" FOREIGN KEY ("ordem_servico_id") REFERENCES "public"."ordens_servico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos_nota_contratual" ADD CONSTRAINT "pagamentos_nota_contratual_nota_contratual_id_notas_contratuais_id_fk" FOREIGN KEY ("nota_contratual_id") REFERENCES "public"."notas_contratuais"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pendencias" ADD CONSTRAINT "pendencias_ordem_servico_id_ordens_servico_id_fk" FOREIGN KEY ("ordem_servico_id") REFERENCES "public"."ordens_servico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos_fornecedores" ADD CONSTRAINT "produtos_fornecedores_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos_fornecedores" ADD CONSTRAINT "produtos_fornecedores_fornecedor_id_fornecedores_id_fk" FOREIGN KEY ("fornecedor_id") REFERENCES "public"."fornecedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos_ordem_servico" ADD CONSTRAINT "produtos_ordem_servico_ordem_servico_id_ordens_servico_id_fk" FOREIGN KEY ("ordem_servico_id") REFERENCES "public"."ordens_servico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos_ordem_servico" ADD CONSTRAINT "produtos_ordem_servico_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos_ordem_servico" ADD CONSTRAINT "produtos_ordem_servico_nota_contratual_id_notas_contratuais_id_fk" FOREIGN KEY ("nota_contratual_id") REFERENCES "public"."notas_contratuais"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos_os" ADD CONSTRAINT "produtos_os_ordem_servico_id_ordens_servico_id_fk" FOREIGN KEY ("ordem_servico_id") REFERENCES "public"."ordens_servico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos_os" ADD CONSTRAINT "produtos_os_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos_os" ADD CONSTRAINT "produtos_os_fornecedor_id_fornecedores_id_fk" FOREIGN KEY ("fornecedor_id") REFERENCES "public"."fornecedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produtos_os" ADD CONSTRAINT "produtos_os_prestadora_id_prestadoras_id_fk" FOREIGN KEY ("prestadora_id") REFERENCES "public"."prestadoras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veiculos_os" ADD CONSTRAINT "veiculos_os_ordem_servico_id_ordens_servico_id_fk" FOREIGN KEY ("ordem_servico_id") REFERENCES "public"."ordens_servico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veiculos_os" ADD CONSTRAINT "veiculos_os_motorista_id_motoristas_id_fk" FOREIGN KEY ("motorista_id") REFERENCES "public"."motoristas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veiculos_os" ADD CONSTRAINT "veiculos_os_viatura_id_viaturas_id_fk" FOREIGN KEY ("viatura_id") REFERENCES "public"."viaturas"("id") ON DELETE no action ON UPDATE no action;