import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  X, Info, User, Users, MapPin, FileText, Calendar, Phone, Save, 
  Clock, AlertTriangle, Package, Car, Upload, Plus, Trash2, Edit,
  Check, ShoppingCart, UserCheck, MapPinHouse
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/hooks/use-sound";
import { useFormNavigation } from "@/hooks/use-form-navigation";
import { PendenciaModal } from "@/components/modals/pendencia-modal";
import { MotoristaModal } from "@/components/modals/motorista-modal";
import { ProductsSection } from "@/components/service-orders/products-section";
import { SimpleDocuments } from "@/components/service-orders/simple-documents";
import FunctionalDocuments from "@/components/service-orders/functional-documents";
import PDFDocuments from "@/components/service-orders/pdf-documents";
import { MotoristaTab } from "@/components/service-orders/motorista-tab";
import { InserirOrdemServico, OrdemServico } from "@shared/schema";

const ordemServicoSchema = z.object({
  numeroOs: z.string().min(1, "Número OS é obrigatório"),
  nomeFalecido: z.string().min(1, "Nome do falecido é obrigatório"),
  plano: z.string().min(1, "Plano é obrigatório"),
  contratante: z.string().optional(),
  cpfFalecido: z.string().optional(),
  cnpjContratante: z.string().optional(),
  peso: z.string().optional(),
  altura: z.string().optional(),
  sexo: z.string().optional(),
  religiao: z.string().optional(),
  dataNascimento: z.string().optional(),
  dataFalecimento: z.string().optional(),
  enderecoCorpo: z.string().optional(),
  localVelorio: z.string().optional(),
  enderecoSepultamento: z.string().optional(),
  dataHoraSepultamento: z.string().optional(),
  nomeResponsavel: z.string().optional(),
  telefoneResponsavel: z.string().optional(),
  telefone2Responsavel: z.string().optional(),
  documentoResponsavel: z.string().optional(),
  grauParentesco: z.string().optional(),
  sinistro: z.boolean().optional(),
  descricaoServico: z.string().optional(),
});

type OrdemServicoForm = z.infer<typeof ordemServicoSchema>;

export function CreateOrderForm() {
  const [location, navigate] = useLocation();
  const params = useParams();
  
  // Extrai o ID da URL manualmente se useParams não funcionar
  const id = params.id || location.split('/').pop();
  
  const { toast } = useToast();
  const { playError, playSuccess, playWarning, playClick } = useSound();
  const { formRef } = useFormNavigation();

  const [activeTab, setActiveTab] = useState("dados-principais");
  const isEditing = Boolean(id) && location.includes('/editar/');
  

  // Carrega dados da ordem para edição
  const { data: ordemData, isLoading: isLoadingOrdem, error: ordemError } = useQuery<OrdemServico>({
    queryKey: ["/ordens-servico", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiRequest("GET", `/ordens-servico/${id}`);
      return res.data;
    },
    enabled: isEditing && !!id,
  });

  // Log de debug para verificar se os dados estão chegando


  // SOLUÇÃO TEMPORÁRIA: Usar fetch direto em vez de apiRequest
  const { data: pendencias, refetch: refetchPendencias } = useQuery({
    queryKey: ['/api/ordens-servico', parseInt(id || '0'), 'pendencias'],
    queryFn: async () => {
      console.log("Frontend: Buscando pendências para ordem:", id);
      try {
        const response = await fetch(`/api/ordens-servico/${id}/pendencias`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Frontend: Pendências recebidas:", data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Frontend: Erro ao buscar pendências:", error);
        return [];
      }
    },
    enabled: !!id,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Carrega produtos apenas se necessário
  const { data: produtos } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/produtos`);
      return res.data;
    },
    enabled: false, // Só carrega quando explicitamente solicitado
  });

  // Carrega motoristas apenas se estiver editando E tiver ID
  const { data: motoristas } = useQuery({
    queryKey: ["ordens-servico", id, "motoristas"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/ordens-servico/${id}/motoristas`);
      return res.data;
    },
    enabled: isEditing && !!id,
  });

  // Carrega documentos apenas se estiver editando E tiver ID
  const { data: documentos } = useQuery({
    queryKey: ["ordens-servico", id, "documentos"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/ordens-servico/${id}/documentos`);
      return res.data;
    },
    enabled: isEditing && !!id,
  });

  const form = useForm<OrdemServicoForm>({
    resolver: zodResolver(ordemServicoSchema),
    defaultValues: {
      numeroOs: "",
      nomeFalecido: "",
      plano: "",
      contratante: "",
      cpfFalecido: "",
      cnpjContratante: "",
      peso: "",
      altura: "",
      sexo: "",
      religiao: "",
      dataNascimento: "",
      dataFalecimento: "",
      enderecoCorpo: "",
      localVelorio: "",
      enderecoSepultamento: "",
      dataHoraSepultamento: "",
      nomeResponsavel: "",
      telefoneResponsavel: "",
      telefone2Responsavel: "",
      documentoResponsavel: "",
      grauParentesco: "",
      sinistro: false,
      descricaoServico: "",
    },
  });

  // Preenche o formulário com dados da ordem ao editar
  useEffect(() => {
    if (ordemData && isEditing) {
      
      const formatDate = (date: string | Date | null) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      const formatDateTime = (date: string | Date | null) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
      };

      const formData = {
        numeroOs: ordemData.numeroOs || "",
        nomeFalecido: ordemData.nomeFalecido || "",
        plano: ordemData.plano || "",
        contratante: ordemData.contratante || "",
        cpfFalecido: ordemData.cpfFalecido || "",
        cnpjContratante: ordemData.cnpjContratante || "",
        peso: ordemData.peso?.toString() || "",
        altura: ordemData.altura?.toString() || "",
        sexo: ordemData.sexo || "",
        religiao: ordemData.religiao || "",
        dataNascimento: formatDate(ordemData.dataNascimento),
        dataFalecimento: formatDate(ordemData.dataFalecimento),
        enderecoCorpo: ordemData.enderecoCorpo || "",
        localVelorio: ordemData.localVelorio || "",
        enderecoSepultamento: ordemData.enderecoSepultamento || "",
        dataHoraSepultamento: formatDateTime(ordemData.dataHoraSepultamento),
        nomeResponsavel: ordemData.nomeResponsavel || "",
        telefoneResponsavel: ordemData.telefoneResponsavel || "",
        telefone2Responsavel: ordemData.telefone2Responsavel || "",
        documentoResponsavel: ordemData.documentoResponsavel || "",
        grauParentesco: ordemData.grauParentesco || "",
        sinistro: ordemData.sinistro || false,
        descricaoServico: ordemData.descricaoServico || "",
      };
      
      form.reset(formData);
    }
  }, [ordemData, isEditing, form]);

  const createMutation = useMutation({
    mutationFn: async (data: OrdemServicoForm) => {
      const payload: Partial<InserirOrdemServico> = {
        ...data,
        dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined,
        dataFalecimento: data.dataFalecimento ? new Date(data.dataFalecimento) : undefined,
        dataHoraSepultamento: data.dataHoraSepultamento ? new Date(data.dataHoraSepultamento) : undefined,
        peso: data.peso ? data.peso : undefined,
      };

      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/ordens-servico/${id}` : "/ordens-servico";
      

      
      const res = await apiRequest(method, url, payload);
      return res.data;
    },
    onSuccess: () => {
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ["ordens-servico"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ["ordens-servico", id] });
      }
      
      // Mostra notificação de sucesso
      toast({
        title: "Sucesso",
        description: isEditing ? "Ordem de serviço atualizada com sucesso!" : "Nova ordem de serviço criada com sucesso!",
      });
      
      // Permanece na tela atual para edição contínua em tempo real
      if (!isEditing) {
        // Apenas redireciona quando cria uma nova ordem
        setTimeout(() => {
          navigate("/ordens-servico");
        }, 1500);
      }
    },
    onError: (error) => {
      playError();
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrdemServicoForm) => {
    // Mapeamento de campos para nomes legíveis
    const fieldLabels: Record<string, string> = {
      numeroOs: "Número da OS",
      nomeFalecido: "Nome do Falecido",
      plano: "Plano"
    };

    // Validação básica de campos obrigatórios
    const requiredFields = ['numeroOs', 'nomeFalecido', 'plano'];
    const missingFields: string[] = [];
    
    requiredFields.forEach(field => {
      const value = data[field as keyof OrdemServicoForm];
      
      if (!value || String(value).trim() === '') {
        missingFields.push(fieldLabels[field] || field);
      }
    });
    
    if (missingFields.length > 0) {
      playError();
      
      // Mostra notificação com campos faltantes
      toast({
        title: "Campos Obrigatórios",
        description: `Preencha todos os campos obrigatórios: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      
      // Foca no primeiro campo com erro se possível
      const firstMissingField = requiredFields.find(field => {
        const value = data[field as keyof OrdemServicoForm];
        return !value || String(value).trim() === '';
      });
      
      if (firstMissingField) {
        const element = document.getElementById(firstMissingField);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      return;
    }
    
    playClick();
    createMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate("/ordens-servico");
  };

  const sidebarItems = [
    { id: "dados-principais", label: "Dados Principais", icon: FileText, description: "OS e dados do falecido", color: "bg-blue-500" },
    { id: "dados-responsavel", label: "Responsável", icon: Users, description: "Dados do responsável", color: "bg-green-500" },
    { id: "locais-datas", label: "Locais e Datas", icon: MapPinHouse, description: "Endereços e datas", color: "bg-orange-500" },
    { id: "observacoes", label: "Observações", icon: FileText, description: "Observações gerais", color: "bg-pink-500" },
    ...(isEditing ? [
      { id: "pendencias", label: "Pendências", icon: AlertTriangle, description: "Gerenciar pendências", color: "bg-red-500" },
      { id: "produtos", label: "Produtos", icon: Package, description: "Produtos e serviços", color: "bg-indigo-500" },
      { id: "motorista", label: "Motorista", icon: Car, description: "Dados do motorista", color: "bg-teal-500" },
      { id: "documentacao", label: "Documentação", icon: Upload, description: "Arquivos e documentos", color: "bg-yellow-500" },
    ] : [])
  ];

  if (isLoadingOrdem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full p-4">
        {/* Header Ultra-Moderno */}
        <div className="mb-8">
          <div className="flex items-center justify-between p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${isEditing ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-green-500 to-blue-600'} shadow-lg`}>
                {isEditing ? <Edit className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  {isEditing ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {isEditing ? "Modifique os dados da ordem de serviço" : "Preencha os dados para criar uma nova ordem de serviço"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing && ordemData && (
                <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-slate-700/50">
                  OS #{ordemData.numeroOs}
                </Badge>
              )}
              <Button type="button" variant="outline" onClick={handleCancel} className="gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[calc(100vh-200px)]">
          {/* Sidebar de Navegação Ultra-Moderno */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Seções
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {sidebarItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`group relative flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30"
                          : "hover:bg-white/60 dark:hover:bg-slate-700/60 hover:shadow-md"
                      }`}
                      onClick={() => {
                        playClick();
                        setActiveTab(item.id);
                      }}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : item.color} transition-colors`}>
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-white'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-sm ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {item.label}
                        </h3>
                        <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                          {item.description}
                        </p>
                      </div>
                      {isActive && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                <Separator className="my-4 bg-slate-200 dark:bg-slate-600" />
                
                <Button 
                  className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={createMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  {createMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Salvando...
                    </span>
                  ) : (
                    isEditing ? "Atualizar" : "Salvar"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Form Ultra-Moderno */}
          <div className="lg:col-span-4">
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  {activeTab === "dados-principais" && (
                    <>
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Dados Principais - OS e Falecido
                      </span>
                    </>
                  )}
                  {activeTab === "dados-responsavel" && (
                    <>
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                        Dados do Responsável
                      </span>
                    </>
                  )}
                  {activeTab === "locais-datas" && (
                    <>
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <MapPinHouse className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                        Locais e Datas
                      </span>
                    </>
                  )}
                  {activeTab === "observacoes" && (
                    <>
                      <div className="p-2 bg-pink-500 rounded-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
                        Observações
                      </span>
                    </>
                  )}
                  {activeTab === "pendencias" && (
                    <>
                      <div className="p-2 bg-red-500 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                        Pendências
                      </span>
                    </>
                  )}
                  {activeTab === "produtos" && (
                    <>
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                        Produtos e Serviços
                      </span>
                    </>
                  )}
                  {activeTab === "motorista" && (
                    <>
                      <div className="p-2 bg-teal-500 rounded-lg">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                        Dados do Motorista
                      </span>
                    </>
                  )}
                  {activeTab === "documentacao" && (
                    <>
                      <div className="p-2 bg-yellow-500 rounded-lg">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                        Documentação
                      </span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
                  
                  {/* Dados Principais - OS e Falecido */}
                  {activeTab === "dados-principais" && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="space-y-2 lg:col-span-3">
                          <Label htmlFor="numeroOs" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Número OS *
                          </Label>
                          <Input
                            id="numeroOs"
                            placeholder="OS-2025-001"
                            className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            {...form.register("numeroOs")}
                          />
                          {form.formState.errors.numeroOs && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {form.formState.errors.numeroOs.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 lg:col-span-3">
                          <Label htmlFor="plano" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Plano *
                          </Label>
                          <Select onValueChange={(value) => form.setValue("plano", value)} value={form.watch("plano")}>
                            <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 text-gray-900 dark:text-gray-100">
                              <SelectValue placeholder="Selecione o plano" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BASICO">Básico</SelectItem>
                              <SelectItem value="STANDARD">Standard</SelectItem>
                              <SelectItem value="PREMIUM">Premium</SelectItem>
                              <SelectItem value="EXECUTIVO">Executivo</SelectItem>
                              <SelectItem value="ICAFU">ICAFU</SelectItem>
                            </SelectContent>
                          </Select>
                          {form.formState.errors.plano && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {form.formState.errors.plano.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 lg:col-span-6">
                          <Label htmlFor="contratante" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Contratante
                          </Label>
                          <Input
                            id="contratante"
                            placeholder="Nome do contratante"
                            className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            {...form.register("contratante")}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="cnpjContratante" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            CNPJ Contratante
                          </Label>
                          <Input
                            id="cnpjContratante"
                            placeholder="00.000.000/0000-00"
                            className="h-11 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
                            {...form.register("cnpjContratante")}
                          />
                        </div>

                        <div className="flex items-center space-x-3 pt-8">
                          <Checkbox
                            id="sinistro"
                            checked={form.watch("sinistro")}
                            onCheckedChange={(checked) => form.setValue("sinistro", !!checked)}
                            className="w-5 h-5"
                          />
                          <Label htmlFor="sinistro" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                            Sinistro
                          </Label>
                        </div>
                      </div>

                      {/* Separador Visual */}
                      <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                            Dados do Falecido
                          </span>
                        </div>
                      </div>

                      {/* Campos do Falecido */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="nomeFalecido" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Nome do Falecido *
                            </Label>
                            <Input
                              id="nomeFalecido"
                              placeholder="Nome completo"
                              className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                              {...form.register("nomeFalecido")}
                            />
                            {form.formState.errors.nomeFalecido && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {form.formState.errors.nomeFalecido.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cpfFalecido" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              CPF do Falecido
                            </Label>
                            <Input
                              id="cpfFalecido"
                              placeholder="000.000.000-00"
                              className="h-11 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
                              {...form.register("cpfFalecido")}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="dataNascimento" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Data de Nascimento
                            </Label>
                            <Input
                              id="dataNascimento"
                              type="date"
                              className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                              {...form.register("dataNascimento")}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dataFalecimento" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Data do Falecimento
                            </Label>
                            <Input
                              id="dataFalecimento"
                              type="date"
                              className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                              {...form.register("dataFalecimento")}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="space-y-2 lg:col-span-3">
                            <Label htmlFor="sexo" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Sexo
                            </Label>
                            <Select onValueChange={(value) => form.setValue("sexo", value)} value={form.watch("sexo")}>
                              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 text-gray-900 dark:text-gray-100">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="feminino">Feminino</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 lg:col-span-3">
                            <Label htmlFor="peso" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Peso (kg)
                            </Label>
                            <Input
                              id="peso"
                              type="number"
                              placeholder="70"
                              className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100"
                              {...form.register("peso")}
                            />
                          </div>

                          <div className="space-y-2 lg:col-span-3">
                            <Label htmlFor="altura" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Altura (cm)
                            </Label>
                            <Input
                              id="altura"
                              type="number"
                              placeholder="170"
                              className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100"
                              {...form.register("altura")}
                            />
                          </div>

                          <div className="space-y-2 lg:col-span-3">
                            <Label htmlFor="religiao" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Religião
                            </Label>
                            <Select onValueChange={(value) => form.setValue("religiao", value)} value={form.watch("religiao")}>
                              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 text-gray-900 dark:text-gray-100">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="catolica">Católica</SelectItem>
                                <SelectItem value="protestante">Protestante</SelectItem>
                                <SelectItem value="espirita">Espírita</SelectItem>
                                <SelectItem value="umbanda">Umbanda</SelectItem>
                                <SelectItem value="candomble">Candomblé</SelectItem>
                                <SelectItem value="judaica">Judaica</SelectItem>
                                <SelectItem value="islamica">Islâmica</SelectItem>
                                <SelectItem value="budista">Budista</SelectItem>
                                <SelectItem value="outras">Outras</SelectItem>
                                <SelectItem value="nenhuma">Nenhuma</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>


                      </div>
                    </div>
                  )}



                  {/* Dados do Responsável */}
                  {activeTab === "dados-responsavel" && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="nomeResponsavel" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Nome do Responsável
                          </Label>
                          <Input
                            id="nomeResponsavel"
                            placeholder="Nome completo"
                            className="h-11 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20"
                            {...form.register("nomeResponsavel")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="documentoResponsavel" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Documento do Responsável
                          </Label>
                          <Input
                            id="documentoResponsavel"
                            placeholder="CPF ou RG"
                            className="h-11 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20"
                            {...form.register("documentoResponsavel")}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="grauParentesco" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Grau de Parentesco
                          </Label>
                          <Select onValueChange={(value) => form.setValue("grauParentesco", value)} value={form.watch("grauParentesco")}>
                            <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600">
                              <SelectValue placeholder="Selecione o parentesco" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="conjuge">Cônjuge</SelectItem>
                              <SelectItem value="filho">Filho(a)</SelectItem>
                              <SelectItem value="pai">Pai</SelectItem>
                              <SelectItem value="mae">Mãe</SelectItem>
                              <SelectItem value="irmao">Irmão(ã)</SelectItem>
                              <SelectItem value="neto">Neto(a)</SelectItem>
                              <SelectItem value="avo">Avô(ó)</SelectItem>
                              <SelectItem value="genro">Genro</SelectItem>
                              <SelectItem value="nora">Nora</SelectItem>
                              <SelectItem value="cunhado">Cunhado(a)</SelectItem>
                              <SelectItem value="sobrinho">Sobrinho(a)</SelectItem>
                              <SelectItem value="primo">Primo(a)</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="telefoneResponsavel" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Telefone Principal
                          </Label>
                          <Input
                            id="telefoneResponsavel"
                            placeholder="(11) 99999-9999"
                            className="h-11 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20"
                            {...form.register("telefoneResponsavel")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="telefone2Responsavel" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Telefone Secundário
                          </Label>
                          <Input
                            id="telefone2Responsavel"
                            placeholder="(11) 99999-9999"
                            className="h-11 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500/20"
                            {...form.register("telefone2Responsavel")}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Locais e Datas */}
                  {activeTab === "locais-datas" && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="enderecoCorpo" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Endereço do Corpo
                          </Label>
                          <Textarea
                            id="enderecoCorpo"
                            placeholder="Endereço completo onde está o corpo"
                            className="min-h-24 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500/20 resize-none"
                            {...form.register("enderecoCorpo")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="localVelorio" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Local do Velório
                          </Label>
                          <Textarea
                            id="localVelorio"
                            placeholder="Local onde será realizado o velório"
                            className="min-h-24 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500/20 resize-none"
                            {...form.register("localVelorio")}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="enderecoSepultamento" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Endereço do Sepultamento
                          </Label>
                          <Textarea
                            id="enderecoSepultamento"
                            placeholder="Local onde será realizado o sepultamento"
                            className="min-h-24 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500/20 resize-none"
                            {...form.register("enderecoSepultamento")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dataHoraSepultamento" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Data e Hora do Sepultamento
                          </Label>
                          <Input
                            id="dataHoraSepultamento"
                            type="datetime-local"
                            className="h-11 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                            {...form.register("dataHoraSepultamento")}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {activeTab === "observacoes" && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="descricaoServico" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Descrição do Serviço / Observações
                        </Label>
                        <Textarea
                          id="descricaoServico"
                          placeholder="Descreva detalhes importantes sobre o serviço, observações especiais, requisitos específicos, etc."
                          className="min-h-[250px] bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-pink-500 focus:ring-pink-500/20 resize-none"
                          {...form.register("descricaoServico")}
                        />
                      </div>
                    </div>
                  )}

                  {/* Pendências - Apenas na Edição */}
                  {activeTab === "pendencias" && isEditing && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                          Lista de Pendências
                        </h3>
                        <PendenciaModal ordemServicoId={id!} />
                      </div>

                      <div className="grid gap-4">
                        <div className="text-sm text-gray-500">
                          Debug: {pendencias ? `${pendencias.length} pendências encontradas` : 'Nenhuma pendência carregada'}
                        </div>
                        {pendencias && Array.isArray(pendencias) && pendencias.length > 0 ? (
                          pendencias.map((pendencia: any) => (
                            <Card key={pendencia.id} className="p-4 border border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-red-800 dark:text-red-200">
                                    {pendencia.tipo || pendencia.descricao}
                                  </h4>
                                  <p className="text-sm text-red-600 dark:text-red-300">
                                    Status: {pendencia.status}
                                  </p>
                                  {pendencia.descricao && pendencia.tipo && pendencia.descricao !== pendencia.tipo && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                      {pendencia.descricao}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <PendenciaModal 
                                    ordemServicoId={id!} 
                                    pendencia={pendencia} 
                                    isEditing={true}
                                  >
                                    <Button type="button" size="sm" variant="outline">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </PendenciaModal>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        type="button"
                                        size="sm" 
                                        variant="outline" 
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                                          <AlertTriangle className="h-5 w-5 text-red-500" />
                                          Confirmar Exclusão
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
                                          Tem certeza que deseja deletar esta pendência? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction 
                                          className="bg-red-500 hover:bg-red-600 text-white"
                                          onClick={async () => {
                                            try {
                                              const response = await fetch(`/api/ordens-servico/${id}/pendencias/${pendencia.id}`, {
                                                method: 'DELETE',
                                                credentials: 'include',
                                              });
                                              
                                              if (!response.ok) throw new Error('Erro ao deletar');
                                              // Invalidar cache de pendências e forçar atualização imediata
                                              queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico'] });
                                              queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico', parseInt(id || '0'), 'pendencias'] });
                                              queryClient.refetchQueries({ queryKey: ['/api/ordens-servico', parseInt(id || '0'), 'pendencias'] });
                                              queryClient.refetchQueries({ queryKey: ['/api/ordens-servico', parseInt(id || '0')] });
                                              toast({
                                                title: "Sucesso",
                                                description: "Pendência deletada com sucesso!",
                                              });
                                            } catch (error) {
                                              toast({
                                                title: "Erro", 
                                                description: "Erro ao deletar pendência.",
                                                variant: "destructive",
                                              });
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Deletar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Nenhuma pendência cadastrada</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Produtos - Apenas na Edição */}
                  {activeTab === "produtos" && isEditing && (
                    <ProductsSection ordemServicoId={parseInt(id!)} />
                  )}

                  {/* Motorista - Apenas na Edição */}
                  {activeTab === "motorista" && isEditing && (
                    <MotoristaTab ordemServicoId={parseInt(id!)} />
                  )}

                  {/* Old Motorista Section (Backup) */}
                  {false && activeTab === "motorista-old" && isEditing && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                          Dados do Motorista
                        </h3>
                        <MotoristaModal ordemServicoId={id!} />
                      </div>

                      <div className="grid gap-4">
                        {motoristas && motoristas.length > 0 ? (
                          motoristas.map((motorista: any) => (
                            <Card key={motorista.id} className="p-4 border border-teal-200 bg-teal-50/50 dark:bg-teal-900/20 dark:border-teal-800">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-teal-800 dark:text-teal-200">
                                    {motorista.nome}
                                  </h4>
                                  <p className="text-sm text-teal-600 dark:text-teal-300">
                                    {motorista.telefone && `Tel: ${motorista.telefone}`}
                                    {motorista.veiculo && ` | Veículo: ${motorista.veiculo}`}
                                  </p>
                                  {motorista.observacoes && (
                                    <p className="text-xs text-teal-500 dark:text-teal-400 mt-1">
                                      {motorista.observacoes}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <MotoristaModal 
                                    ordemServicoId={id!} 
                                    motorista={motorista} 
                                    isEditing={true}
                                  >
                                    <Button type="button" size="sm" variant="outline">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </MotoristaModal>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button type="button" size="sm" variant="outline" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                                          <AlertTriangle className="h-5 w-5 text-red-500" />
                                          Confirmar Exclusão
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
                                          Tem certeza que deseja remover este motorista da ordem de serviço?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                                          Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white">
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Remover
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Nenhum motorista designado</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documentação - Apenas na Edição */}
                  {activeTab === "documentacao" && isEditing && (
                    <PDFDocuments ordemServicoId={parseInt(id!)} />
                  )}

                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Usando apenas toasts padrão do shadcn/ui - removido duplicatas */}
    </div>
  );
}