/**
 * SISTEMA DE DOCUMENTOS SIMPLES E FUNCIONAL
 * Versão básica que SEMPRE funciona
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Upload, File, FileText, Download, Trash2, Edit3, Plus, Eye, GripVertical } from "lucide-react";

interface SimpleDocumento {
  id: number;
  nome: string;
  caminho: string;
  tamanho: number;
  tipo: string;
  consolidado: boolean;
  criadoEm: string;
}

interface SimpleDocumentsProps {
  ordemServicoId: number;
}

export function SimpleDocuments({ ordemServicoId }: SimpleDocumentsProps) {
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);
  const [documentosSelecionados, setDocumentosSelecionados] = useState<number[]>([]);
  const [nomePersonalizado, setNomePersonalizado] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [documentosOrdenados, setDocumentosOrdenados] = useState<SimpleDocumento[]>([]);
  const [editandoNome, setEditandoNome] = useState<number | null>(null);
  const [novoNome, setNovoNome] = useState('');
  const [previewImagem, setPreviewImagem] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar documentos
  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['/api/documentos-simples', ordemServicoId],
    queryFn: () => fetch(`/api/documentos-simples?ordemServicoId=${ordemServicoId}`, {
      credentials: 'include'
    }).then(res => res.json()),
    onSuccess: (data) => {
      setDocumentosOrdenados(data);
    }
  });

  // Sincronizar documentos ordenados quando dados mudam
  if (documentos.length !== documentosOrdenados.length) {
    setDocumentosOrdenados(documentos);
  }

  // Upload de arquivos - CORRIGIDO para múltiplos arquivos
  const uploadMutation = useMutation({
    mutationFn: async (arquivos: File[]) => {
      const formData = new FormData();
      
      // Adicionar cada arquivo com log
      console.log(`Preparando upload de ${arquivos.length} arquivos:`, arquivos.map(f => f.name));
      for (const arquivo of arquivos) {
        formData.append('documentos', arquivo);
      }
      formData.append('ordemServicoId', ordemServicoId.toString());

      const response = await fetch('/api/documentos-simples/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) throw new Error('Upload falhou');
      return response.json();
    },
    onSuccess: (data) => {
      const count = data.documentos?.length || arquivosSelecionados.length;
      toast({ title: "Sucesso", description: `${count} documentos enviados!` });
      setArquivosSelecionados([]);
      queryClient.invalidateQueries({ queryKey: ['/api/documentos-simples', ordemServicoId] });
    },
    onError: (error: any) => {
      console.error('Erro upload:', error);
      toast({ title: "Erro", description: "Falha no upload", variant: "destructive" });
    }
  });

  // Excluir documento
  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/documentos-simples/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Documento excluído!" });
      queryClient.invalidateQueries({ queryKey: ['/api/documentos-simples', ordemServicoId] });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao excluir", variant: "destructive" });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setArquivosSelecionados(files);
  };

  const formatarTamanho = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const obterIcone = (tipo: string) => {
    if (tipo?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-blue-500" />;
  };

  const handleDownload = (documento: SimpleDocumento) => {
    window.open(`/api/documentos-simples/${documento.id}/download`, '_blank');
  };

  // Selecionar/deselecionar documento
  const toggleDocumento = (id: number) => {
    setDocumentosSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    );
  };

  // Selecionar todos os documentos
  const selecionarTodos = () => {
    const documentosNaoConsolidados = documentosOrdenados.filter(doc => !doc.consolidado);
    setDocumentosSelecionados(documentosNaoConsolidados.map(doc => doc.id));
  };

  // Limpar seleção
  const limparSelecao = () => {
    setDocumentosSelecionados([]);
  };

  // Drag and drop para reordenar
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(documentosOrdenados);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDocumentosOrdenados(items);
  };

  // Renomear documento
  const renomearDocumento = async (id: number, novoNome: string) => {
    try {
      const response = await fetch(`/api/documentos-simples/${id}/renomear`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ novoNome })
      });

      if (response.ok) {
        toast({ title: "Sucesso", description: "Documento renomeado!" });
        queryClient.invalidateQueries({ queryKey: ['/api/documentos-simples', ordemServicoId] });
        setEditandoNome(null);
        setNovoNome('');
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao renomear", variant: "destructive" });
    }
  };

  // Preview de imagem
  const mostrarPreview = (doc: SimpleDocumento) => {
    if (['.png', '.jpg', '.jpeg'].includes(doc.tipo.toLowerCase())) {
      setPreviewImagem(`/api/documentos-simples/${doc.id}/preview`);
    }
  };

  const criarPDFConsolidado = async () => {
    if (documentosSelecionados.length === 0) {
      toast({ 
        title: "Atenção", 
        description: "Selecione pelo menos um documento para consolidar",
        variant: "destructive"
      });
      return;
    }

    try {
      const nomeArquivo = nomePersonalizado.trim() || `PDF_Consolidado_${new Date().toISOString().split('T')[0]}`;
      
      // Usar a ordem dos documentos reordenados
      const documentosOrdenadosIds = documentosOrdenados
        .filter(doc => documentosSelecionados.includes(doc.id))
        .map(doc => doc.id);
      
      const response = await fetch('/api/documentos-simples/criar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          ordemServicoId,
          documentosSelecionados: documentosOrdenadosIds,
          nomePersonalizado: nomeArquivo
        })
      });
      
      if (response.ok) {
        const resultado = await response.json();
        toast({ 
          title: "PDF Consolidado Criado!", 
          description: `${resultado.documentosProcessados} documentos processados - ${resultado.documento.nome}` 
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/documentos-simples', ordemServicoId] });
        setDialogAberto(false);
        setDocumentosSelecionados([]);
        setNomePersonalizado('');
      } else {
        throw new Error('Falha na criação do PDF');
      }
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Falha ao criar PDF consolidado",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Enviar Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => document.getElementById('file-input')?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Selecionar Arquivos
            </Button>
            
            {arquivosSelecionados.length > 0 && (
              <Button
                type="button"
                onClick={() => uploadMutation.mutate(arquivosSelecionados)}
                disabled={uploadMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {uploadMutation.isPending ? "Enviando..." : `Enviar ${arquivosSelecionados.length} arquivo(s)`}
              </Button>
            )}
          </div>

          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          {arquivosSelecionados.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Arquivos selecionados:</p>
              {arquivosSelecionados.map((arquivo, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{arquivo.name}</span>
                  <span className="text-xs text-gray-500">{formatarTamanho(arquivo.size)}</span>
                </div>
              ))}
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
              Documentos ({documentos.length})
            </div>
            <div className="flex gap-2">
              <Button onClick={selecionarTodos} variant="outline" size="sm">
                Selecionar Todos
              </Button>
              <Button onClick={limparSelecao} variant="outline" size="sm">
                Limpar
              </Button>
              <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={documentosSelecionados.length === 0}
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF ({documentosSelecionados.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Configurar PDF Consolidado</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome do arquivo (opcional)</Label>
                      <Input
                        id="nome"
                        value={nomePersonalizado}
                        onChange={(e) => setNomePersonalizado(e.target.value)}
                        placeholder="Ex: Documentos_Cliente_João"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Se vazio, será usado: PDF_Consolidado_AAAA-MM-DD
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Documentos selecionados: {documentosSelecionados.length}
                      </p>
                      <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground">
                        {documentosSelecionados.map(id => {
                          const doc = documentos.find(d => d.id === id);
                          return doc ? <div key={id}>• {doc.nome}</div> : null;
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setDialogAberto(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={criarPDFConsolidado} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar PDF
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando documentos...</p>
            </div>
          ) : documentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum documento encontrado</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="documentos">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {documentosOrdenados.map((doc: SimpleDocumento, index: number) => (
                      <Draggable key={doc.id} draggableId={doc.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-3 border rounded transition-all ${
                              snapshot.isDragging ? 'bg-blue-50 border-blue-300 shadow-lg' : ''
                            }`}
                            onMouseEnter={() => mostrarPreview(doc)}
                            onMouseLeave={() => setPreviewImagem(null)}
                          >
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="cursor-grab hover:cursor-grabbing">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                              {!doc.consolidado && (
                                <Checkbox
                                  checked={documentosSelecionados.includes(doc.id)}
                                  onCheckedChange={() => toggleDocumento(doc.id)}
                                  className="mt-1"
                                />
                              )}
                              {obterIcone(doc.tipo)}
                              <div>
                                {editandoNome === doc.id ? (
                                  <div className="flex gap-2 items-center">
                                    <Input
                                      value={novoNome}
                                      onChange={(e) => setNovoNome(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') renomearDocumento(doc.id, novoNome);
                                        if (e.key === 'Escape') {
                                          setEditandoNome(null);
                                          setNovoNome('');
                                        }
                                      }}
                                      className="h-8 text-sm"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => renomearDocumento(doc.id, novoNome)}
                                      className="h-8 px-2"
                                    >
                                      ✓
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="font-medium">{doc.nome}</div>
                                )}
                                <div className="text-sm text-gray-500">
                                  {formatarTamanho(doc.tamanho)} • {new Date(doc.criadoEm).toLocaleDateString('pt-BR')}
                                  {doc.consolidado && <span className="ml-2 text-purple-600 font-semibold">PDF Consolidado</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditandoNome(doc.id);
                                  setNovoNome(doc.nome.replace(/\.[^/.]+$/, ""));
                                }}
                                title="Renomear arquivo"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(doc)}
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteMutation.mutate(doc.id)}
                                disabled={deleteMutation.isPending}
                                title="Excluir"
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

      {/* Preview de imagem */}
      {previewImagem && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-2 max-w-sm">
          <img
            src={previewImagem}
            alt="Preview"
            className="w-full h-auto max-h-64 object-contain rounded"
            onError={() => {
              console.log('Erro ao carregar preview:', previewImagem);
              setPreviewImagem(null);
            }}
            onLoad={() => console.log('Preview carregado:', previewImagem)}
          />
        </div>
      )}
    </div>
  );
}