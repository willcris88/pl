import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobileFab } from "@/components/mobile/mobile-fab";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, File, Download, Eye, Trash2, Upload, Image } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Documento {
  id: number;
  nome: string;
  tipo: string;
  tamanho: number;
  caminho: string;
  ordemServicoId: number;
  criadoEm: string;
}

export default function MobileDocumentos() {
  const [searchTerm, setSearchTerm] = useState('');
  const ordemServicoId = window.location.pathname.split('/').pop();

  const { data: documentos = [], isLoading } = useQuery<Documento[]>({
    queryKey: [`/api/documentos/${ordemServicoId}`],
    queryFn: async () => {
      const response = await fetch(`/api/documentos/${ordemServicoId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar documentos');
      return response.json();
    },
  });

  const filteredDocumentos = documentos.filter(doc =>
    doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.includes('image')) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getTipoColor = (tipo: string) => {
    if (tipo.includes('image')) return 'blue';
    if (tipo.includes('pdf')) return 'red';
    return 'gray';
  };

  const handleDownload = (doc: Documento) => {
    window.open(`/api/documentos/${doc.id}/download`, '_blank');
  };

  const handlePreview = (doc: Documento) => {
    window.open(`/api/documentos/${doc.id}/preview`, '_blank');
  };

  if (isLoading) {
    return (
      <MobileLayout title="Documentos">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Documentos">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {documentos.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total de Documentos
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-lg font-semibold text-green-900 dark:text-green-100">
              {formatFileSize(documentos.reduce((acc, doc) => acc + doc.tamanho, 0))}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Tamanho Total
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredDocumentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhum documento encontrado' : 'Nenhum documento anexado'}
            </div>
          ) : (
            filteredDocumentos.map((doc) => (
              <MobileCard
                key={doc.id}
                title={doc.nome}
                subtitle={`${doc.tipo} • ${formatFileSize(doc.tamanho)}`}
                badge={doc.tipo.split('/')[1]?.toUpperCase() || 'FILE'}
                badgeColor={getTipoColor(doc.tipo)}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {getFileIcon(doc.tipo)}
                    {format(new Date(doc.criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(doc)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </MobileCard>
            ))
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
          {filteredDocumentos.length} de {documentos.length} documentos exibidos
        </div>
      </div>

      <MobileFab 
        icon={<Upload className="h-5 w-5" />}
        onClick={() => {
          // Implementar upload de documentos
          console.log('Upload documento');
        }}
      />
    </MobileLayout>
  );
}