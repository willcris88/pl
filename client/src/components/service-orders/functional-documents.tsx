/**
 * SISTEMA DE DOCUMENTOS FUNCIONAIS - VERSÃO SIMPLIFICADA QUE FUNCIONA
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Trash2, FileText, Image, Film } from 'lucide-react';

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

export default function FunctionalDocuments({ ordemServicoId }: Props) {
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [nomePersonalizado, setNomePersonalizado] = useState('');
  const [documentosSelecionados, setDocumentosSelecionados] = useState<number[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar documentos
  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['/api/documentos-funcionais', ordemServicoId],
    queryFn: async () => {
      const response = await fetch(`/api/documentos-funcionais/${ordemServicoId}`, {
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

      const response = await fetch('/api/documentos-funcionais/upload', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/documentos-funcionais', ordemServicoId] });
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
      const response = await fetch(`/api/documentos-funcionais/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erro ao excluir');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Documento excluído com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ['/api/documentos-funcionais', ordemServicoId] });
    }
  });

  // Mutação para criar PDF
  const pdfMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/documentos-funcionais/criar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ordemServicoId,
          documentosSelecionados: documentosSelecionados.length > 0 ? documentosSelecionados : null,
          nomePersonalizado: nomePersonalizado.trim() || `PDF_Consolidado_${Date.now()}`
        })
      });
      if (!response.ok) throw new Error('Erro ao criar PDF');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "PDF Criado!",
        description: `${data.documentosProcessados} documentos consolidados`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documentos-funcionais', ordemServicoId] });
      setDialogAberto(false);
      setDocumentosSelecionados([]);
      setNomePersonalizado('');
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
    window.open(`/api/documentos-funcionais/${doc.id}/download`, '_blank');
  };

  const getFileIcon = (tipo: string) => {
    if (['.png', '.jpg', '.jpeg', '.gif', '.bmp'].includes(tipo.toLowerCase())) {
      return <Image className="h-4 w-4" />;
    }
    if (tipo.toLowerCase() === '.pdf') {
      return <FileText className="h-4 w-4" />;
    }
    return <Film className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleSelection = (id: number) => {
    setDocumentosSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    );
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Documentos ({documentos.length})</span>
          <div className="flex gap-2">
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={documentos.length === 0}>
                  <FileText className="h-4 w-4 mr-2" />
                  Criar PDF
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar PDF Consolidado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome do arquivo PDF (opcional)"
                    value={nomePersonalizado}
                    onChange={(e) => setNomePersonalizado(e.target.value)}
                  />
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Selecionar documentos:</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {documentos.filter(doc => !doc.consolidado).map(doc => (
                        <div key={doc.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={documentosSelecionados.includes(doc.id)}
                            onChange={() => toggleSelection(doc.id)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{doc.nome}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocumentosSelecionados(documentos.filter(doc => !doc.consolidado).map(doc => doc.id))}
                      >
                        Selecionar Todos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDocumentosSelecionados([])}
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => pdfMutation.mutate()}
                    disabled={pdfMutation.isPending}
                    className="w-full"
                  >
                    {pdfMutation.isPending ? 'Criando PDF...' : 'Criar PDF Consolidado'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Upload de arquivos */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Clique para selecionar arquivos ou arraste aqui
                </span>
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
                {uploadMutation.isPending ? 'Enviando...' : 'Enviar Arquivos'}
              </Button>
            </div>
          )}
        </div>

        {/* Lista de documentos */}
        {documentos.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Nenhum documento encontrado
          </div>
        ) : (
          <div className="space-y-2">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${
                  doc.consolidado ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(doc.tipo)}
                  <div>
                    <p className="font-medium text-sm">{doc.nome}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.tamanho)} • {doc.tipo}
                      {doc.consolidado && ' • PDF Consolidado'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}