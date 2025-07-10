-- ================================================
-- BACKUP COMPLETO DO BANCO DE DADOS
-- Gerado em: 10/07/2025, 04:54:55
-- Sistema: Funerária Central de Barueri
-- ================================================

-- Configurações MySQL
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- ================================================
-- TABELA: chat_mensagens
-- ================================================

-- Estrutura da tabela chat_mensagens
-- Colunas: id (integer), remetente_id (integer), destinatario_id (integer), conteudo (text), lida (boolean), criada_em (timestamp without time zone)

TRUNCATE TABLE `chat_mensagens`;

INSERT INTO `chat_mensagens` (`id`, `remetente_id`, `destinatario_id`, `conteudo`, `lida`, `criada_em`) VALUES
(1, 3, 3, 'oi', 0, '2025-07-09 22:10:40'),
(2, 3, 1, 'oi', 0, '2025-07-09 22:10:50'),
(3, 1, 3, 'oi', 0, '2025-07-09 22:12:51'),
(4, 1, 3, 'tudo bem', 0, '2025-07-09 22:15:14'),
(5, 3, 1, 'tudo e vv', 0, '2025-07-09 22:18:40'),
(6, 1, 3, 'agora funciono', 0, '2025-07-09 22:18:53'),
(7, 1, 3, 'agora funciono', 0, '2025-07-09 22:18:53'),
(8, 3, 1, 'erro aki', 0, '2025-07-09 22:19:07'),
(9, 3, 1, 'cehgo aki', 0, '2025-07-09 22:19:37'),
(10, 1, 3, 'rsrs', 0, '2025-07-09 22:19:49'),
(11, 1, 3, 'oi', 0, '2025-07-09 22:27:09'),
(12, 3, 1, 'fala ai', 0, '2025-07-09 22:27:27'),
(13, 3, 1, 'que pega', 0, '2025-07-09 22:27:33'),
(14, 3, 1, 'nada nao', 0, '2025-07-09 22:27:38'),
(15, 3, 1, 'rsrs', 0, '2025-07-09 22:27:44'),
(16, 3, 1, 'rsrs', 0, '2025-07-09 22:27:54'),
(17, 3, 1, 'oi', 0, '2025-07-09 22:32:55'),
(18, 3, 1, 'oi mandei agora', 0, '2025-07-09 22:33:17'),
(19, 3, 1, 'oi', 0, '2025-07-09 22:34:53'),
(20, 3, 1, 'çç', 0, '2025-07-09 22:37:28'),
(21, 3, 1, 'lllllllllllllllllll', 0, '2025-07-09 22:37:34'),
(22, 3, 1, 'oi', 0, '2025-07-09 22:37:58'),
(23, 3, 1, 'hhhh', 0, '2025-07-09 22:38:16'),
(24, 3, 1, 'hhhhh', 0, '2025-07-09 22:38:19'),
(25, 3, 1, 'oi', 0, '2025-07-09 22:40:11'),
(26, 3, 1, 'kkkkkkkk', 0, '2025-07-09 22:40:39'),
(27, 3, 1, 'klhllç', 0, '2025-07-09 22:40:49'),
(28, 3, 1, 'lkçlçlk~ç4ç~lç~4', 0, '2025-07-09 22:40:54'),
(29, 3, 1, 'ççlçç', 0, '2025-07-09 22:40:57'),
(30, 3, 1, 'oi]', 0, '2025-07-09 22:43:32'),
(31, 3, 1, 'fafaf', 0, '2025-07-09 22:43:43'),
(32, 3, 1, 'kkkkkk', 0, '2025-07-09 22:44:04'),
(33, 3, 1, 'llllllllllllllllllll', 0, '2025-07-09 22:44:07'),
(34, 3, 1, 'fff', 0, '2025-07-09 22:44:14'),
(35, 3, 1, 'kkk', 0, '2025-07-09 22:45:33'),
(36, 3, 1, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 0, '2025-07-09 22:45:36'),
(37, 3, 1, 'kk', 0, '2025-07-09 22:45:56'),
(38, 3, 1, 'ppp', 0, '2025-07-09 22:46:00'),
(39, 3, 1, 'oi', 0, '2025-07-09 22:48:02'),
(40, 1, 3, 'ooo', 0, '2025-07-09 22:48:10'),
(41, 3, 1, 'kkkk', 0, '2025-07-09 22:48:14'),
(42, 3, 1, 'kkkkkkkk', 0, '2025-07-09 22:48:24'),
(43, 3, 1, 'kkkkkkkkkkkkkk', 0, '2025-07-09 22:50:27'),
(44, 1, 3, 'iiii', 0, '2025-07-09 22:50:36'),
(45, 3, 1, 'kkkkkkkkkkk', 0, '2025-07-09 22:50:41'),
(46, 3, 1, 'oi', 0, '2025-07-09 22:53:30'),
(47, 3, 1, 'oi', 0, '2025-07-09 22:55:15'),
(48, 3, 1, 'mesma coisa', 0, '2025-07-09 22:55:20'),
(49, 3, 1, 'toma no cu', 0, '2025-07-09 22:58:53'),
(50, 3, 1, 'essa merda nao funciona', 0, '2025-07-09 22:59:01'),
(51, 3, 1, 'merdaaaaaaaaaaaaaaaaaaaaaaaaaaa', 0, '2025-07-09 22:59:13'),
(52, 3, 1, 'oi', 0, '2025-07-09 23:00:30'),
(53, 3, 1, 'mesma coisa', 0, '2025-07-09 23:00:48'),
(54, 3, 1, 'kk', 0, '2025-07-09 23:01:52'),
(55, 3, 1, 'ffddffddf', 0, '2025-07-09 23:02:03'),
(56, 3, 1, 'oi', 0, '2025-07-09 23:02:06'),
(57, 3, 1, ']vamos de teste', 0, '2025-07-09 23:02:10'),
(58, 3, 1, 'kk', 0, '2025-07-09 23:02:12'),
(59, 3, 1, 'kk', 0, '2025-07-09 23:02:13'),
(60, 3, 1, 'kk', 0, '2025-07-09 23:02:13'),
(61, 3, 1, 'kk', 0, '2025-07-09 23:02:14'),
(62, 3, 1, 'kk', 0, '2025-07-09 23:02:15'),
(63, 3, 1, 'kk', 0, '2025-07-09 23:02:15'),
(64, 3, 1, 'funcioono', 0, '2025-07-09 23:02:19'),
(65, 3, 1, 'kkk', 0, '2025-07-09 23:08:20'),
(66, 1, 3, 'oi', 0, '2025-07-09 23:08:29'),
(67, 1, 3, 'llll4', 0, '2025-07-09 23:08:37'),
(68, 3, 1, 'oi', 0, '2025-07-09 23:08:43');

-- ================================================
-- TABELA: chat_presenca
-- ================================================

-- Estrutura da tabela chat_presenca
-- Colunas: id (integer), usuario_id (integer), online (boolean), ultima_atividade (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `chat_presenca`;

INSERT INTO `chat_presenca` (`id`, `usuario_id`, `online`, `ultima_atividade`, `atualizado_em`) VALUES
(1, 3, 1, '2025-07-10 04:54:53', '2025-07-10 04:54:53'),
(2, 1, 0, '2025-07-09 23:13:08', '2025-07-09 23:13:08');

-- ================================================
-- TABELA: checklist_chegada
-- ================================================

-- Estrutura da tabela checklist_chegada
-- Colunas: id (integer), motorista_ordem_servico_id (integer), foto1_path (text), foto2_path (text), foto3_path (text), foto4_path (text), observacoes_chegada (text), criado_em (timestamp without time zone)

TRUNCATE TABLE `checklist_chegada`;

INSERT INTO `checklist_chegada` (`id`, `motorista_ordem_servico_id`, `foto1_path`, `foto2_path`, `foto3_path`, `foto4_path`, `observacoes_chegada`, `criado_em`) VALUES
(2, 4, '1752007952034-765926201-Captura de tela 2025-07-08 154137.png', '1752007952034-588356648-Captura de tela 2025-07-08 160929.png', '1752007952035-808681800-Captura de tela 2025-07-08 173649.png', '1752007952105-922938432-Captura de tela 2025-07-08 173659.png', NULL, '2025-07-08 20:52:32'),
(3, 5, '1752009484931-667481102-Captura de tela 2025-07-08 173649.png', '1752009484932-491805986-Captura de tela 2025-07-08 173659.png', '1752009484981-386233534-Captura de tela 2025-07-08 175621.png', '1752009484988-991362439-Captura de tela 2025-07-08 175629.png', NULL, '2025-07-08 21:18:05');

-- ================================================
-- TABELA: checklist_fotos
-- ================================================

-- Estrutura da tabela checklist_fotos
-- Colunas: id (integer), veiculo_os_id (integer), tipo (character varying), posicao (character varying), nome_arquivo (character varying), caminho_arquivo (character varying), criado_em (timestamp without time zone)

-- Tabela checklist_fotos está vazia

-- ================================================
-- TABELA: checklist_saida
-- ================================================

-- Estrutura da tabela checklist_saida
-- Colunas: id (integer), motorista_ordem_servico_id (integer), placa_veiculo (character varying), foto1_path (text), foto2_path (text), foto3_path (text), foto4_path (text), observacoes_saida (text), criado_em (timestamp without time zone)

TRUNCATE TABLE `checklist_saida`;

INSERT INTO `checklist_saida` (`id`, `motorista_ordem_servico_id`, `placa_veiculo`, `foto1_path`, `foto2_path`, `foto3_path`, `foto4_path`, `observacoes_saida`, `criado_em`) VALUES
(8, 4, 'GHI9012', '1752005995193-112657713-Captura de tela 2025-07-08 142540.png', '1752005995408-484269192-Captura de tela 2025-07-08 145635.png', '1752005995410-546869031-Captura de tela 2025-07-08 154137.png', '1752005995410-302583306-Captura de tela 2025-07-08 160929.png', NULL, '2025-07-08 20:19:55'),
(9, 4, 'GHI9012', '1752005995950-229807852-Captura de tela 2025-07-08 142540.png', '1752005996022-743422245-Captura de tela 2025-07-08 145635.png', '1752005996175-527335287-Captura de tela 2025-07-08 154137.png', '1752005996175-638908458-Captura de tela 2025-07-08 160929.png', NULL, '2025-07-08 20:19:56'),
(10, 4, 'DEF5678', '1752006771535-917063581-Captura de tela 2025-07-08 033132.png', '1752006771536-165712895-Captura de tela 2025-07-08 133702.png', '1752006771536-621740982-Captura de tela 2025-07-08 141422.png', '1752006771588-383167129-Captura de tela 2025-07-08 141646.png', NULL, '2025-07-08 20:32:51'),
(13, 5, 'MNO7890', '1752009197619-17359543-Captura de tela 2025-07-08 173649.png', '1752009197620-849376689-Captura de tela 2025-07-08 173659.png', '1752009197621-358869973-Captura de tela 2025-07-08 175621.png', '1752009197622-236714809-Captura de tela 2025-07-08 175629.png', NULL, '2025-07-08 21:13:17');

-- ================================================
-- TABELA: contratos
-- ================================================

-- Estrutura da tabela contratos
-- Colunas: id (integer), ordem_servico_id (integer), observacoes (text), valor_contrato (numeric), data_contrato (timestamp without time zone), criado_em (timestamp without time zone)

TRUNCATE TABLE `contratos`;

INSERT INTO `contratos` (`id`, `ordem_servico_id`, `observacoes`, `valor_contrato`, `data_contrato`, `criado_em`) VALUES
(1, 1, 'Contrato padrão para plano familiar básico. Inclui velório de 24h, urna simples e sepultamento.', 2500.00, '2025-01-05 10:30:00', '2025-07-08 15:23:05'),
(2, 2, 'Contrato premium com serviços especiais. Inclui flores importadas, urna de madeira nobre e velório diferenciado.', 4200.00, '2025-01-06 15:45:00', '2025-07-08 15:23:05'),
(3, 3, 'Contrato básico conforme plano pré-pago. Serviços essenciais inclusos.', 1800.00, '2025-01-07 09:15:00', '2025-07-08 15:23:05');

-- ================================================
-- TABELA: documentos
-- ================================================

-- Estrutura da tabela documentos
-- Colunas: id (integer), ordem_servico_id (integer), nome (text), caminho (text), tamanho (integer), tipo (text), ordem (integer), consolidado (boolean), criado_em (timestamp without time zone)

TRUNCATE TABLE `documentos`;

INSERT INTO `documentos` (`id`, `ordem_servico_id`, `nome`, `caminho`, `tamanho`, `tipo`, `ordem`, `consolidado`, `criado_em`) VALUES
(1, 2, 'Captura de tela 2025-07-08 173649.pdf', 'pdf_1752014481513_Captura de tela 2025-07-08 173649.pdf', 28422, '.pdf', 0, 0, '2025-07-08 22:41:21');

-- ================================================
-- TABELA: eventos_calendario
-- ================================================

-- Estrutura da tabela eventos_calendario
-- Colunas: id (integer), usuario_id (integer), titulo (character varying), descricao (text), data_inicio (character varying), hora_inicio (character varying), data_fim (character varying), hora_fim (character varying), dia_inteiro (boolean), tipo_evento (character varying), prioridade (character varying), status (character varying), localizacao (character varying), participantes (text), lembrete (boolean), minutos_lembrete (integer), recorrencia (character varying), cor (character varying), observacoes (text), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `eventos_calendario`;

INSERT INTO `eventos_calendario` (`id`, `usuario_id`, `titulo`, `descricao`, `data_inicio`, `hora_inicio`, `data_fim`, `hora_fim`, `dia_inteiro`, `tipo_evento`, `prioridade`, `status`, `localizacao`, `participantes`, `lembrete`, `minutos_lembrete`, `recorrencia`, `cor`, `observacoes`, `criado_em`, `atualizado_em`) VALUES
(1, 2, 'Velório - Maria da Silva Santos', 'Velório da Sra. Maria da Silva Santos na Capela São José', '2025-01-07', '08:00', '2025-01-07', '13:00', 0, 'trabalho', 'alta', 'confirmado', 'Capela São José - Rua das Flores, 123', 'João Santos Silva, família', 1, 30, NULL, '#3B82F6', 'Velório programado para manhã toda', '2025-07-08 15:23:46', '2025-07-08 15:23:46'),
(2, 2, 'Sepultamento - Maria da Silva Santos', 'Cerimônia de sepultamento no Cemitério da Paz', '2025-01-07', '14:00', '2025-01-07', '15:30', 0, 'trabalho', 'alta', 'confirmado', 'Cemitério da Paz - Vila Nova', 'Família Santos', 1, 15, NULL, '#EF4444', 'Sepultamento após o velório', '2025-07-08 15:23:46', '2025-07-08 15:23:46'),
(3, 2, 'Preparação - José Carlos Oliveira', 'Preparação do corpo para velório premium', '2025-01-08', '09:00', '2025-01-08', '12:00', 0, 'trabalho', 'normal', 'pendente', 'Sede da Funerária', 'Equipe técnica', 0, 15, NULL, '#10B981', 'Preparação especial conforme solicitação da família', '2025-07-08 15:23:46', '2025-07-08 15:23:46'),
(4, 2, 'Reunião Mensal Equipe', 'Reunião mensal de alinhamento da equipe', '2025-01-15', '14:00', '2025-01-15', '16:00', 0, 'reuniao', 'normal', 'agendado', 'Sala de Reuniões', 'Toda equipe', 1, 60, 'mensal', '#8B5CF6', 'Discussão de processos e melhorias', '2025-07-08 15:23:46', '2025-07-08 15:23:46');

-- ================================================
-- TABELA: fornecedores
-- ================================================

-- Estrutura da tabela fornecedores
-- Colunas: id (integer), status (integer), nome (text), email (text), telefone (text), celular (text), responsavel (character varying), cep (text), endereco (text), bairro (character varying), cidade (text), estado (character varying), numero_endereco (integer), complemento (text), data_update (timestamp without time zone), data_registro (timestamp without time zone), cpf_cnpj (text), discriminacao (character varying), usuario (character varying)

TRUNCATE TABLE `fornecedores`;

INSERT INTO `fornecedores` (`id`, `status`, `nome`, `email`, `telefone`, `celular`, `responsavel`, `cep`, `endereco`, `bairro`, `cidade`, `estado`, `numero_endereco`, `complemento`, `data_update`, `data_registro`, `cpf_cnpj`, `discriminacao`, `usuario`) VALUES
(1, 1, 'Flores Eternas Ltda', 'contato@floreseternas.com.br', '(11) 3456-7890', '(11) 98765-4321', 'Maria Silva', '01234-567', 'Rua das Flores', 'Centro', 'São Paulo', 'SP', 123, 'Sala 10', NULL, '2025-07-08 15:21:07', '12.345.678/0001-90', 'Fornecedor de flores e arranjos', 'admin'),
(2, 1, 'Urnas & Cia', 'vendas@urnasecia.com.br', '(11) 2345-6789', '(11) 97654-3210', 'João Santos', '02345-678', 'Av. dos Artesãos', 'Industrial', 'São Paulo', 'SP', 456, NULL, NULL, '2025-07-08 15:21:07', '23.456.789/0001-01', 'Fabricante de urnas funerárias', 'admin'),
(3, 1, 'Transportes Dignidade', 'logistica@dignidade.com.br', '(11) 3567-8901', '(11) 96543-2109', 'Carlos Oliveira', '03456-789', 'Rua do Comércio', 'Vila Nova', 'São Paulo', 'SP', 789, 'Galpão 5', NULL, '2025-07-08 15:21:07', '34.567.890/0001-12', 'Serviços de transporte funerário', 'admin'),
(4, 1, 'Velas Sagradas', 'pedidos@velassagradas.com.br', '(11) 4567-8902', '(11) 95432-1098', 'Ana Costa', '04567-890', 'Rua da Paz', 'Jardim São José', 'São Paulo', 'SP', 321, NULL, NULL, '2025-07-08 15:21:07', '45.678.901/0001-23', 'Fabricante de velas e artigos religiosos', 'admin');

-- ================================================
-- TABELA: livro_caixa
-- ================================================

-- Estrutura da tabela livro_caixa
-- Colunas: id (integer), data_movimento (date), tipo (character varying), descricao (text), valor (numeric), categoria (character varying), metodo_pagamento (character varying), observacoes (text), usuario_id (integer), ordem_servico_id (integer), created_at (timestamp without time zone)

TRUNCATE TABLE `livro_caixa`;

INSERT INTO `livro_caixa` (`id`, `data_movimento`, `tipo`, `descricao`, `valor`, `categoria`, `metodo_pagamento`, `observacoes`, `usuario_id`, `ordem_servico_id`, `created_at`) VALUES
(1, '2025-01-01 00:00:00', 'entrada', 'Serviço Funeral - Família Silva', 3500.00, 'Serviços Funerarios', 'Cartão de Crédito', 'Pagamento à vista com desconto', NULL, NULL, '2025-07-10 00:49:31'),
(2, '2025-01-02 00:00:00', 'saida', 'Compra de Flores - Fornecedor ABC', 250.00, 'Materiais', 'Dinheiro', 'Arranjos para cerimônia', NULL, NULL, '2025-07-10 00:49:31'),
(3, '2025-01-03 00:00:00', 'entrada', 'Serviço de Cremação - Família Santos', 2800.00, 'Serviços Funerarios', 'PIX', 'Pagamento integral', NULL, NULL, '2025-07-10 00:49:31'),
(4, '2025-01-04 00:00:00', 'saida', 'Combustível para Veículos', 420.00, 'Combustível', 'Cartão de Débito', 'Abastecimento frota', NULL, NULL, '2025-07-10 00:49:31'),
(5, '2025-01-05 00:00:00', 'entrada', 'Serviço Completo - Família Oliveira', 4200.00, 'Serviços Funerarios', 'Boleto Bancário', 'Parcelamento em 3x', NULL, NULL, '2025-07-10 00:49:31'),
(6, '2025-01-06 00:00:00', 'saida', 'Manutenção Veículo 001', 800.00, 'Manutenção', 'Transferência', 'Revisão preventiva', NULL, NULL, '2025-07-10 00:49:31'),
(7, '2025-01-07 00:00:00', 'entrada', 'Taxa Adicional - Serviço Noturno', 500.00, 'Taxas Adicionais', 'Dinheiro', 'Serviço fora do horário', NULL, NULL, '2025-07-10 00:49:31'),
(8, '2025-01-08 00:00:00', 'saida', 'Compra de Urnas - Fornecedor XYZ', 1200.00, 'Materiais', 'Cartão de Crédito', 'Estoque mensal', NULL, NULL, '2025-07-10 00:49:31'),
(9, '2025-01-09 00:00:00', 'entrada', 'Serviço Translado - Família Costa', 1800.00, 'Serviços Funerarios', 'PIX', 'Translado intermunicipal', NULL, NULL, '2025-07-10 00:49:31'),
(10, '2025-01-10 00:00:00', 'saida', 'Pagamento Funcionários', 2500.00, 'Folha de Pagamento', 'Transferência', 'Salários quinzenais', NULL, NULL, '2025-07-10 00:49:31');

-- ================================================
-- TABELA: logs_auditoria
-- ================================================

-- Estrutura da tabela logs_auditoria
-- Colunas: id (integer), usuario_id (integer), acao (text), tabela (text), registro_id (integer), dados_anteriores (json), dados_novos (json), detalhes (text), endereco_ip (text), user_agent (text), criado_em (timestamp without time zone)

TRUNCATE TABLE `logs_auditoria`;

INSERT INTO `logs_auditoria` (`id`, `usuario_id`, `acao`, `tabela`, `registro_id`, `dados_anteriores`, `dados_novos`, `detalhes`, `endereco_ip`, `user_agent`, `criado_em`) VALUES
(1, 2, 'CREATE', 'produtos_os', 1, NULL, '{"id":1,"ordemServicoId":2,"produtoId":1,"quantidade":1,"valor":"0","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Coroa de Flores Tradicional', '10.81.11.193', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 15:25:13'),
(2, 2, 'CREATE', 'produtos_os', 2, NULL, '{"id":2,"ordemServicoId":1,"produtoId":1,"quantidade":1,"valor":"0","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Coroa de Flores Tradicional', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 15:35:40'),
(3, 2, 'CREATE', 'produtos_os', 3, NULL, '{"id":3,"ordemServicoId":1,"produtoId":4,"quantidade":1,"valor":"0","tipo":"produto","nome":"Urna Modelo Simples","categoria":"Urnas","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Urna Modelo Simples', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 15:35:49'),
(4, 2, 'CREATE', 'produtos_os', 4, NULL, '{"id":4,"ordemServicoId":1,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Sepultamento","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Sepultamento', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 15:48:06'),
(5, 2, 'CREATE', 'produtos_os', 5, NULL, '{"id":5,"ordemServicoId":1,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Translado Municipal","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Translado Municipal', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 15:48:32'),
(6, 2, 'CREATE', 'produtos_os', 6, NULL, '{"id":6,"ordemServicoId":1,"produtoId":3,"quantidade":1,"valor":"0","tipo":"produto","nome":"Urna Modelo Luxo","categoria":"Urnas","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Urna Modelo Luxo', '10.81.12.76', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 15:48:43'),
(7, 2, 'CREATE', 'produtos_os', 7, NULL, '{"id":7,"ordemServicoId":1,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Translado Municipal","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Translado Municipal', '10.81.7.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 15:48:52'),
(8, 2, 'CREATE', 'produtos_os', 8, NULL, '{"id":8,"ordemServicoId":1,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Translado Intermunicipal","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Translado Intermunicipal', '10.81.2.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 16:01:27'),
(9, 2, 'CREATE', 'produtos_os', 9, NULL, '{"id":9,"ordemServicoId":1,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Sepultamento","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Sepultamento', '10.81.7.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 16:01:33'),
(10, 2, 'DELETE', 'produtos_os', 2, '{"id":2,"ordemServicoId":1,"produtoId":1,"quantidade":1,"valor":"0","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Coroa de Flores Tradicional', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 16:01:41'),
(11, 2, 'DELETE', 'produtos_os', 4, '{"id":4,"ordemServicoId":1,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Sepultamento","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Sepultamento', '10.81.2.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 16:01:44'),
(12, 2, 'DELETE', 'produtos_os', 3, '{"id":3,"ordemServicoId":1,"produtoId":4,"quantidade":1,"valor":"0","tipo":"produto","nome":"Urna Modelo Simples","categoria":"Urnas","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Urna Modelo Simples', '10.81.7.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 16:01:47'),
(13, 2, 'DELETE', 'produtos_os', 6, '{"id":6,"ordemServicoId":1,"produtoId":3,"quantidade":1,"valor":"0","tipo":"produto","nome":"Urna Modelo Luxo","categoria":"Urnas","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Urna Modelo Luxo', '10.81.2.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 16:01:48'),
(14, 2, 'DELETE', 'produtos_os', 7, '{"id":7,"ordemServicoId":1,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Translado Municipal","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Translado Municipal', '10.81.2.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 16:01:50'),
(15, 2, 'DELETE', 'produtos_os', 8, '{"id":8,"ordemServicoId":1,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Translado Intermunicipal","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Translado Intermunicipal', '10.81.2.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 16:01:53'),
(16, 2, 'CREATE', 'produtos_os', 10, NULL, '{"id":10,"ordemServicoId":1,"produtoId":null,"quantidade":1,"valor":"0","tipo":"servico","nome":"Plano Familiar Ltda","categoria":"servico","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Plano Familiar Ltda', '10.81.2.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 16:04:13'),
(17, 2, 'CREATE', 'produtos_os', 11, NULL, '{"id":11,"ordemServicoId":1,"produtoId":null,"quantidade":1,"valor":"0","tipo":"servico","nome":"Seguradora Vida & Morte","categoria":"servico","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Seguradora Vida & Morte', '10.81.7.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 16:04:21'),
(18, 2, 'CREATE', 'produtos_os', 12, NULL, '{"id":12,"ordemServicoId":2,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Translado Intermunicipal","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Translado Intermunicipal', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 22:39:36'),
(19, 2, 'CREATE', 'produtos_os', 13, NULL, '{"id":13,"ordemServicoId":2,"produtoId":4,"quantidade":1,"valor":"0","tipo":"produto","nome":"Urna Modelo Simples","categoria":"Urnas","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Urna Modelo Simples', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 22:39:43'),
(20, 2, 'DELETE', 'produtos_os', 1, '{"id":1,"ordemServicoId":2,"produtoId":1,"quantidade":1,"valor":"0","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Coroa de Flores Tradicional', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 22:42:44'),
(21, 2, 'CREATE', 'produtos_os', 14, NULL, '{"id":14,"ordemServicoId":2,"produtoId":1,"quantidade":1,"valor":"0","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Coroa de Flores Tradicional', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 22:42:54'),
(22, 2, 'CREATE', 'produtos_os', 15, NULL, '{"id":15,"ordemServicoId":2,"produtoId":5,"quantidade":1,"valor":"0","tipo":"produto","nome":"Vela Votiva Grande","categoria":"Velas","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Vela Votiva Grande', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 22:43:04'),
(23, 2, 'CREATE', 'produtos_os', 16, NULL, '{"id":16,"ordemServicoId":2,"produtoId":1,"quantidade":1,"valor":"0","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Coroa de Flores Tradicional', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 22:43:11'),
(24, 2, 'CREATE', 'produtos_os', 17, NULL, '{"id":17,"ordemServicoId":2,"produtoId":3,"quantidade":1,"valor":"0","tipo":"produto","nome":"Urna Modelo Luxo","categoria":"Urnas","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Urna Modelo Luxo', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 22:43:45'),
(25, 2, 'CREATE', 'produtos_os', 18, NULL, '{"id":18,"ordemServicoId":2,"produtoId":3,"quantidade":1,"valor":"0","tipo":"produto","nome":"Urna Modelo Luxo","categoria":"Urnas","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Urna Modelo Luxo', '10.81.4.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-08 22:47:14'),
(26, 2, 'DELETE', 'produtos_os', 18, '{"id":18,"ordemServicoId":2,"produtoId":3,"quantidade":1,"valor":"0","tipo":"produto","nome":"Urna Modelo Luxo","categoria":"Urnas","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Urna Modelo Luxo', '10.81.2.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 02:49:41'),
(27, 2, 'DELETE', 'produtos_os', 16, '{"id":16,"ordemServicoId":2,"produtoId":1,"quantidade":1,"valor":"0","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Coroa de Flores Tradicional', '10.81.7.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 02:49:43'),
(28, 2, 'DELETE', 'produtos_os', 15, '{"id":15,"ordemServicoId":2,"produtoId":5,"quantidade":1,"valor":"0","tipo":"produto","nome":"Vela Votiva Grande","categoria":"Velas","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Vela Votiva Grande', '10.81.4.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 02:49:45'),
(29, 2, 'DELETE', 'produtos_os', 14, '{"id":14,"ordemServicoId":2,"produtoId":1,"quantidade":1,"valor":"0","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Coroa de Flores Tradicional', '10.81.4.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 02:49:46'),
(30, 2, 'DELETE', 'produtos_os', 13, '{"id":13,"ordemServicoId":2,"produtoId":4,"quantidade":1,"valor":"0","tipo":"produto","nome":"Urna Modelo Simples","categoria":"Urnas","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Urna Modelo Simples', '10.81.4.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 02:49:48'),
(31, 2, 'CREATE', 'notas_contratuais', 1, NULL, '{"id":1,"ordemServicoId":2,"numeroNota":"NC1752032086864","nomeContratante":"william oliveira","cpfCnpjContratante":"400.900.648-01","enderecoContratante":"Rua Lenita, 31","cidadeContratante":"Barueri","telefoneContratante":"11997219887","valorTotal":"0.00","observacoes":"","status":"pendente","criadoEm":"2025-07-09T03:34:46.882Z","atualizadoEm":"2025-07-09T03:34:46.882Z"}', 'Criou nota contratual: NC1752032086864', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:34:46'),
(32, 2, 'DELETE', 'notas_contratuais', 1, '{"id":1,"ordemServicoId":2,"numeroNota":"NC1752032086864","nomeContratante":"william oliveira","cpfCnpjContratante":"400.900.648-01","enderecoContratante":"Rua Lenita, 31","cidadeContratante":"Barueri","telefoneContratante":"11997219887","valorTotal":"0.00","observacoes":"","status":"pendente","criadoEm":"2025-07-09T03:34:46.882Z","atualizadoEm":"2025-07-09T03:34:46.882Z"}', NULL, 'Excluiu nota contratual: NC1752032086864', '10.81.6.201', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:35:21'),
(33, 2, 'CREATE', 'produtos_os', 19, NULL, '{"id":19,"ordemServicoId":2,"produtoId":1,"quantidade":1,"valor":"0","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Coroa de Flores Tradicional', '10.81.6.201', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:36:07'),
(34, 2, 'CREATE', 'produtos_os', 20, NULL, '{"id":20,"ordemServicoId":2,"produtoId":6,"quantidade":1,"valor":"0","tipo":"produto","nome":"Terço de Madeira","categoria":"Religiosos","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Terço de Madeira', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:36:26'),
(35, 2, 'DELETE', 'produtos_os', 17, '{"id":17,"ordemServicoId":2,"produtoId":3,"quantidade":1,"valor":"0","tipo":"produto","nome":"Urna Modelo Luxo","categoria":"Urnas","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Urna Modelo Luxo', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:36:33'),
(36, 2, 'DELETE', 'produtos_os', 19, '{"id":19,"ordemServicoId":2,"produtoId":1,"quantidade":1,"valor":"0","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Coroa de Flores Tradicional', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:36:35'),
(37, 2, 'DELETE', 'produtos_os', 20, '{"id":20,"ordemServicoId":2,"produtoId":6,"quantidade":1,"valor":"0","tipo":"produto","nome":"Terço de Madeira","categoria":"Religiosos","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Terço de Madeira', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:36:38'),
(38, 2, 'CREATE', 'produtos_os', 21, NULL, '{"id":21,"ordemServicoId":2,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Remoção Hospitalar","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Remoção Hospitalar', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:36:46'),
(39, 2, 'DELETE', 'produtos_os', 21, '{"id":21,"ordemServicoId":2,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Remoção Hospitalar","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Remoção Hospitalar', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:36:49'),
(40, 2, 'CREATE', 'produtos_os', 22, NULL, '{"id":22,"ordemServicoId":2,"produtoId":null,"quantidade":1,"valor":"2","tipo":"servico","nome":"Plano Familiar Ltda","categoria":"servico","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Plano Familiar Ltda', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:36:56'),
(41, 2, 'CREATE', 'notas_contratuais', 2, NULL, '{"id":2,"ordemServicoId":2,"numeroNota":"NC1752032227029","nomeContratante":"WILLIAM DE OLIVEIRA COSTA","cpfCnpjContratante":"50.045.729/0001-52","enderecoContratante":"Rua Lenita, 31","cidadeContratante":"Barueri","telefoneContratante":"11997219887","valorTotal":"2.00","observacoes":"","status":"pendente","criadoEm":"2025-07-09T03:37:07.049Z","atualizadoEm":"2025-07-09T03:37:07.049Z"}', 'Criou nota contratual: NC1752032227029', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:37:07'),
(42, 2, 'DELETE', 'notas_contratuais', 2, '{"id":2,"ordemServicoId":2,"numeroNota":"NC1752032227029","nomeContratante":"WILLIAM DE OLIVEIRA COSTA","cpfCnpjContratante":"50.045.729/0001-52","enderecoContratante":"Rua Lenita, 31","cidadeContratante":"Barueri","telefoneContratante":"11997219887","valorTotal":"2.00","observacoes":"","status":"pendente","criadoEm":"2025-07-09T03:37:07.049Z","atualizadoEm":"2025-07-09T03:37:07.049Z"}', NULL, 'Excluiu nota contratual: NC1752032227029', '10.81.7.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:40:29'),
(43, 2, 'DELETE', 'produtos_os', 22, '{"id":22,"ordemServicoId":2,"produtoId":null,"quantidade":1,"valor":"2","tipo":"servico","nome":"Plano Familiar Ltda","categoria":"servico","notaContratualId":null,"numeroNc":null,"disponivel":true}', NULL, 'Excluiu produto OS: Plano Familiar Ltda', '10.81.4.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:41:00'),
(44, 2, 'CREATE', 'produtos_os', 23, NULL, '{"id":23,"ordemServicoId":2,"produtoId":1,"quantidade":1,"valor":"183.60","tipo":"produto","nome":"Coroa de Flores Tradicional","categoria":"Flores","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Coroa de Flores Tradicional', '10.81.4.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:41:58'),
(45, 2, 'CREATE', 'produtos_os', 24, NULL, '{"id":24,"ordemServicoId":2,"produtoId":null,"quantidade":1,"valor":"200","tipo":"veiculo","nome":"Sepultamento","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Sepultamento', '10.81.4.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:42:06'),
(46, 2, 'CREATE', 'produtos_os', 25, NULL, '{"id":25,"ordemServicoId":2,"produtoId":null,"quantidade":1,"valor":"0","tipo":"veiculo","nome":"Sepultamento","categoria":"Veículo/Motorista","notaContratualId":null,"numeroNc":null,"disponivel":true}', 'Criou novo produto OS: Sepultamento', '10.81.4.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:42:14'),
(47, 2, 'CREATE', 'notas_contratuais', 3, NULL, '{"id":3,"ordemServicoId":2,"numeroNota":"NC1752032676907","nomeContratante":"WILLIAM DE OLIVEIRA COSTA","cpfCnpjContratante":"50.045.729/0001-52","enderecoContratante":"Rua Lenita, 31","cidadeContratante":"Barueri","telefoneContratante":"1199191135","valorTotal":"2000.00","observacoes":"","status":"pendente","criadoEm":"2025-07-09T03:44:36.926Z","atualizadoEm":"2025-07-09T03:44:36.926Z"}', 'Criou nota contratual: NC1752032676907', '10.81.2.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:44:37'),
(48, 2, 'DELETE', 'notas_contratuais', 3, '{"id":3,"ordemServicoId":2,"numeroNota":"NC1752032676907","nomeContratante":"WILLIAM DE OLIVEIRA COSTA","cpfCnpjContratante":"50.045.729/0001-52","enderecoContratante":"Rua Lenita, 31","cidadeContratante":"Barueri","telefoneContratante":"1199191135","valorTotal":"2000.00","observacoes":"","status":"pendente","criadoEm":"2025-07-09T03:44:36.926Z","atualizadoEm":"2025-07-09T03:44:36.926Z"}', NULL, 'Excluiu nota contratual: NC1752032676907', '10.81.2.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:45:47'),
(49, 2, 'CREATE', 'notas_contratuais', 4, NULL, '{"id":4,"ordemServicoId":2,"numeroNota":"NC1752032850523","nomeContratante":"WILLIAM DE OLIVEIRA COSTA","cpfCnpjContratante":"54.151.251/0001-04","enderecoContratante":"Rua Lenita, 31","cidadeContratante":"Barueri","telefoneContratante":"11997219887","valorTotal":"383.60","observacoes":"","status":"pendente","criadoEm":"2025-07-09T03:47:30.542Z","atualizadoEm":"2025-07-09T03:47:30.542Z"}', 'Criou nota contratual: NC1752032850523', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:47:30'),
(50, 2, 'DELETE', 'notas_contratuais', 4, '{"id":4,"ordemServicoId":2,"numeroNota":"NC1752032850523","nomeContratante":"WILLIAM DE OLIVEIRA COSTA","cpfCnpjContratante":"54.151.251/0001-04","enderecoContratante":"Rua Lenita, 31","cidadeContratante":"Barueri","telefoneContratante":"11997219887","valorTotal":"383.60","observacoes":"","status":"pendente","criadoEm":"2025-07-09T03:47:30.542Z","atualizadoEm":"2025-07-09T03:47:30.542Z"}', NULL, 'Excluiu nota contratual: NC1752032850523', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:49:12'),
(51, 2, 'CREATE', 'notas_contratuais', 5, NULL, '{"id":5,"ordemServicoId":2,"numeroNota":"NC1752033108920","nomeContratante":"WILLIAM DE OLIVEIRA COSTA","cpfCnpjContratante":"400.900.648-01","enderecoContratante":"Rua Lenita, 31","cidadeContratante":"Barueri","telefoneContratante":"11997219887","valorTotal":"383.60","observacoes":"","status":"pendente","criadoEm":"2025-07-09T03:51:48.939Z","atualizadoEm":"2025-07-09T03:51:48.939Z"}', 'Criou nota contratual: NC1752033108920', '10.81.10.189', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 03:51:48'),
(52, 2, 'DELETE', 'notas_contratuais', 5, '{"id":5,"ordemServicoId":2,"numeroNota":"NC1752033108920","nomeContratante":"WILLIAM DE OLIVEIRA COSTA","cpfCnpjContratante":"400.900.648-01","enderecoContratante":"Rua Lenita, 31","cidadeContratante":"Barueri","telefoneContratante":"11997219887","valorTotal":"383.60","observacoes":"","status":"pendente","criadoEm":"2025-07-09T03:51:48.939Z","atualizadoEm":"2025-07-09T03:51:48.939Z"}', NULL, 'Excluiu nota contratual: NC1752033108920', '10.81.7.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 04:10:18'),
(53, 2, 'CREATE', 'notas_contratuais', 6, NULL, '{"id":6,"ordemServicoId":2,"numeroNota":"NC1752034246631","nomeContratante":"Buquê de Rosas Brancas","cpfCnpjContratante":"5433435","enderecoContratante":"43545","cidadeContratante":"São Paulo","telefoneContratante":"(11) 94321-5555","valorTotal":"100.00","observacoes":"","status":"pendente","criadoEm":"2025-07-09T04:10:46.651Z","atualizadoEm":"2025-07-09T04:10:46.651Z"}', 'Criou nota contratual: NC1752034246631', '10.81.0.153', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 04:10:46'),
(54, 2, 'DELETE', 'notas_contratuais', 6, '{"id":6,"ordemServicoId":2,"numeroNota":"NC1752034246631","nomeContratante":"Buquê de Rosas Brancas","cpfCnpjContratante":"5433435","enderecoContratante":"43545","cidadeContratante":"São Paulo","telefoneContratante":"(11) 94321-5555","valorTotal":"100.00","observacoes":"","status":"pendente","criadoEm":"2025-07-09T04:10:46.651Z","atualizadoEm":"2025-07-09T04:10:46.651Z"}', NULL, 'Excluiu nota contratual: NC1752034246631', '10.81.4.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 04:13:08'),
(55, 2, 'CREATE', 'notas_contratuais', 7, NULL, '{"id":7,"ordemServicoId":2,"numeroNota":"NC1752034503242","nomeContratante":"Plano Familiar Ltda","cpfCnpjContratante":"TTTTTTTTTTT","enderecoContratante":"TTT","cidadeContratante":"TTTTTTTTTTTTTT","telefoneContratante":"TTT","valorTotal":"1000.00","observacoes":"","status":"pendente","criadoEm":"2025-07-09T04:15:03.260Z","atualizadoEm":"2025-07-09T04:15:03.260Z"}', 'Criou nota contratual: NC1752034503242', '10.81.2.247', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 04:15:03'),
(56, 2, 'DELETE', 'notas_contratuais', 7, '{"id":7,"ordemServicoId":2,"numeroNota":"NC1752034503242","nomeContratante":"Plano Familiar Ltda","cpfCnpjContratante":"TTTTTTTTTTT","enderecoContratante":"TTT","cidadeContratante":"TTTTTTTTTTTTTT","telefoneContratante":"TTT","valorTotal":"1000.00","observacoes":"","status":"pendente","criadoEm":"2025-07-09T04:15:03.260Z","atualizadoEm":"2025-07-09T04:15:03.260Z"}', NULL, 'Excluiu nota contratual: NC1752034503242', '10.81.4.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-09 04:15:56');

-- ================================================
-- TABELA: mensagens_chat
-- ================================================

-- Estrutura da tabela mensagens_chat
-- Colunas: id (integer), remetente_id (integer), destinatario_id (integer), conteudo (text), lida (boolean), criada_em (timestamp without time zone)

-- Tabela mensagens_chat está vazia

-- ================================================
-- TABELA: motoristas
-- ================================================

-- Estrutura da tabela motoristas
-- Colunas: id (integer), nome (text), sobrenome (text), senha (text), telefone (text), email (text), cnh (text), validade_cnh (timestamp without time zone), ativo (boolean), observacoes (text), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `motoristas`;

INSERT INTO `motoristas` (`id`, `nome`, `sobrenome`, `senha`, `telefone`, `email`, `cnh`, `validade_cnh`, `ativo`, `observacoes`, `criado_em`, `atualizado_em`) VALUES
(1, 'Carlos', 'Silva', 'fc323dc1d59510fac3b8948e6b06ed37:b276ccca4c4c:69b4f7e819fbb40d76d1ff43545a58cb', '(11) 98765-1111', 'carlos.silva@funeraria.com', '12345678901', '2026-05-15 00:00:00', 1, 'Motorista experiente, 10 anos de casa', '2025-07-08 15:22:55', '2025-07-08 22:38:37'),
(2, 'Roberto', 'Santos', '7b1fdb45c701c86d4bbdf76cb06f010b81542e9b658bbce640fdaa79ddf51222:4f5270786599384e712261bdc8dafb0b6aab46ebe5dd33aef8173950b485c041', '(11) 97654-2222', 'roberto.santos@funeraria.com', '09876543210', '2025-12-20 00:00:00', 1, 'Especialista em transporte de longa distância', '2025-07-08 15:22:55', '2025-07-08 22:38:34'),
(3, 'Fernando', 'Oliveira', '7b1fdb45c701c86d4bbdf76cb06f010b81542e9b658bbce640fdaa79ddf51222:4f5270786599384e712261bdc8dafb0b6aab46ebe5dd33aef8173950b485c041', '(11) 96543-3333', 'fernando.oliveira@funeraria.com', '11223344556', '2027-03-10 00:00:00', 1, 'Motorista noturno, disponível 24h', '2025-07-08 15:22:55', '2025-07-08 22:38:41'),
(4, 'João', 'Pereira', '7b1fdb45c701c86d4bbdf76cb06f010b81542e9b658bbce640fdaa79ddf51222:4f5270786599384e712261bdc8dafb0b6aab46ebe5dd33aef8173950b485c041', '(11) 95432-4444', 'joao.pereira@funeraria.com', '22334455667', '2026-08-15 00:00:00', 1, 'Motorista responsável pelos traslados', '2025-07-08 16:36:16', '2025-07-08 16:36:16'),
(5, 'Antonio', 'Costa', '7b1fdb45c701c86d4bbdf76cb06f010b81542e9b658bbce640fdaa79ddf51222:4f5270786599384e712261bdc8dafb0b6aab46ebe5dd33aef8173950b485c041', '(11) 94321-5555', 'antonio.costa@funeraria.com', '33445566778', '2025-11-30 00:00:00', 1, 'Especialista em sepultamentos', '2025-07-08 16:36:16', '2025-07-08 16:36:16'),
(6, 'Marcos', 'Ribeiro', '7b1fdb45c701c86d4bbdf76cb06f010b81542e9b658bbce640fdaa79ddf51222:4f5270786599384e712261bdc8dafb0b6aab46ebe5dd33aef8173950b485c041', '(11) 93210-6666', 'marcos.ribeiro@funeraria.com', '44556677889', '2027-02-20 00:00:00', 1, 'Motorista de plantão 24h', '2025-07-08 16:36:16', '2025-07-08 16:36:16'),
(7, 'Paulo', 'Martins', '7b1fdb45c701c86d4bbdf76cb06f010b81542e9b658bbce640fdaa79ddf51222:4f5270786599384e712261bdc8dafb0b6aab46ebe5dd33aef8173950b485c041', '(11) 92109-7777', 'paulo.martins@funeraria.com', '55667788990', '2026-06-10 00:00:00', 1, 'Responsável por traslados intermunicipais', '2025-07-08 16:36:16', '2025-07-08 16:36:16'),
(8, 'José', 'Lima', '7b1fdb45c701c86d4bbdf76cb06f010b81542e9b658bbce640fdaa79ddf51222:4f5270786599384e712261bdc8dafb0b6aab46ebe5dd33aef8173950b485c041', '(11) 91098-8888', 'jose.lima@funeraria.com', '66778899001', '2025-09-25 00:00:00', 1, 'Motorista experiente, 15 anos de empresa', '2025-07-08 16:36:16', '2025-07-08 16:36:16'),
(9, 'Ricardo', 'Almeida', '7b1fdb45c701c86d4bbdf76cb06f010b81542e9b658bbce640fdaa79ddf51222:4f5270786599384e712261bdc8dafb0b6aab46ebe5dd33aef8173950b485c041', '(11) 90987-9999', 'ricardo.almeida@funeraria.com', '77889900112', '2027-01-15 00:00:00', 1, 'Motorista backup para emergências', '2025-07-08 16:36:16', '2025-07-08 16:36:16');

-- ================================================
-- TABELA: motoristas_ordem_servico
-- ================================================

-- Estrutura da tabela motoristas_ordem_servico
-- Colunas: id (integer), ordem_servico_id (integer), motorista_id (integer), veiculo_produto_id (integer), hora_saida (timestamp without time zone), hora_chegada (timestamp without time zone), status (character varying), observacoes (text), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone), data_servico (date), hora_servico (time without time zone), local_origem (text), local_destino (text), tipo_veiculo (character varying)

TRUNCATE TABLE `motoristas_ordem_servico`;

INSERT INTO `motoristas_ordem_servico` (`id`, `ordem_servico_id`, `motorista_id`, `veiculo_produto_id`, `hora_saida`, `hora_chegada`, `status`, `observacoes`, `criado_em`, `atualizado_em`, `data_servico`, `hora_servico`, `local_origem`, `local_destino`, `tipo_veiculo`) VALUES
(4, 1, 1, 5, '2025-07-08 20:32:51', '2025-07-08 20:52:32', 'concluido', NULL, '2025-07-08 19:18:43', '2025-07-08 20:52:32', NULL, NULL, NULL, NULL, NULL),
(5, 1, 1, 9, '2025-07-08 21:13:17', '2025-07-08 21:18:05', 'concluido', NULL, '2025-07-08 21:12:48', '2025-07-08 21:18:05', NULL, NULL, NULL, NULL, NULL),
(12, 2, 1, 12, NULL, NULL, 'em_andamento', 'fewfwef', '2025-07-09 02:59:17', '2025-07-09 02:59:17', '2025-07-08 00:00:00', '23:57:00', 'fewwfewfwefewf', 'ewfewfwefwefwe', 'reeeeeeeeeeeeeeeeeeeeeeeee');

-- ================================================
-- TABELA: notas_contratuais
-- ================================================

-- Estrutura da tabela notas_contratuais
-- Colunas: id (integer), ordem_servico_id (integer), numero_nota (character varying), nome_contratante (character varying), cpf_cnpj_contratante (character varying), endereco_contratante (text), cidade_contratante (character varying), telefone_contratante (character varying), valor_total (numeric), observacoes (text), status (character varying), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

-- Tabela notas_contratuais está vazia

-- ================================================
-- TABELA: notas_gtc
-- ================================================

-- Estrutura da tabela notas_gtc
-- Colunas: id (integer), numero_declaracao (character varying), data_transporte (date), nome_falecido (character varying), cpf_falecido (character varying), data_nascimento (date), data_falecimento (date), local_falecimento (character varying), local_retirada_obito (character varying), destino_corpo (character varying), empresa_transportador (character varying), cnpj_transportador (character varying), municipio_transportador (character varying), agente_funerario (character varying), rc_cpf_cnj_agente (character varying), placa_carro (character varying), modelo_carro (character varying), status (character varying), observacoes (text), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `notas_gtc`;

INSERT INTO `notas_gtc` (`id`, `numero_declaracao`, `data_transporte`, `nome_falecido`, `cpf_falecido`, `data_nascimento`, `data_falecimento`, `local_falecimento`, `local_retirada_obito`, `destino_corpo`, `empresa_transportador`, `cnpj_transportador`, `municipio_transportador`, `agente_funerario`, `rc_cpf_cnj_agente`, `placa_carro`, `modelo_carro`, `status`, `observacoes`, `criado_em`, `atualizado_em`) VALUES
(1, 'GTC001/2025', '2025-01-15 00:00:00', 'João Silva Santos', '123.456.789-00', '1965-03-15 00:00:00', '2025-01-14 00:00:00', 'Hospital Municipal', 'IML - Instituto Médico Legal', 'Cemitério São João', 'Funerária Central Ltda', '12.345.678/0001-90', 'São Paulo', 'Carlos Eduardo Silva', 'RG 12.345.678-9', 'ABC-1234', 'Volkswagen Saveiro', 'ativo', 'Transporte realizado conforme protocolo', '2025-07-10 04:18:12', '2025-07-10 04:18:12'),
(2, 'GTC002/2025', '2025-01-20 00:00:00', 'Maria Oliveira Costa', '987.654.321-00', '1958-07-22 00:00:00', '2025-01-19 00:00:00', 'Clínica Médica Dr. Santos', 'Residência Familiar', 'Cemitério da Paz', 'Transportes Funerários São José', '98.765.432/0001-10', 'São Paulo', 'João Carlos Pereira', 'CPF 987.654.321-00', 'DEF-5678', 'Fiat Strada', 'finalizado', 'Transporte concluído sem intercorrências', '2025-07-10 04:18:12', '2025-07-10 04:18:12'),
(3, 'GTC003/2025', '2025-01-25 00:00:00', 'Carlos Alberto Souza', '456.789.123-00', '1972-11-08 00:00:00', '2025-01-24 00:00:00', 'Hospital São Lucas', 'Funerária Paz Eterna', 'Cemitério Municipal', 'Funerária Paz Eterna Ltda', '45.678.912/0001-33', 'São Paulo', 'Ana Maria Santos', 'RG 45.678.912-3', 'GHI-9012', 'Chevrolet Montana', 'ativo', 'Aguardando liberação do corpo', '2025-07-10 04:18:12', '2025-07-10 04:18:12'),
(4, 'GTC004/2025', '2025-02-01 00:00:00', 'Ana Paula Lima', '789.123.456-00', '1980-04-12 00:00:00', '2025-01-31 00:00:00', 'Casa de Repouso Vida Plena', 'Funerária Esperança', 'Crematório Municipal', 'Funerária Esperança Ltda', '78.912.345/0001-55', 'São Paulo', 'Pedro Silva Costa', 'CNJ 78912345', 'JKL-3456', 'Renault Oroch', 'cancelado', 'Cancelado por mudança de procedimento', '2025-07-10 04:18:12', '2025-07-10 04:18:12'),
(5, 'GTC005/2025', '2025-02-05 00:00:00', 'Roberto Alves Pereira', '321.654.987-00', '1955-09-30 00:00:00', '2025-02-04 00:00:00', 'Hospital Geral', 'Morgue Hospital Geral', 'Cemitério Jardim da Saudade', 'Funerária Central Ltda', '12.345.678/0001-90', 'São Paulo', 'Marcos Antonio Lima', 'RG 32.165.498-7', 'MNO-7890', 'Toyota Hilux', 'finalizado', 'Transporte realizado com sucesso', '2025-07-10 04:18:12', '2025-07-10 04:18:12'),
(6, 'GTC006/2025', '2025-01-11 00:00:00', 'José da Silva', '111.222.333-44', '1950-05-15 00:00:00', '2025-01-10 00:00:00', 'Hospital Central', 'Morgue Municipal', 'Cemitério Municipal', 'Transportes Fúnebres Silva', '11.222.333/0001-44', 'São Paulo', 'Maria Silva', 'RG 11.222.333-4', 'XYZ-9876', 'Fiat Ducato', 'ativo', 'Transporte urgente', '2025-07-10 04:29:25', '2025-07-10 04:29:25'),
(7, 'GTC007/2025', '2025-01-13 00:00:00', 'Ana Maria Santos', '222.333.444-55', '1960-08-20 00:00:00', '2025-01-12 00:00:00', 'Clínica São José', 'Residência', 'Crematório Central', 'Funerária Esperança', '22.333.444/0001-55', 'São Paulo', 'Carlos Santos', 'CPF 222.333.444-55', 'ABC-5432', 'Chevrolet Cruze', 'finalizado', 'Cremação realizada', '2025-07-10 04:29:25', '2025-07-10 04:29:25'),
(8, 'GTC008/2025', '2025-01-15 00:00:00', 'Pedro Oliveira', '333.444.555-66', '1945-12-03 00:00:00', '2025-01-14 00:00:00', 'Hospital Geral', 'IML', 'Cemitério Jardim', 'Transportes Oliveira', '33.444.555/0001-66', 'São Paulo', 'João Oliveira', 'RG 33.444.555-6', 'DEF-8765', 'Volkswagen Amarok', 'ativo', 'Aguardando documentação', '2025-07-10 04:29:25', '2025-07-10 04:29:25');

-- ================================================
-- TABELA: notas_nd
-- ================================================

-- Estrutura da tabela notas_nd
-- Colunas: id (integer), numero_processo (character varying), data (date), nome_falecido (character varying), contratada (character varying), valor (numeric), status (character varying), observacoes (text), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `notas_nd`;

INSERT INTO `notas_nd` (`id`, `numero_processo`, `data`, `nome_falecido`, `contratada`, `valor`, `status`, `observacoes`, `criado_em`, `atualizado_em`) VALUES
(1, 'ND001/2025', '2025-01-15 00:00:00', 'João Silva Santos', 'Funerária Central', 2500.00, 'pendente', 'Serviços funerários completos', '2025-07-10 04:18:12', '2025-07-10 04:18:12'),
(2, 'ND002/2025', '2025-01-20 00:00:00', 'Maria Oliveira Costa', 'Funerária São José', 1800.00, 'pago', 'Cremação e cerimônia', '2025-07-10 04:18:12', '2025-07-10 04:18:12'),
(3, 'ND003/2025', '2025-01-25 00:00:00', 'Carlos Alberto Souza', 'Funerária Paz Eterna', 3200.00, 'pendente', 'Translado intermunicipal', '2025-07-10 04:18:12', '2025-07-10 04:18:12'),
(4, 'ND004/2025', '2025-02-01 00:00:00', 'Ana Paula Lima', 'Funerária Esperança', 2100.00, 'cancelado', 'Cancelado por solicitação da família', '2025-07-10 04:18:12', '2025-07-10 04:18:12'),
(5, 'ND005/2025', '2025-02-05 00:00:00', 'Roberto Alves Pereira', 'Funerária Central', 2800.00, 'pago', 'Serviço completo com flores', '2025-07-10 04:18:12', '2025-07-10 04:18:12');

-- ================================================
-- TABELA: obitos
-- ================================================

-- Estrutura da tabela obitos
-- Colunas: id (integer), natimorto (text), tipo (text), data (text), idade (text), desc_idade (text), hora_nasc (text), local_nasc (text), gestacao (text), duracao (text), avo_paterno (text), avo_materno (text), avo_paterna (text), avo_materna (text), nome_testemunha1 (text), rg_cpf_cnj_testemunha1 (text), idade_testemunha1 (text), endereco_testemunha1 (text), bairro_testemunha1 (text), nome (text), sexo (text), cor (text), nascimento (text), profissao (text), naturalidade (text), estado_civil (text), rg (text), cpf (text), deixa_bens (text), testamento (text), cep (text), endereco (text), bairro (text), cidade (text), estado (text), nome_pai (text), estado_civil_pai (text), nome_mae (text), estado_civil_mae (text), nome_conjuge (text), filhos (text), observacoes (text), data_falecimento (text), hora_falecimento (text), local_falecimento (text), cidade_falecimento (text), uf_falecimento (text), data_sepultamento (text), hora_sepultamento (text), local_sepultamento (text), cidade_sepultamento (text), uf_sepultamento (text), medico1 (text), crm1 (text), medico2 (text), crm2 (text), causa_morte (text), declarante (text), rg_declarante (text), cpf_declarante (text), grau_parentesco (text), telefone_declarante (text), cep_declarante (text), endereco_declarante (text), bairro_declarante (text), cidade_declarante (text), uf_declarante (text), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `obitos`;

INSERT INTO `obitos` (`id`, `natimorto`, `tipo`, `data`, `idade`, `desc_idade`, `hora_nasc`, `local_nasc`, `gestacao`, `duracao`, `avo_paterno`, `avo_materno`, `avo_paterna`, `avo_materna`, `nome_testemunha1`, `rg_cpf_cnj_testemunha1`, `idade_testemunha1`, `endereco_testemunha1`, `bairro_testemunha1`, `nome`, `sexo`, `cor`, `nascimento`, `profissao`, `naturalidade`, `estado_civil`, `rg`, `cpf`, `deixa_bens`, `testamento`, `cep`, `endereco`, `bairro`, `cidade`, `estado`, `nome_pai`, `estado_civil_pai`, `nome_mae`, `estado_civil_mae`, `nome_conjuge`, `filhos`, `observacoes`, `data_falecimento`, `hora_falecimento`, `local_falecimento`, `cidade_falecimento`, `uf_falecimento`, `data_sepultamento`, `hora_sepultamento`, `local_sepultamento`, `cidade_sepultamento`, `uf_sepultamento`, `medico1`, `crm1`, `medico2`, `crm2`, `causa_morte`, `declarante`, `rg_declarante`, `cpf_declarante`, `grau_parentesco`, `telefone_declarante`, `cep_declarante`, `endereco_declarante`, `bairro_declarante`, `cidade_declarante`, `uf_declarante`, `criado_em`, `atualizado_em`) VALUES
(1, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'fffffffffff', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '2025-07-08 22:19:57', '2025-07-08 22:19:57'),
(2, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'qtewgewgewgew', 'Feminino', 'Indígena', '2025-07-09', '535353535', 'casfacac', 'Viúvo(a)', 'wf32r243243', '345353553', 'Não declarado', 'Não declarado', '333535353', '3555555555', '55555555555555', '55555555555555555555555', '5555555555555555555555555', 'fffffffffffffeeeeeeeeeeee', 'União Estável', 'eeeeeeeeeee', 'Viúva', 't545456', '666', '5yttytytyty', '2025-07-10', '03:37', 'tttttttttttttttttttttttttttttttt', '2222222222222222222222222222222', 'ereetrttrt', '2025-07-16', '03:37', 'rtrrttrr', 'rtyty', 'ytytytytty', 'vdsdvbfvdsfdvvd', 'dsfdsffdsfsdf', 'fdsfsdf', 'sdfsdfsdfsdfsd', 'sfdsfsdf', 'ffsdsddf', 'dsdsffds', 'dsdsf', 'Cônjuge', 'dsfffffffffff', 'dddddddddddddddd', 'dsd', 'ddddddddddddddd', 'ddddddddddddddd', 'dddddddd', '2025-07-08 22:20:05', '2025-07-09 04:39:28');

-- ================================================
-- TABELA: ordens_servico
-- ================================================

-- Estrutura da tabela ordens_servico
-- Colunas: id (integer), numero_os (text), nome_falecido (text), plano (text), contratante (text), cpf_falecido (text), cnpj_contratante (text), peso (numeric), altura (text), sexo (text), religiao (text), data_nascimento (timestamp without time zone), data_falecimento (timestamp without time zone), endereco_corpo (text), local_velorio (text), endereco_sepultamento (text), data_hora_sepultamento (timestamp without time zone), nome_responsavel (text), telefone_responsavel (text), telefone2_responsavel (text), documento_responsavel (text), grau_parentesco (text), sinistro (boolean), descricao_servico (text), status (text), usuario_id (integer), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `ordens_servico`;

INSERT INTO `ordens_servico` (`id`, `numero_os`, `nome_falecido`, `plano`, `contratante`, `cpf_falecido`, `cnpj_contratante`, `peso`, `altura`, `sexo`, `religiao`, `data_nascimento`, `data_falecimento`, `endereco_corpo`, `local_velorio`, `endereco_sepultamento`, `data_hora_sepultamento`, `nome_responsavel`, `telefone_responsavel`, `telefone2_responsavel`, `documento_responsavel`, `grau_parentesco`, `sinistro`, `descricao_servico`, `status`, `usuario_id`, `criado_em`, `atualizado_em`) VALUES
(1, '54', '3435324354435', 'STANDARD', '', '', '', NULL, '', '', '', NULL, NULL, '', '', '', NULL, '', '', '', '', '', 0, '', 'finalizado', NULL, '2025-07-08 15:19:57', '2025-07-08 21:18:05'),
(2, 'OS001/2025', 'Maria da Silva Santos', 'Plano Familiar Básico', 'João Santos Silva', '123.456.789-00', NULL, 65.5, '1.65m', 'Feminino', 'Católica', '1950-03-15 00:00:00', '2025-01-05 00:00:00', 'Hospital Santa Casa - São Paulo/SP', 'Capela São José - Rua das Flores, 123', 'Cemitério da Paz - Vila Nova', '2025-01-07 14:00:00', 'João Santos Silva', '(11) 99999-1111', '(11) 88888-2222', '987.654.321-00', 'Esposo', 0, 'Serviço completo com velório e sepultamento', 'em_andamento', 2, '2025-07-08 15:22:35', '2025-07-08 15:22:35'),
(3, 'OS002/2025', 'José Carlos Oliveira', 'Plano Premium', 'Ana Oliveira Costa', '987.654.321-11', NULL, 80.2, '1.78m', 'Masculino', 'Evangélica', '1945-08-22 00:00:00', '2025-01-06 00:00:00', 'Hospital Albert Einstein - São Paulo/SP', 'Capela Memorial - Av. Paulista, 456', 'Cemitério do Morumbi - Morumbi', '2025-01-08 16:00:00', 'Ana Oliveira Costa', '(11) 77777-3333', NULL, '456.789.123-44', 'Filha', 0, 'Serviço premium com flores especiais', 'pendente', 2, '2025-07-08 15:22:35', '2025-07-08 15:22:35'),
(4, 'OS003/2025', 'Pedro Henrique Silva', 'Plano Básico', 'Carmen Silva', '456.789.123-22', NULL, 72.0, '1.70m', 'Masculino', 'Católica', '1960-12-10 00:00:00', '2025-01-07 00:00:00', 'UBS Vila Nova - São Paulo/SP', 'Capela Central - Rua Central, 789', 'Cemitério Municipal - Centro', '2025-01-09 10:00:00', 'Carmen Silva', '(11) 66666-4444', '(11) 55555-5555', '789.123.456-77', 'Mãe', 0, 'Serviço básico conforme plano contratado', 'finalizado', 2, '2025-07-08 15:22:35', '2025-07-08 15:22:35');

-- ================================================
-- TABELA: pagamentos_nota_contratual
-- ================================================

-- Estrutura da tabela pagamentos_nota_contratual
-- Colunas: id (integer), nota_contratual_id (integer), forma_pagamento (character varying), valor (numeric), data_pagamento (timestamp without time zone), operador (character varying), observacoes (text), criado_em (timestamp without time zone)

-- Tabela pagamentos_nota_contratual está vazia

-- ================================================
-- TABELA: pendencias
-- ================================================

-- Estrutura da tabela pendencias
-- Colunas: id (integer), ordem_servico_id (integer), tipo (text), status (text), usuario (text), descricao (text), criado_em (timestamp without time zone)

TRUNCATE TABLE `pendencias`;

INSERT INTO `pendencias` (`id`, `ordem_servico_id`, `tipo`, `status`, `usuario`, `descricao`, `criado_em`) VALUES
(1, 1, 'LEVOU', 'PENDENTE', NULL, 'LEVOU', '2025-07-08 15:20:11'),
(2, 1, 'DOCUMENTACAO', 'PENDENTE', 'Administrador', 'Aguardando certidão de óbito original', '2025-07-08 15:23:01'),
(3, 1, 'LIBERACAO', 'RESOLVIDA', 'Administrador', 'Corpo liberado pelo IML às 14:30', '2025-07-08 15:23:01'),
(4, 2, 'PAGAMENTO', 'PENDENTE', 'Administrador', 'Aguardando confirmação do pagamento da prestadora', '2025-07-08 15:23:01'),
(5, 2, 'DOCUMENTACAO', 'PENDENTE', 'Administrador', 'Falta autorização da família para cremação', '2025-07-08 15:23:01'),
(6, 3, 'TRANSPORTE', 'RESOLVIDA', 'Administrador', 'Transporte realizado com sucesso', '2025-07-08 15:23:01');

-- ================================================
-- TABELA: pets
-- ================================================

-- Estrutura da tabela pets
-- Colunas: id (integer), data (text), agente_funerario (text), numero_lacre (text), nome (text), raca (text), cor (text), peso (text), utiliza_marcapasso (text), especie (text), local_obito (text), causa_falecimento (text), crematorio (text), tipo_cremacao (text), nome_tutor (text), cpf (text), rg (text), cep (text), endereco (text), telefone_celular (text), telefone_fixo (text), email (text), contratante (text), seguro (text), numero_sinistro (text), valor_cobertura (text), documentos (text), valor_pago (text), servico_contratado (text), descricoes (text), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `pets`;

INSERT INTO `pets` (`id`, `data`, `agente_funerario`, `numero_lacre`, `nome`, `raca`, `cor`, `peso`, `utiliza_marcapasso`, `especie`, `local_obito`, `causa_falecimento`, `crematorio`, `tipo_cremacao`, `nome_tutor`, `cpf`, `rg`, `cep`, `endereco`, `telefone_celular`, `telefone_fixo`, `email`, `contratante`, `seguro`, `numero_sinistro`, `valor_cobertura`, `documentos`, `valor_pago`, `servico_contratado`, `descricoes`, `criado_em`, `atualizado_em`) VALUES
(2, '2025-01-02', 'Carlos Lima', 'L002', 'Mimi', 'Siamês', 'Cinza', '4kg', 'Não', 'Gato', 'Residência', 'Doença renal', 'Cremapet', 'Coletiva', 'Ana Costa', '987.654.321-00', '98.765.432-1', '02345-678', 'Av. Paulista, 456', '(11) 87654-3210', '(11) 2345-6789', 'ana@email.com', 'Ana Costa', 'Não', '', '', 'Carteira de vacinação', 'R$ 450,00', 'Cremação coletiva', 'Gata carinhosa', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(3, '2025-01-03', 'Fernanda Oliveiral', 'L003', 'Buddy', 'Golden Retriever', 'Dourado', '30kg', 'Sim', 'Cão', 'Hospital Veterinário', 'Problemas cardíacos', 'Cremapet', 'Individual', 'Roberto Silva', '456.789.123-45', '45.678.912-3', '03456-789', 'Rua dos Pinheiros, 789', '(11) 76543-2109', '(11) 4567-8901', 'roberto@email.com', 'Roberto Silva', 'PetLife', 'PL002', 'R$ 3.000,00', 'Laudo veterinário', 'R$ 1.200,00', 'Cremação individual com urna', 'Cachorro muito dócil', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(4, '2025-01-04', 'Patricia Souza pinto', 'L004', 'Melina', 'Vira-lata', 'Marrom', '15kg', 'Não', 'Cão', 'Clínica Animal', 'Atropelamento', 'Cremapet', 'Individual', 'Marcos Pereira', '321.654.987-12', '32.165.498-7', '04567-890', 'Rua da Liberdade, 321', '(11) 65432-1098', '(11) 5678-9012', 'marcos@email.com', 'Marcos Pereira', 'Não', '', '', 'Boletim de ocorrência', 'R$ 600,00', 'Cremação individual', 'Cadela resgatada da rua', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(5, '2025-01-05', 'André Santos', 'L005', 'Garfield', 'Persa', 'Laranja', '6kg', 'Não', 'Gato', 'Residência', 'Idade avançada', 'Cremapet', 'Coletiva', 'Lucia Martins', '654.321.987-33', '65.432.198-7', '05678-901', 'Av. Brasil, 654', '(11) 54321-0987', '(11) 6789-0123', 'lucia@email.com', 'Lucia Martins', 'PetSeguro', 'PS003', 'R$ 1.800,00', 'Atestado de óbito', 'R$ 500,00', 'Cremação coletiva', 'Gato muito preguiçoso', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(6, '2025-01-06', 'Juliana Alves leite juliana', 'L006', 'Thor', 'Rottweiler', 'Preto', '45kg', 'Não', 'Cão', 'Veterinária 24h', 'Câncer', 'Cremapet', 'Individual', 'Pedro Oliveira', '789.123.456-54', '78.912.345-6', '06789-012', 'Rua São João, 987', '(11) 43210-9876', '(11) 7890-1234', 'pedro@email.com', 'Pedro Oliveira', 'PetVida', 'PV001', 'R$ 4.000,00', 'Laudo oncológico', 'R$ 1.500,00', 'Cremação individual premium', 'Cão guardião da família', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(7, '2025-01-07', 'Ricardo Gomes', 'L007', 'Princesa', 'Maltês', 'Branco', '3kg', 'Sim', 'Cão', 'Clínica Especializada', 'Problemas respiratórios', 'Cremapet', 'Individual', 'Carla Ferreira', '147.258.369-66', '14.725.836-9', '07890-123', 'Rua das Acácias, 147', '(11) 32109-8765', '(11) 8901-2345', 'carla@email.com', 'Carla Ferreira', 'Não', '', '', 'Receituário médico', 'R$ 750,00', 'Cremação individual', 'Cadela muito pequena e delicada', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(8, '2025-01-08', 'Monica Ribeiro', 'L008', 'Scooby', 'Dogue Alemão', 'Preto', '60kg', 'Não', 'Cão', 'Hospital Pet', 'Torção gástrica', 'Cremapet', 'Individual', 'Felipe Castro', '258.369.147-77', '25.836.914-7', '08901-234', 'Av. Ipiranga, 258', '(11) 21098-7654', '(11) 9012-3456', 'felipe@email.com', 'Felipe Castro', 'PetSafe', 'PS004', 'R$ 5.000,00', 'Relatório cirúrgico', 'R$ 2.000,00', 'Cremação individual especial', 'Cachorro gigante e gentil', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(9, '2025-01-09', 'Renato Costa', 'L009', 'Fifi', 'Poodle', 'Branco', '8kg', 'Não', 'Cão', 'Clínica Amigos', 'Pneumonia', 'Cremapet', 'Coletiva', 'Sandra Lima', '369.147.258-88', '36.914.725-8', '09012-345', 'Rua Aurora, 369', '(11) 10987-6543', '(11) 0123-4567', 'sandra@email.com', 'Sandra Lima', 'PetCare', 'PC001', 'R$ 2.200,00', 'Exames laboratoriais', 'R$ 550,00', 'Cremação coletiva', 'Poodle muito inteligente', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(10, '2025-01-10', 'Gustavo Nunes', 'L010', 'Simba', 'Maine Coon', 'Rajado', '8kg', 'Não', 'Gato', 'Pet Center', 'Insuficiência renal', 'Cremapet', 'Individual', 'Beatriz Rocha', '741.852.963-99', '74.185.296-3', '10123-456', 'Rua Consolação, 741', '(11) 09876-5432', '(11) 1234-5678', 'beatriz@email.com', 'Beatriz Rocha', 'Não', '', '', 'Histórico médico', 'R$ 850,00', 'Cremação individual', 'Gato de grande porte', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(11, '2025-01-11', 'Isabela Martins', 'L011', 'Lola', 'Chihuahua', 'Marrom', '2kg', 'Não', 'Cão', 'Residência', 'Idade avançada', 'Cremapet', 'Coletiva', 'Daniel Souza', '852.963.741-11', '85.296.374-1', '11234-567', 'Av. Rebouças, 852', '(11) 98765-4321', '(11) 2345-6789', 'daniel@email.com', 'Daniel Souza', 'PetPlus', 'PP001', 'R$ 1.500,00', 'Carteira de vacinação', 'R$ 400,00', 'Cremação coletiva', 'Cadela muito pequena', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(12, '2025-01-12', 'Thiago Silva', 'L012', 'Max', 'Pastor Alemão', 'Preto e marrom', '35kg', 'Não', 'Cão', 'Clínica Veterinária', 'Displasia', 'Cremapet', 'Individual', 'Raquel Santos', '963.741.852-22', '96.374.185-2', '12345-678', 'Rua Haddock Lobo, 963', '(11) 87654-3210', '(11) 3456-7890', 'raquel@email.com', 'Raquel Santos', 'PetSeguro', 'PS005', 'R$ 3.500,00', 'Raio-X', 'R$ 1.100,00', 'Cremação individual', 'Cão pastor muito leal', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(13, '2025-01-13', 'Camila Oliveira', 'L013', 'Nina', 'Persa', 'Cinza', '5kg', 'Não', 'Gato', 'Hospital Animal', 'Leucemia felina', 'Cremapet', 'Individual', 'Bruno Costa', '159.753.486-33', '15.975.348-6', '13456-789', 'Rua Augusta, 159', '(11) 76543-2109', '(11) 4567-8901', 'bruno@email.com', 'Bruno Costa', 'PetLife', 'PL003', 'R$ 2.800,00', 'Exames de sangue', 'R$ 950,00', 'Cremação individual', 'Gata persa muito elegante', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(14, '2025-01-14', 'Eduardo Ferreira', 'L014', 'Bidu', 'Vira-lata', 'Preto', '20kg', 'Não', 'Cão', 'Clínica Pet', 'Envenenamento', 'Cremapet', 'Coletiva', 'Vanessa Lima', '753.486.159-44', '75.348.615-9', '14567-890', 'Av. Faria Lima, 753', '(11) 65432-1098', '(11) 5678-9012', 'vanessa@email.com', 'Vanessa Lima', 'Não', '', '', 'Laudo toxicológico', 'R$ 650,00', 'Cremação coletiva', 'Cachorro muito brincalhão', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(15, '2025-01-15', 'Larissa Pereira', 'L015', 'Pipoca', 'Hamster', 'Dourado', '150g', 'Não', 'Roedor', 'Residência', 'Idade avançada', 'Cremapet', 'Coletiva', 'Rodrigo Alves', '486.159.753-55', '48.615.975-3', '15678-901', 'Rua Oscar Freire, 486', '(11) 54321-0987', '(11) 6789-0123', 'rodrigo@email.com', 'Rodrigo Alves', 'PetMini', 'PM001', 'R$ 800,00', 'Ficha clínica', 'R$ 200,00', 'Cremação coletiva', 'Hamster muito ativo', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(16, '2025-01-16', 'Fabiana Santos', 'L016', 'Beethoven', 'São Bernardo', 'Marrom e branco', '70kg', 'Não', 'Cão', 'Veterinária Especializada', 'Problemas cardíacos', 'Cremapet', 'Individual', 'Marcelo Ribeiro', '357.159.486-66', '35.715.948-6', '16789-012', 'Rua Bela Vista, 357', '(11) 43210-9876', '(11) 7890-1234', 'marcelo@email.com', 'Marcelo Ribeiro', 'PetGigante', 'PG001', 'R$ 6.000,00', 'Eletrocardiograma', 'R$ 2.500,00', 'Cremação individual especial', 'Cão gigante e protetor', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(17, '2025-01-17', 'Mariana Costa', 'L017', 'Mel', 'Cocker Spaniel', 'Dourado', '12kg', 'Não', 'Cão', 'Clínica Animal', 'Câncer', 'Cremapet', 'Individual', 'Henrique Gomes', '159.486.357-77', '15.948.635-7', '17890-123', 'Av. Paulista, 159', '(11) 32109-8765', '(11) 8901-2345', 'henrique@email.com', 'Henrique Gomes', 'PetCare', 'PC002', 'R$ 3.200,00', 'Biópsia', 'R$ 1.300,00', 'Cremação individual', 'Cadela muito meiga', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(18, '2025-01-18', 'Rafael Oliveira', 'L018', 'Garfield', 'Persa', 'Laranja', '7kg', 'Não', 'Gato', 'Pet Hospital', 'Obstrução intestinal', 'Cremapet', 'Individual', 'Cristina Martins', '486.357.159-88', '48.635.715-9', '18901-234', 'Rua Alameda, 486', '(11) 21098-7654', '(11) 9012-3456', 'cristina@email.com', 'Cristina Martins', 'PetSeguro', 'PS006', 'R$ 2.600,00', 'Ultrassom', 'R$ 900,00', 'Cremação individual', 'Gato muito guloso', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(19, '2025-01-19', 'Aline Ferreira', 'L019', 'Bolt', 'Border Collie', 'Preto e branco', '22kg', 'Não', 'Cão', 'Clínica Veterinária', 'Acidente', 'Cremapet', 'Individual', 'Leandro Silva', '357.486.159-99', '35.748.615-9', '19012-345', 'Rua Vergueiro, 357', '(11) 10987-6543', '(11) 0123-4567', 'leandro@email.com', 'Leandro Silva', 'PetActive', 'PA001', 'R$ 4.200,00', 'Relatório de emergência', 'R$ 1.800,00', 'Cremação individual', 'Cão muito ativo e inteligente', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(20, '2025-01-20', 'Priscila Lima', 'L020', 'Mia', 'Siamês', 'Bege', '4kg', 'Não', 'Gato', 'Residência', 'Complicações no parto', 'Cremapet', 'Coletiva', 'Anderson Costa', '486.159.357-00', '48.615.935-7', '20123-456', 'Av. Ibirapuera, 486', '(11) 09876-5432', '(11) 1234-5678', 'anderson@email.com', 'Anderson Costa', 'Não', '', '', 'Ficha reprodutiva', 'R$ 500,00', 'Cremação coletiva', 'Gata muito carinhosa', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(21, '2025-01-21', 'Vinicius Santos', 'L021', 'Lucky', 'Beagle', 'Tricolor', '18kg', 'Não', 'Cão', 'Hospital Pet', 'Epilepsia', 'Cremapet', 'Individual', 'Tatiana Oliveira', '159.357.486-11', '15.935.748-6', '21234-567', 'Rua Jardins, 159', '(11) 98765-4321', '(11) 2345-6789', 'tatiana@email.com', 'Tatiana Oliveira', 'PetHealth', 'PH001', 'R$ 3.000,00', 'Eletroencefalograma', 'R$ 1.200,00', 'Cremação individual', 'Cão muito esperto', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(22, '2025-01-22', 'Roberta Alves', 'L022', 'Zoe', 'York Shire', 'Preto e dourado', '3kg', 'Sim', 'Cão', 'Clínica Especializada', 'Problemas cardíacos', 'Cremapet', 'Individual', 'Guilherme Pereira', '357.159.486-22', '35.715.948-6', '22345-678', 'Av. Brigadeiro, 357', '(11) 87654-3210', '(11) 3456-7890', 'guilherme@email.com', 'Guilherme Pereira', 'PetMicro', 'PM002', 'R$ 2.400,00', 'Holter cardíaco', 'R$ 1.000,00', 'Cremação individual', 'Cadela muito pequena e frágil', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(23, '2025-01-23', 'Fernanda Costa', 'L023', 'Toby', 'Pug', 'Bege', '10kg', 'Não', 'Cão', 'Pet Center', 'Síndrome braquicefálica', 'Cremapet', 'Individual', 'Ricardo Martins', '486.357.159-33', '48.635.715-9', '23456-789', 'Rua Liberdade, 486', '(11) 76543-2109', '(11) 4567-8901', 'ricardo@email.com', 'Ricardo Martins', 'PetBreath', 'PB001', 'R$ 2.800,00', 'Tomografia', 'R$ 1.150,00', 'Cremação individual', 'Cão com problemas respiratórios', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(24, '2025-01-24', 'Daniela Ribeiro', 'L024', 'Safira', 'Ragdoll', 'Azul', '6kg', 'Não', 'Gato', 'Clínica Animal', 'Cardiomiopatia', 'Cremapet', 'Individual', 'Thiago Souza', '159.486.357-44', '15.948.635-7', '24567-890', 'Av. Consolação, 159', '(11) 65432-1098', '(11) 5678-9012', 'thiago@email.com', 'Thiago Souza', 'PetHeart', 'PH002', 'R$ 3.400,00', 'Ecocardiograma', 'R$ 1.400,00', 'Cremação individual', 'Gata muito dócil', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(25, '2025-01-25', 'Bruno Ferreira', 'L025', 'Spike', 'Pitbull', 'Cinza', '28kg', 'Não', 'Cão', 'Hospital Veterinário', 'Torção gástrica', 'Cremapet', 'Individual', 'Patrícia Lima', '357.486.159-55', '35.748.615-9', '25678-901', 'Rua Bela Cintra, 357', '(11) 54321-0987', '(11) 6789-0123', 'patricia@email.com', 'Patrícia Lima', 'PetStrong', 'PS007', 'R$ 4.500,00', 'Cirurgia de emergência', 'R$ 1.900,00', 'Cremação individual', 'Cão muito forte e leal', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(26, '2025-01-26', 'Juliana Gomes', 'L026', 'Pandora', 'Gato sem raça', 'Preta', '4kg', 'Não', 'Gato', 'Residência', 'Atropelamento', 'Cremapet', 'Coletiva', 'Marcos Oliveira', '486.159.357-66', '48.615.935-7', '26789-012', 'Av. Rebouças, 486', '(11) 43210-9876', '(11) 7890-1234', 'marcos@email.com', 'Marcos Oliveira', 'Não', '', '', 'Boletim de ocorrência', 'R$ 550,00', 'Cremação coletiva', 'Gata muito independente', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(27, '2025-01-27', 'Leandro Silva', 'L027', 'Marley', 'Labrador', 'Chocolate', '32kg', 'Não', 'Cão', 'Clínica Pet', 'Câncer ósseo', 'Cremapet', 'Individual', 'Carolina Santos', '159.357.486-77', '15.935.748-6', '27890-123', 'Rua Oscar Freire, 159', '(11) 32109-8765', '(11) 8901-2345', 'carolina@email.com', 'Carolina Santos', 'PetBone', 'PB002', 'R$ 5.200,00', 'Cintilografia óssea', 'R$ 2.100,00', 'Cremação individual', 'Cão muito brincalhão', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(28, '2025-01-28', 'Patricia Martins', 'L028', 'Jade', 'Angorá', 'Branco', '5kg', 'Não', 'Gato', 'Pet Hospital', 'Diabetes', 'Cremapet', 'Individual', 'Rafael Costa', '357.159.486-88', '35.715.948-6', '28901-234', 'Av. Ipiranga, 357', '(11) 21098-7654', '(11) 9012-3456', 'rafael@email.com', 'Rafael Costa', 'PetDiabetes', 'PD001', 'R$ 2.700,00', 'Exames glicêmicos', 'R$ 1.050,00', 'Cremação individual', 'Gata muito elegante', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(29, '2025-01-29', 'Rodrigo Oliveira', 'L029', 'Marley', 'Weimaraner', 'Cinza', '38kg', 'Não', 'Cão', 'Clínica Veterinária', 'Hemorragia interna', 'Cremapet', 'Individual', 'Luciana Pereira', '486.357.159-99', '48.635.715-9', '29012-345', 'Rua Augusta, 486', '(11) 10987-6543', '(11) 0123-4567', 'luciana@email.com', 'Luciana Pereira', 'PetEmergency', 'PE001', 'R$ 4.800,00', 'Hemograma completo', 'R$ 2.000,00', 'Cremação individual', 'Cão muito elegante e ativo', '2025-07-09 23:40:20', '2025-07-09 23:40:20'),
(30, '2025-01-30', 'Carla Santos', 'L030', 'Olívia', 'Schnauzer', 'Sal e pimenta', '14kg', 'Não', 'Cão', 'Hospital Animal', 'Insuficiência renal', 'Cremapet', 'Individual', 'Eduardo Lima', '159.486.357-00', '15.948.635-7', '30123-456', 'Av. Faria Lima, 159', '(11) 09876-5432', '(11) 1234-5678', 'eduardo@email.com', 'Eduardo Lima', 'PetKidney', 'PK001', 'R$ 3.600,00', 'Exames renais', 'R$ 1.500,00', 'Cremação individual', 'Cadela muito inteligente', '2025-07-09 23:40:20', '2025-07-09 23:40:20');

-- ================================================
-- TABELA: prestadoras
-- ================================================

-- Estrutura da tabela prestadoras
-- Colunas: id (integer), nome (character varying), cnpj (character varying), telefone (character varying), email (character varying), endereco (text), bairro (character varying), cidade (character varying), estado (character varying), cep (character varying), numero_endereco (character varying), complemento (character varying), servicos (text), valor_padrao (numeric), observacoes (text), ativo (boolean), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `prestadoras`;

INSERT INTO `prestadoras` (`id`, `nome`, `cnpj`, `telefone`, `email`, `endereco`, `bairro`, `cidade`, `estado`, `cep`, `numero_endereco`, `complemento`, `servicos`, `valor_padrao`, `observacoes`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 'Seguradora Vida & Morte', '50.000.000/0001-00', '(11) 2000-3000', 'atendimento@vidaemorte.com.br', 'Av. Paulista', 'Bela Vista', 'São Paulo', 'SP', '05000-000', '1500', 'Andar 25', 'Seguros funerários completos', 2500.00, 'Seguradora com 20 anos de mercado', 1, '2025-07-08 15:22:15', '2025-07-08 15:22:15'),
(2, 'Plano Familiar Ltda', '60.000.000/0001-11', '(11) 3000-4000', 'contato@planofamiliar.com.br', 'Rua Augusta', 'Consolação', 'São Paulo', 'SP', '06000-000', '800', 'Sala 12', 'Planos funerários para famílias', 1800.00, 'Especializada em planos familiares', 1, '2025-07-08 15:22:15', '2025-07-08 15:22:15'),
(3, 'Translado Express', '70.000.000/0001-22', '(11) 4000-5000', 'operacoes@transladoexpress.com.br', 'Rua das Palmeiras', 'Vila Olímpia', 'São Paulo', 'SP', '07000-000', '250', NULL, 'Serviços de translado e remoção', 800.00, 'Atendimento 24h', 1, '2025-07-08 15:22:15', '2025-07-08 15:22:15');

-- ================================================
-- TABELA: produtos
-- ================================================

-- Estrutura da tabela produtos
-- Colunas: id (integer), nome (text), descricao (text), categoria (text), codigo_interno (character varying), unidade_medida (character varying), estoque_minimo (integer), estoque_atual (integer), observacoes (text), ativo (boolean), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `produtos`;

INSERT INTO `produtos` (`id`, `nome`, `descricao`, `categoria`, `codigo_interno`, `unidade_medida`, `estoque_minimo`, `estoque_atual`, `observacoes`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 'Coroa de Flores Tradicional', 'Coroa de flores naturais com fita de seda personalizada', 'Flores', 'CF001', 'un', 5, 12, 'Disponível em várias cores', 1, '2025-07-08 15:21:35', '2025-07-08 15:21:35'),
(2, 'Buquê de Rosas Brancas', 'Buquê com 12 rosas brancas naturais', 'Flores', 'BR001', 'un', 3, 8, 'Ideal para velórios', 1, '2025-07-08 15:21:35', '2025-07-08 15:21:35'),
(3, 'Urna Modelo Luxo', 'Urna em madeira nobre com acabamento especial', 'Urnas', 'UL001', 'un', 2, 5, 'Acabamento premium', 1, '2025-07-08 15:21:35', '2025-07-08 15:21:35'),
(4, 'Urna Modelo Simples', 'Urna em MDF com acabamento básico', 'Urnas', 'US001', 'un', 3, 7, 'Modelo econômico', 1, '2025-07-08 15:21:35', '2025-07-08 15:21:35'),
(5, 'Vela Votiva Grande', 'Vela votiva de 7 dias, cor branca', 'Velas', 'VV001', 'un', 10, 25, 'Queima por 7 dias', 1, '2025-07-08 15:21:35', '2025-07-08 15:21:35'),
(6, 'Terço de Madeira', 'Terço confeccionado em madeira sagrada', 'Religiosos', 'TM001', 'un', 5, 15, 'Artesanal', 1, '2025-07-08 15:21:35', '2025-07-08 15:21:35');

-- ================================================
-- TABELA: produtos_fornecedores
-- ================================================

-- Estrutura da tabela produtos_fornecedores
-- Colunas: id (integer), produto_id (integer), fornecedor_id (integer), preco (numeric), codigo_fornecedor (character varying), tempo_entrega (integer), observacoes (text), ativo (boolean), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `produtos_fornecedores`;

INSERT INTO `produtos_fornecedores` (`id`, `produto_id`, `fornecedor_id`, `preco`, `codigo_fornecedor`, `tempo_entrega`, `observacoes`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 1, 1, 180.00, 'FL-CF001', 2, 'Coroa tradicional - Flores Eternas', 1, '2025-07-08 15:21:39', '2025-07-08 15:21:39'),
(2, 2, 1, 120.00, 'FL-BR001', 1, 'Buquê rosas - Flores Eternas', 1, '2025-07-08 15:21:39', '2025-07-08 15:21:39'),
(3, 3, 2, 1200.00, 'UR-LX001', 5, 'Urna luxo - Urnas & Cia', 1, '2025-07-08 15:21:39', '2025-07-08 15:21:39'),
(4, 4, 2, 450.00, 'UR-SM001', 3, 'Urna simples - Urnas & Cia', 1, '2025-07-08 15:21:39', '2025-07-08 15:21:39'),
(5, 5, 4, 15.00, 'VL-VT001', 1, 'Vela votiva - Velas Sagradas', 1, '2025-07-08 15:21:39', '2025-07-08 15:21:39'),
(6, 6, 4, 25.00, 'RL-TM001', 2, 'Terço madeira - Velas Sagradas', 1, '2025-07-08 15:21:39', '2025-07-08 15:21:39');

-- ================================================
-- TABELA: produtos_ordem_servico
-- ================================================

-- Estrutura da tabela produtos_ordem_servico
-- Colunas: id (integer), ordem_servico_id (integer), produto_id (integer), quantidade (numeric), valor (numeric), tipo (text), nome (text), categoria (text), nota_contratual_id (integer), numero_nc (character varying), disponivel (boolean)

TRUNCATE TABLE `produtos_ordem_servico`;

INSERT INTO `produtos_ordem_servico` (`id`, `ordem_servico_id`, `produto_id`, `quantidade`, `valor`, `tipo`, `nome`, `categoria`, `nota_contratual_id`, `numero_nc`, `disponivel`) VALUES
(5, 1, NULL, 1.00, 0, 'veiculo', 'Translado Municipal', 'Veículo/Motorista', NULL, NULL, 1),
(9, 1, NULL, 1.00, 0, 'veiculo', 'Sepultamento', 'Veículo/Motorista', NULL, NULL, 1),
(10, 1, NULL, 1.00, 0, 'servico', 'Plano Familiar Ltda', 'servico', NULL, NULL, 1),
(11, 1, NULL, 1.00, 0, 'servico', 'Seguradora Vida & Morte', 'servico', NULL, NULL, 1),
(12, 2, NULL, 1.00, 0, 'veiculo', 'Translado Intermunicipal', 'Veículo/Motorista', NULL, NULL, 1),
(23, 2, 1, 1.02, 183.60, 'produto', 'Coroa de Flores Tradicional', 'Flores', NULL, NULL, 1),
(24, 2, NULL, 1.00, 200, 'veiculo', 'Sepultamento', 'Veículo/Motorista', NULL, NULL, 1),
(25, 2, NULL, 1.00, 0, 'veiculo', 'Sepultamento', 'Veículo/Motorista', NULL, NULL, 1);

-- ================================================
-- TABELA: produtos_os
-- ================================================

-- Estrutura da tabela produtos_os
-- Colunas: id (integer), ordem_servico_id (integer), tipo (character varying), produto_id (integer), fornecedor_id (integer), prestadora_id (integer), nome (character varying), descricao (text), categoria (character varying), quantidade (numeric), valor_unitario (numeric), valor_total (numeric), observacoes (text), ativo (boolean), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `produtos_os`;

INSERT INTO `produtos_os` (`id`, `ordem_servico_id`, `tipo`, `produto_id`, `fornecedor_id`, `prestadora_id`, `nome`, `descricao`, `categoria`, `quantidade`, `valor_unitario`, `valor_total`, `observacoes`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 1, 'produto', 1, 1, NULL, 'Coroa de Flores Tradicional', 'Coroa de flores naturais para velório', 'Flores', 1.00, 180.00, 180.00, 'Entregue no velório', 1, '2025-07-08 15:22:47', '2025-07-08 15:22:47'),
(2, 1, 'produto', 5, 4, NULL, 'Vela Votiva Grande', 'Vela votiva de 7 dias', 'Velas', 4.00, 15.00, 60.00, 'Para altar do velório', 1, '2025-07-08 15:22:47', '2025-07-08 15:22:47'),
(3, 1, 'servico', NULL, NULL, 1, 'Serviço de Velório', 'Velório completo com assistência', 'Serviços', 1.00, 1200.00, 1200.00, 'Inclui preparo e assistência', 1, '2025-07-08 15:22:47', '2025-07-08 15:22:47'),
(4, 2, 'produto', 3, 2, NULL, 'Urna Modelo Luxo', 'Urna premium em madeira nobre', 'Urnas', 1.00, 1200.00, 1200.00, 'Conforme solicitação da família', 1, '2025-07-08 15:22:47', '2025-07-08 15:22:47'),
(5, 2, 'produto', 2, 1, NULL, 'Buquê de Rosas Brancas', 'Buquê especial com rosas brancas', 'Flores', 2.00, 120.00, 240.00, 'Para decoração', 1, '2025-07-08 15:22:47', '2025-07-08 15:22:47'),
(6, 3, 'produto', 4, 2, NULL, 'Urna Modelo Simples', 'Urna em MDF acabamento básico', 'Urnas', 1.00, 450.00, 450.00, 'Conforme plano básico', 1, '2025-07-08 15:22:47', '2025-07-08 15:22:47');

-- ================================================
-- TABELA: servicos_motorista
-- ================================================

-- Estrutura da tabela servicos_motorista
-- Colunas: id (integer), nome (character varying), descricao (text), valor_padrao (numeric), ativo (boolean), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `servicos_motorista`;

INSERT INTO `servicos_motorista` (`id`, `nome`, `descricao`, `valor_padrao`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 'Translado Municipal', 'Serviço de translado dentro da cidade', 300.00, 1, '2025-07-08 15:28:24', '2025-07-08 15:28:24'),
(2, 'Translado Intermunicipal', 'Serviço de translado entre cidades', 500.00, 1, '2025-07-08 15:28:24', '2025-07-08 15:28:24'),
(3, 'Velório com Motorista', 'Acompanhamento durante velório', 250.00, 1, '2025-07-08 15:28:24', '2025-07-08 15:28:24'),
(4, 'Sepultamento', 'Transporte para sepultamento', 200.00, 1, '2025-07-08 15:28:24', '2025-07-08 15:28:24'),
(5, 'Cremação', 'Transporte para cremação', 350.00, 1, '2025-07-08 15:28:24', '2025-07-08 15:28:24'),
(6, 'Remoção Hospitalar', 'Remoção de hospital/local', 150.00, 1, '2025-07-08 15:28:24', '2025-07-08 15:28:24');

-- ================================================
-- TABELA: session
-- ================================================

-- Estrutura da tabela session
-- Colunas: sid (character varying), sess (json), expire (timestamp without time zone)

TRUNCATE TABLE `session`;

INSERT INTO `session` (`sid`, `sess`, `expire`) VALUES
('0dCWjpgCtkWnsvI1HQ29ItXVDAp17S9q', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-10T22:17:20.805Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}', '2025-07-10 23:13:13'),
('77ZI_F6LUmN9BX-NEqmReSEMEkW_lxVr', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-10T22:04:43.359Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}', '2025-07-10 22:04:49'),
('ChJ1XWrlGsqRVZ48yV7zXtmhN0vTDIvr', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-10T23:55:13.940Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":3}}', '2025-07-11 04:54:54'),
('QtEx8gFNJsl9Lk29W86kDrlGQLa36vQo', '{"cookie":{"originalMaxAge":86400000,"expires":"2025-07-10T22:18:25.224Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":3}}', '2025-07-11 00:45:42');

-- ================================================
-- TABELA: usuarios
-- ================================================

-- Estrutura da tabela usuarios
-- Colunas: id (integer), email (text), senha (text), nome (text), ativo (boolean), criado_em (timestamp without time zone)

TRUNCATE TABLE `usuarios`;

INSERT INTO `usuarios` (`id`, `email`, `senha`, `nome`, `ativo`, `criado_em`) VALUES
(1, 'admin@admin.com', 'b8fc249f4368e03207c96defca70ccc605182d6a718f9dbc2ea60c9af518cc2d:9fb7a26c8e516776d45c0f53ef53d636ae73952788b65d09a6749cca6f2e9f7b', 'Administrador', 1, '2025-07-09 21:08:17'),
(3, 'willwill34@gmail.com', '6557e7ce0dacf28a793cc66e3fa4b2baecdc2c180fceacee80298a8f3ba600bf:ed46fc7703cbf3b86e70c03726d0bf06fd9833f9f48a7cf40360573a77edd3b6', 'Produto Teste', 1, '2025-07-09 06:36:13');

-- ================================================
-- TABELA: usuarios_online
-- ================================================

-- Estrutura da tabela usuarios_online
-- Colunas: usuario_id (integer), ultima_atividade (timestamp without time zone)

TRUNCATE TABLE `usuarios_online`;

INSERT INTO `usuarios_online` (`usuario_id`, `ultima_atividade`) VALUES
(2, '2025-07-09 06:29:55');

-- ================================================
-- TABELA: veiculos
-- ================================================

-- Estrutura da tabela veiculos
-- Colunas: id (integer), placa (character varying), modelo (character varying), marca (character varying), ano (integer), cor (character varying), chassi (character varying), renavam (character varying), combustivel (character varying), capacidade (integer), categoria (character varying), ativo (boolean), observacoes (text), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

TRUNCATE TABLE `veiculos`;

INSERT INTO `veiculos` (`id`, `placa`, `modelo`, `marca`, `ano`, `cor`, `chassi`, `renavam`, `combustivel`, `capacidade`, `categoria`, `ativo`, `observacoes`, `criado_em`, `atualizado_em`) VALUES
(1, 'ABC1234', 'Ambulância Sprinter', 'Mercedes-Benz', 2022, 'Branco', NULL, NULL, NULL, NULL, 'ambulancia', 1, NULL, '2025-07-08 17:39:25', '2025-07-08 17:39:25'),
(2, 'DEF5678', 'Translado Iveco', 'Iveco', 2021, 'Prata', NULL, NULL, NULL, NULL, 'funeraria', 1, NULL, '2025-07-08 17:39:25', '2025-07-08 17:39:25'),
(3, 'GHI9012', 'Van Ducato', 'Fiat', 2020, 'Branco', NULL, NULL, NULL, NULL, 'transporte', 1, NULL, '2025-07-08 17:39:25', '2025-07-08 17:39:25'),
(4, 'JKL3456', 'Master Funerária', 'Renault', 2023, 'Preto', NULL, NULL, NULL, NULL, 'funeraria', 1, NULL, '2025-07-08 17:39:25', '2025-07-08 17:39:25'),
(5, 'MNO7890', 'Sprinter Funeral', 'Mercedes-Benz', 2022, 'Azul Escuro', NULL, NULL, NULL, NULL, 'funeraria', 1, NULL, '2025-07-08 17:39:25', '2025-07-08 17:39:25');

-- ================================================
-- TABELA: veiculos_os
-- ================================================

-- Estrutura da tabela veiculos_os
-- Colunas: id (integer), ordem_servico_id (integer), motorista_id (integer), viatura_id (integer), tipo_servico (character varying), endereco_retirada (text), endereco_destino (text), tipo_veiculo (text), placa_veiculo (text), observacoes (text), data_hora_chamada (timestamp without time zone), data_hora_saida (timestamp without time zone), data_hora_chegada (timestamp without time zone), valor (numeric), status (text), checklist_saida (boolean), checklist_chegada (boolean), criado_em (timestamp without time zone), atualizado_em (timestamp without time zone)

-- Tabela veiculos_os está vazia

-- ================================================
-- FIM DO BACKUP
-- ================================================

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;
