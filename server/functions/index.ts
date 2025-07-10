/**
 * ÍNDICE DE FUNÇÕES MODULARES
 * 
 * Este arquivo centraliza todas as importações das funções modulares.
 * Facilita o uso das funções em rotas e outros arquivos do sistema.
 * 
 * ESTRUTURA ORGANIZACIONAL:
 * - Principais: usuarios, obitos, ordens-servico, calendario
 * - Gestão: fornecedores, prestadoras, produtos, motoristas
 * - Relacionamentos: contratos, pendencias, documentos
 * - Sistema: logs-auditoria
 * 
 * COMO USAR:
 * import { validarUsuario, formatarCNPJ, calcularTotalOrdem } from '../functions';
 * 
 * MANUTENÇÃO:
 * - Para adicionar nova categoria, criar arquivo em functions/ e exportar aqui
 * - Manter organização por categorias para fácil localização
 */

// ===== FUNÇÕES PRINCIPAIS =====
export * from './usuarios';
export * from './obitos';
export * from './ordens-servico';
export * from './calendario';

// ===== FUNÇÕES DE GESTÃO =====
export * from './fornecedores';
export * from './prestadoras';
export * from './produtos';
export * from './motoristas';

// ===== FUNÇÕES DE RELACIONAMENTOS =====
export * from './contratos';
export * from './pendencias';
export * from './documentos';

// ===== FUNÇÕES DE SISTEMA =====
export * from './logs-auditoria';

/**
 * CONVENÇÕES DE NOMENCLATURA
 * 
 * Todas as funções seguem padrões consistentes:
 * - validar*(): Para validações de dados
 * - formatar*(): Para formatação de exibição
 * - processar*(): Para processamento de dados
 * - calcular*(): Para cálculos e métricas
 * - buscar*(): Para filtros e pesquisas
 * - gerar*(): Para geração de códigos/relatórios
 * 
 * EXEMPLOS DE USO:
 * 
 * // Validações
 * const { valido, erros } = validarUsuario(dadosUsuario);
 * const cnpjValido = validarCNPJ(cnpj);
 * 
 * // Formatações
 * const precoFormatado = formatarPreco(1500.50); // "R$ 1.500,50"
 * const cnpjFormatado = formatarCNPJ("12345678000195"); // "12.345.678/0001-95"
 * 
 * // Processamento
 * const dadosLimpos = processarDadosUsuario(dadosBrutos);
 * const statusAtual = processarStatusProduto(produto);
 * 
 * // Cálculos
 * const total = calcularValorTotalEstoque(produtos);
 * const diasRestantes = calcularDiasRestantes(prazo);
 * 
 * // Buscas e filtros
 * const ativos = buscarProdutosAtivos(produtos);
 * const pendentesUrgentes = buscarPendenciasUrgentes(pendencias);
 * 
 * // Geradores
 * const codigo = gerarCodigoProduto("Categoria", 123);
 * const relatorio = gerarRelatorioContratos(contratos);
 */