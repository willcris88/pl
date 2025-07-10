/**
 * PÁGINA DE DOCUMENTOS
 * 
 * Sistema completo de gerenciamento de documentos com:
 * - Upload múltiplo de arquivos (PDF, imagens, documentos)
 * - Conversão automática de imagens para PDF
 * - Concatenação de todos os documentos em PDF único
 * - Reordenação por arrastar e soltar
 * - Visualização e download
 */

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ResponsiveLayout } from "@/components/layout/responsive-layout";
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  Camera,
  ArrowUp,
  ArrowDown,
  Combine,
  Eye,
  RefreshCw,
  ArrowLeft
} from "lucide-react";

interface Documento {
  id: number;
  nome: string;
  caminho: string;
  tamanho: number;
  tipo: string;
  ordem: number;
  consolidado: boolean;
  criadoEm: string;
}

interface EstatisticasDocumentos {
  totalDocumentos: number;
  imagensProcessaveis: number;
  pdfsProcessaveis: number;
  outrosDocumentos: number;
  tamanhoEstimado: string;
}

export default function DocumentosPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const ordemId = params.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  console.log("DocumentosPage carregando para ordem:", ordemId);

  // Query para buscar documentos
  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['/api/documentos', ordemId],
    queryFn: () => {
      console.log("Buscando documentos para ordem:", ordemId);
      return apiRequest('GET', `/api/documentos?ordemServicoId=${ordemId}`).then(res => res.json());
    },
    enabled: !!ordemId
  });

  // Query para estatísticas
  const { data: estatisticas } = useQuery<EstatisticasDocumentos>({
    queryKey: ['/api/documentos/estatisticas', ordemId],
    queryFn: () => apiRequest('GET', `/api/documentos/estatisticas/${ordemId}`).then(res => res.json()),
    enabled: !!ordemId
  });

  // Mutation para upload múltiplo
  const uploadMutation = useMutation({
    mutationFn: async (data: { arquivos: File[], processarAutomaticamente: boolean }) => {
      console.log("Iniciando upload de", data.arquivos.length, "arquivos");
      
      const formData = new FormData();
      formData.append('ordemServicoId', ordemId?.toString() || '');
      formData.append('processarAutomaticamente', data.processarAutomaticamente.toString());
      
      data.arquivos.forEach((arquivo, index) => {
        console.log(`Adicionando arquivo ${index + 1}:`, arquivo.name, arquivo.size, "bytes");
        formData.append('arquivos', arquivo);
      });

      console.log("Enviando FormData para /api/documentos/upload-multiplos");
      return apiRequest('POST', '/api/documentos/upload-multiplos', formData).then(res => {
        console.log("Resposta do upload:", res);
        return res.json();
      });
    },
    onSuccess: (data) => {
      console.log("Upload bem-sucedido:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/documentos', ordemId] });
      queryClient.invalidateQueries({ queryKey: ['/api/documentos/estatisticas', ordemId] });
      setArquivosSelecionados([]);
      toast({ 
        title: "Sucesso", 
        description: `${data.totalProcessados} documentos enviados com sucesso!` 
      });
    },
    onError: (error: any) => {
      console.error("Erro no upload:", error);
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao enviar documentos",
        variant: "destructive" 
      });
    }
  });

  // Mutation para reordenar documentos
  const reordenarMutation = useMutation({
    mutationFn: (documentosOrdem: Array<{id: number, ordem: number}>) => 
      apiRequest('POST', '/api/documentos/reordenar', {
        ordemServicoId: ordemId,
        documentosOrdem
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documentos', ordemId] });
      toast({ title: "Sucesso", description: "Documentos reordenados!" });
    }
  });

  // Mutation para excluir documento
  const excluirMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/documentos/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documentos', ordemId] });
      queryClient.invalidateQueries({ queryKey: ['/api/documentos/estatisticas', ordemId] });
      toast({ title: "Sucesso", description: "Documento excluído!" });
    }
  });

  // Mutation para processar PDF consolidado
  const processarMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/documentos/processar-ordem/${ordemId}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documentos', ordemId] });
      toast({ title: "Sucesso", description: "PDF consolidado gerado!" });
    }
  });

  if (!ordemId) {
    return (
      <ResponsiveLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="text-gray-600">ID da ordem de serviço não encontrado</p>
          <Button onClick={() => navigate('/ordens-servico')} className="mt-4">
            Voltar às Ordens
          </Button>
        </div>
      </ResponsiveLayout>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log("Arquivos selecionados:", files);
    setArquivosSelecionados(prev => [...prev, ...files]);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const documentosReordenados = Array.from(documentos);
    const [documentoMovido] = documentosReordenados.splice(result.source.index, 1);
    documentosReordenados.splice(result.destination.index, 0, documentoMovido);

    const documentosOrdem = documentosReordenados.map((doc, index) => ({
      id: doc.id,
      ordem: index
    }));

    reordenarMutation.mutate(documentosOrdem);
  };

  const formatarTamanho = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const obterIconeArquivo = (tipo: string) => {
    if (tipo?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (tipo?.includes('image')) return <Image className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-blue-500" />;
  };

  return (
    <ResponsiveLayout>
      <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Documentos - Ordem #{ordemId}</h1>
              <p className="text-gray-600">Gerencie documentos e gere PDF consolidado</p>
            </div>
            <Button onClick={() => navigate(`/ordens-servico/editar/${ordemId}`)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Ordem
            </Button>
          </div>

          {/* Estatísticas */}
          {estatisticas && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Estatísticas dos Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{estatisticas.totalDocumentos}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{estatisticas.imagensProcessaveis}</div>
                    <div className="text-sm text-gray-600">Imagens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{estatisticas.pdfsProcessaveis}</div>
                    <div className="text-sm text-gray-600">PDFs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{estatisticas.outrosDocumentos}</div>
                    <div className="text-sm text-gray-600">Outros</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{estatisticas.tamanhoEstimado}</div>
                    <div className="text-sm text-gray-600">Tamanho</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload de Arquivos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Enviar Documentos
              </CardTitle>
              <p className="text-sm text-gray-600">
                Selecione múltiplos arquivos ou tire fotos para enviar
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => {
                    console.log("Clicou em selecionar arquivos");
                    inputFileRef.current?.click();
                  }}
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivos
                </Button>
                
                <Button
                  onClick={() => {
                    console.log("Clicou em tirar foto");
                    cameraInputRef.current?.click();
                  }}
                  variant="outline"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Tirar Foto
                </Button>

                {arquivosSelecionados.length > 0 && (
                  <>
                    <Button
                      onClick={() => {
                        console.log("Enviando arquivos:", arquivosSelecionados);
                        uploadMutation.mutate({ 
                          arquivos: arquivosSelecionados, 
                          processarAutomaticamente: false 
                        });
                      }}
                      disabled={uploadMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {uploadMutation.isPending ? "Enviando..." : `Enviar ${arquivosSelecionados.length} arquivo(s)`}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        console.log("Enviando e processando:", arquivosSelecionados);
                        uploadMutation.mutate({ 
                          arquivos: arquivosSelecionados, 
                          processarAutomaticamente: true 
                        });
                      }}
                      disabled={uploadMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Combine className="w-4 h-4 mr-2" />
                      {uploadMutation.isPending ? "Processando..." : "Enviar e Processar"}
                    </Button>
                  </>
                )}
              </div>

              <input
                ref={inputFileRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.doc,.docx,.txt,.rtf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {arquivosSelecionados.length > 0 && (
                <div className="border rounded p-4 space-y-2">
                  <h4 className="font-medium">Arquivos Selecionados:</h4>
                  {arquivosSelecionados.map((arquivo, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {obterIconeArquivo(arquivo.type)}
                        <span>{arquivo.name}</span>
                        <Badge variant="outline">{formatarTamanho(arquivo.size)}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setArquivosSelecionados(prev => prev.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {uploadMutation.isPending && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Enviando documentos...</div>
                  <Progress value={50} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="w-5 h-5" />
                  Documentos da Ordem ({documentos.length})
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => processarMutation.mutate()}
                    disabled={processarMutation.isPending || documentos.length === 0}
                    size="sm"
                  >
                    {processarMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Combine className="w-4 h-4 mr-2" />
                    )}
                    Gerar PDF Consolidado
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p>Carregando documentos...</p>
                </div>
              ) : documentos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum documento encontrado</p>
                  <p className="text-sm mt-2">Use a seção acima para enviar arquivos</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="documentos">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {documentos.map((doc: Documento, index: number) => (
                          <Draggable key={doc.id} draggableId={doc.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                                  snapshot.isDragging ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col">
                                    <ArrowUp className="w-3 h-3 text-gray-400" />
                                    <ArrowDown className="w-3 h-3 text-gray-400" />
                                  </div>
                                  
                                  {obterIconeArquivo(doc.tipo)}
                                  
                                  <div>
                                    <div className="font-medium">{doc.nome}</div>
                                    <div className="text-sm text-gray-500">
                                      {formatarTamanho(doc.tamanho)} • {new Date(doc.criadoEm).toLocaleDateString('pt-BR')}
                                      {doc.consolidado && (
                                        <Badge variant="secondary" className="ml-2">PDF Consolidado</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      window.open(`/api/documentos/${doc.id}/download`, '_blank');
                                    }}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => excluirMutation.mutate(doc.id)}
                                    disabled={excluirMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
      </div>
    </ResponsiveLayout>
  );
}