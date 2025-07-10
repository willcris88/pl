/**
 * FUNÇÕES DE DOCUMENTOS
 * 
 * Este arquivo contém todas as funções relacionadas aos documentos:
 * - Validações específicas de documentos
 * - Formatações de nomes e caminhos
 * - Processamento de uploads
 * - Cálculos de tamanhos e estatísticas
 * - Utilitários de busca e filtros
 * - Geradores de relatórios
 */

import path from "path";
import fs from "fs/promises";

/**
 * VALIDAÇÕES DE DOCUMENTOS
 */

/**
 * Valida se um arquivo é permitido para upload
 */
export function validarArquivoPermitido(nomeArquivo: string, tamanho: number): {
  valido: boolean;
  erro?: string;
} {
  // Tipos permitidos
  const tiposPermitidos = [
    '.pdf', '.doc', '.docx', '.txt', '.rtf',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
    '.xls', '.xlsx', '.csv',
    '.zip', '.rar', '.7z'
  ];

  const extensao = path.extname(nomeArquivo).toLowerCase();
  
  if (!tiposPermitidos.includes(extensao)) {
    return {
      valido: false,
      erro: `Tipo de arquivo não permitido: ${extensao}`
    };
  }

  // Tamanho máximo: 50MB
  const tamanhoMaximo = 50 * 1024 * 1024;
  if (tamanho > tamanhoMaximo) {
    return {
      valido: false,
      erro: `Arquivo muito grande. Máximo: 50MB`
    };
  }

  return { valido: true };
}

/**
 * Valida dados de documento antes de salvar
 */
export function validarDocumento(documento: any): {
  valido: boolean;
  erros: string[];
} {
  const erros: string[] = [];

  if (!documento.ordemServicoId) {
    erros.push("ID da ordem de serviço é obrigatório");
  }

  if (!documento.nome || documento.nome.trim().length === 0) {
    erros.push("Nome do arquivo é obrigatório");
  }

  if (!documento.caminho || documento.caminho.trim().length === 0) {
    erros.push("Caminho do arquivo é obrigatório");
  }

  if (documento.tamanho && documento.tamanho < 0) {
    erros.push("Tamanho do arquivo deve ser positivo");
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

/**
 * FORMATAÇÕES DE DOCUMENTOS
 */

/**
 * Formata o nome do arquivo removendo caracteres especiais
 */
export function formatarNomeArquivo(nomeOriginal: string): string {
  // Remove caracteres especiais e espaços
  const nomeSeguro = nomeOriginal
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();

  // Adiciona timestamp se necessário para evitar duplicatas
  const extensao = path.extname(nomeSeguro);
  const nomeSemExtensao = path.basename(nomeSeguro, extensao);
  const timestamp = Date.now();

  return `${nomeSemExtensao}_${timestamp}${extensao}`;
}

/**
 * Formata o tamanho do arquivo em formato legível
 */
export function formatarTamanhoArquivo(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formata o tipo de arquivo para exibição
 */
export function formatarTipoArquivo(extensao: string): string {
  const tipos: { [key: string]: string } = {
    '.pdf': 'Documento PDF',
    '.doc': 'Documento Word',
    '.docx': 'Documento Word',
    '.txt': 'Arquivo de Texto',
    '.rtf': 'Rich Text Format',
    '.jpg': 'Imagem JPEG',
    '.jpeg': 'Imagem JPEG',
    '.png': 'Imagem PNG',
    '.gif': 'Imagem GIF',
    '.bmp': 'Imagem Bitmap',
    '.webp': 'Imagem WebP',
    '.xls': 'Planilha Excel',
    '.xlsx': 'Planilha Excel',
    '.csv': 'Arquivo CSV',
    '.zip': 'Arquivo Comprimido',
    '.rar': 'Arquivo RAR',
    '.7z': 'Arquivo 7-Zip'
  };

  return tipos[extensao.toLowerCase()] || 'Arquivo';
}

/**
 * PROCESSAMENTO DE DOCUMENTOS
 */

/**
 * Processa um arquivo recém-enviado
 */
export async function processarArquivoUpload(arquivo: any, ordemServicoId: number): Promise<{
  sucesso: boolean;
  documento?: any;
  erro?: string;
}> {
  try {
    // Validar arquivo
    const validacao = validarArquivoPermitido(arquivo.originalname, arquivo.size);
    if (!validacao.valido) {
      return {
        sucesso: false,
        erro: validacao.erro
      };
    }

    // Gerar nome seguro
    const nomeSeguro = formatarNomeArquivo(arquivo.originalname);
    const extensao = path.extname(arquivo.originalname);

    // Preparar dados do documento
    const documento = {
      ordemServicoId,
      nome: arquivo.originalname,
      caminho: arquivo.path,
      tamanho: arquivo.size,
      tipo: extensao,
      ordem: 0
    };

    return {
      sucesso: true,
      documento
    };
  } catch (error) {
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Processa reordenação de documentos
 */
export function processarReordenacaoDocumentos(documentos: any[]): {
  valido: boolean;
  documentosOrdenados: { id: number; ordem: number }[];
  erro?: string;
} {
  try {
    const documentosOrdenados = documentos.map((doc, index) => ({
      id: doc.id,
      ordem: index
    }));

    return {
      valido: true,
      documentosOrdenados
    };
  } catch (error) {
    return {
      valido: false,
      documentosOrdenados: [],
      erro: error instanceof Error ? error.message : 'Erro na reordenação'
    };
  }
}

/**
 * CÁLCULOS E ESTATÍSTICAS
 */

/**
 * Calcula estatísticas de documentos de uma ordem
 */
export function calcularEstatisticasDocumentos(documentos: any[]): {
  totalDocumentos: number;
  totalTamanho: number;
  tiposPorCategoria: { [key: string]: number };
  tamanhoFormatado: string;
} {
  const estatisticas = {
    totalDocumentos: documentos.length,
    totalTamanho: 0,
    tiposPorCategoria: {} as { [key: string]: number },
    tamanhoFormatado: '0 B'
  };

  documentos.forEach(doc => {
    // Somar tamanho total
    estatisticas.totalTamanho += doc.tamanho || 0;

    // Contar tipos por categoria
    const categoria = obterCategoriaArquivo(doc.tipo || '');
    estatisticas.tiposPorCategoria[categoria] = (estatisticas.tiposPorCategoria[categoria] || 0) + 1;
  });

  estatisticas.tamanhoFormatado = formatarTamanhoArquivo(estatisticas.totalTamanho);

  return estatisticas;
}

/**
 * Calcula espaço necessário para processamento
 */
export function calcularEspacoProcessamento(documentos: any[]): {
  espacoNecessario: number;
  espacoDisponivel: number;
  suficiente: boolean;
} {
  const espacoNecessario = documentos.reduce((total, doc) => total + (doc.tamanho || 0), 0) * 2; // 2x para processamento
  const espacoDisponivel = 1024 * 1024 * 1024; // 1GB estimado

  return {
    espacoNecessario,
    espacoDisponivel,
    suficiente: espacoNecessario <= espacoDisponivel
  };
}

/**
 * BUSCAS E FILTROS
 */

/**
 * Busca documentos por nome
 */
export function buscarDocumentosPorNome(documentos: any[], termo: string): any[] {
  if (!termo || termo.trim().length === 0) {
    return documentos;
  }

  const termoLower = termo.toLowerCase();
  return documentos.filter(doc => 
    doc.nome.toLowerCase().includes(termoLower)
  );
}

/**
 * Busca documentos por tipo
 */
export function buscarDocumentosPorTipo(documentos: any[], tipo: string): any[] {
  if (!tipo || tipo === 'todos') {
    return documentos;
  }

  return documentos.filter(doc => {
    const categoria = obterCategoriaArquivo(doc.tipo || '');
    return categoria === tipo;
  });
}

/**
 * Busca documentos processáveis para PDF
 */
export function buscarDocumentosProcessaveis(documentos: any[]): any[] {
  const tiposProcessaveis = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  
  return documentos.filter(doc => 
    tiposProcessaveis.includes((doc.tipo || '').toLowerCase())
  );
}

/**
 * GERADORES
 */

/**
 * Gera relatório de documentos
 */
export function gerarRelatorioDocumentos(documentos: any[], ordemServicoId: number): {
  relatorio: string;
  estatisticas: any;
} {
  const estatisticas = calcularEstatisticasDocumentos(documentos);
  
  let relatorio = `RELATÓRIO DE DOCUMENTOS - ORDEM ${ordemServicoId}\n`;
  relatorio += `======================================================\n\n`;
  relatorio += `Total de Documentos: ${estatisticas.totalDocumentos}\n`;
  relatorio += `Tamanho Total: ${estatisticas.tamanhoFormatado}\n\n`;
  
  relatorio += `DOCUMENTOS POR CATEGORIA:\n`;
  relatorio += `----------------------------------------\n`;
  Object.entries(estatisticas.tiposPorCategoria).forEach(([categoria, quantidade]) => {
    relatorio += `${categoria}: ${quantidade} arquivo(s)\n`;
  });
  
  relatorio += `\nLISTA DE DOCUMENTOS:\n`;
  relatorio += `----------------------------------------\n`;
  documentos.forEach((doc, index) => {
    relatorio += `${index + 1}. ${doc.nome}\n`;
    relatorio += `   Tipo: ${formatarTipoArquivo(doc.tipo || '')}\n`;
    relatorio += `   Tamanho: ${formatarTamanhoArquivo(doc.tamanho || 0)}\n`;
    relatorio += `   Data: ${new Date(doc.criadoEm).toLocaleDateString('pt-BR')}\n\n`;
  });

  return { relatorio, estatisticas };
}

/**
 * Gera nome para PDF consolidado
 */
export function gerarNomePDFConsolidado(ordemServicoId: number): string {
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `Documentos_Consolidados_Ordem_${ordemServicoId}_${timestamp}.pdf`;
}

/**
 * UTILITÁRIOS AUXILIARES
 */

/**
 * Obtém categoria do arquivo baseada na extensão
 */
function obterCategoriaArquivo(extensao: string): string {
  const ext = extensao.toLowerCase();
  
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
    return 'imagem';
  }
  
  if (['.pdf'].includes(ext)) {
    return 'pdf';
  }
  
  if (['.doc', '.docx', '.txt', '.rtf'].includes(ext)) {
    return 'documento';
  }
  
  if (['.xls', '.xlsx', '.csv'].includes(ext)) {
    return 'planilha';
  }
  
  if (['.zip', '.rar', '.7z'].includes(ext)) {
    return 'comprimido';
  }
  
  return 'outros';
}

/**
 * Verifica se arquivo existe no sistema
 */
export async function verificarArquivoExiste(caminho: string): Promise<boolean> {
  try {
    await fs.access(caminho);
    return true;
  } catch {
    return false;
  }
}

/**
 * Limpa arquivos temporários antigos
 */
export async function limparArquivosTemporarios(diasAntigos: number = 7): Promise<{
  arquivosLimpos: number;
  espacoLiberado: number;
}> {
  // Esta função seria implementada para limpeza automática
  // Por enquanto retorna valores padrão
  return {
    arquivosLimpos: 0,
    espacoLiberado: 0
  };
}