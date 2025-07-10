/**
 * SISTEMA DE DOCUMENTOS PDF COM CARDS E PREVIEW
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Trash2, FileText, Eye, X, Edit2, Check } from 'lucide-react';

interface Documento {
  id: number;
  nome: string;
  caminho: string;
  tamanho: number;
  tipo: string;
  ordem: number;
  consolidado: boolean;
  ordemServicoId: number;
}

interface Props {
  ordemServicoId: number;
}

export default function PDFDocuments({ ordemServicoId }: Props) {
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Documento | null>(null);
  const [editingDoc, setEditingDoc] = useState<number | null>(null);
  const [novoNome, setNovoNome] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar documentos
  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['/api/documentos-pdf', ordemServicoId],
    queryFn: async () => {
      const response = await fetch(`/api/documentos-pdf/${ordemServicoId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erro ao buscar documentos');
      return response.json();
    },
    enabled: !!ordemServicoId
  });

  // Mutação para upload
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      formData.append('ordemServicoId', ordemServicoId.toString());
      
      Array.from(files).forEach(file => {
        formData.append('documentos', file);
      });

      const response = await fetch('/api/documentos-pdf/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) throw new Error('Erro no upload');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Concluído!",
        description: data.message
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documentos-pdf', ordemServicoId] });
      setUploadFiles(null);
    },
    onError: () => {
      toast({
        title: "Erro no Upload",
        description: "Falha ao enviar arquivos",
        variant: "destructive"
      });
    }
  });

  // Mutação para exclusão
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/documentos-pdf/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erro ao excluir');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Documento excluído com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['/api/documentos-pdf', ordemServicoId] });
    }
  });

  // Mutação para renomear
  const renameMutation = useMutation({
    mutationFn: async ({ id, novoNome }: { id: number, novoNome: string }) => {
      const response = await fetch(`/api/documentos-pdf/${id}/renomear`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ novoNome })
      });
      if (!response.ok) throw new Error('Erro ao renomear');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Documento renomeado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['/api/documentos-pdf', ordemServicoId] });
      setEditingDoc(null);
      setNovoNome('');
    }
  });

  const handleUpload = () => {
    if (uploadFiles && uploadFiles.length > 0) {
      uploadMutation.mutate(uploadFiles);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (doc: Documento) => {
    window.open(`/api/documentos-pdf/${doc.id}/download`, '_blank');
  };

  const handlePreview = (doc: Documento) => {
    setPreviewDoc(doc);
  };

  const handleEditStart = (doc: Documento) => {
    setEditingDoc(doc.id);
    setNovoNome(doc.nome.replace('.pdf', ''));
  };

  const handleEditSave = (id: number) => {
    if (novoNome.trim()) {
      renameMutation.mutate({ id, novoNome: novoNome.trim() });
    }
  };

  const handleEditCancel = () => {
    setEditingDoc(null);
    setNovoNome('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando documentos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Clique para selecionar arquivos ou arraste aqui
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Arquivos serão automaticamente convertidos para PDF
                  </p>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => setUploadFiles(e.target.files)}
                  />
                </label>
              </div>
            </div>
            
            {uploadFiles && uploadFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  {uploadFiles.length} arquivo(s) selecionado(s)
                </p>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? 'Convertendo para PDF...' : 'Enviar e Converter'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documentos.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            Nenhum documento encontrado
          </div>
        ) : (
          documentos.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow group h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm min-h-[24px]">
                  <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
                  {editingDoc === doc.id ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <Input
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        className="h-7 text-xs flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleEditSave(doc.id);
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSave(doc.id)}
                        className="h-7 w-7 p-0 flex-shrink-0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditCancel}
                        className="h-7 w-7 p-0 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span className="truncate flex-1" title={doc.nome}>{doc.nome}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditStart(doc)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-3">
                <div className="text-xs text-gray-500">
                  {formatFileSize(doc.tamanho)}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(doc)}
                    className="w-full h-8 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Visualizar
                  </Button>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="flex-1 h-7 text-xs"
                      title="Baixar PDF"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 h-7 text-xs"
                      title="Excluir documento"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-5xl w-[90vw] h-[85vh] p-0">
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle className="flex items-center justify-between text-lg">
              <span className="truncate pr-4">{previewDoc?.nome}</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => previewDoc && handleDownload(previewDoc)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewDoc(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {previewDoc && (
            <div className="flex-1 p-4 overflow-hidden">
              <iframe
                src={`/api/documentos-pdf/${previewDoc.id}/preview`}
                className="w-full h-full border-0 rounded-lg shadow-inner bg-gray-50"
                title={`Preview de ${previewDoc.nome}`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}