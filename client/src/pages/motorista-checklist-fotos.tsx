import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MotoristaChecklistFotos() {
  const [, params] = useRoute("/motorista/checklist-fotos/:motoristaOrdemServicoId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const motoristaOrdemServicoId = params?.motoristaOrdemServicoId;

  const [checklistFotos, setChecklistFotos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!motoristaOrdemServicoId) return;
    
    const buscarFotos = async () => {
      try {
        const response = await fetch(`/api/motorista/checklist-fotos/${motoristaOrdemServicoId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setChecklistFotos(data);
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível carregar as fotos do checklist",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erro ao buscar fotos:", error);
        toast({
          title: "Erro",
          description: "Erro ao conectar com o servidor",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    buscarFotos();
  }, [motoristaOrdemServicoId]);

  const abrirFoto = (caminhoFoto: string) => {
    window.open(`/uploads/checklist/${caminhoFoto}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando fotos do checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setLocation('/motorista/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Fotos do Checklist
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Visualização das fotos enviadas
              </p>
            </div>

            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Checklist de Saída */}
        {checklistFotos?.saida && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-green-600" />
                Checklist de Saída
                <Badge variant="outline" className="ml-2">
                  {new Date(checklistFotos.saida.criadoEm).toLocaleString('pt-BR')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklistFotos.saida.observacoesSaida && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Observações:</strong> {checklistFotos.saida.observacoesSaida}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {checklistFotos.saida.foto1 && (
                  <div className="relative group">
                    <img 
                      src={`/uploads/checklist/${checklistFotos.saida.foto1}`}
                      alt="Foto de saída 1"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => abrirFoto(checklistFotos.saida.foto1)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {checklistFotos.saida.foto2 && (
                  <div className="relative group">
                    <img 
                      src={`/uploads/checklist/${checklistFotos.saida.foto2}`}
                      alt="Foto de saída 2"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => abrirFoto(checklistFotos.saida.foto2)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {checklistFotos.saida.foto3 && (
                  <div className="relative group">
                    <img 
                      src={`/uploads/checklist/${checklistFotos.saida.foto3}`}
                      alt="Foto de saída 3"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => abrirFoto(checklistFotos.saida.foto3)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {checklistFotos.saida.foto4 && (
                  <div className="relative group">
                    <img 
                      src={`/uploads/checklist/${checklistFotos.saida.foto4}`}
                      alt="Foto de saída 4"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => abrirFoto(checklistFotos.saida.foto4)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist de Chegada */}
        {checklistFotos?.chegada && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                Checklist de Chegada
                <Badge variant="outline" className="ml-2">
                  {new Date(checklistFotos.chegada.criadoEm).toLocaleString('pt-BR')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklistFotos.chegada.observacoesChegada && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Observações:</strong> {checklistFotos.chegada.observacoesChegada}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {checklistFotos.chegada.foto1 && (
                  <div className="relative group">
                    <img 
                      src={`/uploads/checklist/${checklistFotos.chegada.foto1}`}
                      alt="Foto de chegada 1"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => abrirFoto(checklistFotos.chegada.foto1)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {checklistFotos.chegada.foto2 && (
                  <div className="relative group">
                    <img 
                      src={`/uploads/checklist/${checklistFotos.chegada.foto2}`}
                      alt="Foto de chegada 2"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => abrirFoto(checklistFotos.chegada.foto2)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {checklistFotos.chegada.foto3 && (
                  <div className="relative group">
                    <img 
                      src={`/uploads/checklist/${checklistFotos.chegada.foto3}`}
                      alt="Foto de chegada 3"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => abrirFoto(checklistFotos.chegada.foto3)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {checklistFotos.chegada.foto4 && (
                  <div className="relative group">
                    <img 
                      src={`/uploads/checklist/${checklistFotos.chegada.foto4}`}
                      alt="Foto de chegada 4"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => abrirFoto(checklistFotos.chegada.foto4)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Caso não haja fotos */}
        {!checklistFotos?.saida && !checklistFotos?.chegada && (
          <Card>
            <CardContent className="text-center py-8">
              <Camera className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma foto encontrada</h3>
              <p className="text-slate-600">
                Este serviço ainda não possui fotos de checklist registradas.
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}