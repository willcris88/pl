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
import { Checkbox } from "@/components/ui/checkbox";
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
  
  const id = params.id || location.split('/').pop();
  
  const { toast } = useToast();
  const { playError, playSuccess, playWarning, playClick } = useSound();
  const { formRef } = useFormNavigation();

  const [activeTab, setActiveTab] = useState("dados-principais");
  const isEditing = Boolean(id) && location.includes('/editar/');

  // Estados dos modais
  const [isPendenciaModalOpen, setIsPendenciaModalOpen] = useState(false);
  const [isMotoristaModalOpen, setIsMotoristaModalOpen] = useState(false);
  const [editingPendencia, setEditingPendencia] = useState<any>(null);
  const [editingMotorista, setEditingMotorista] = useState<any>(null);

  // Carrega dados da ordem para edição
  const { data: ordemData, isLoading: isLoadingOrdem } = useQuery<OrdemServico>({
    queryKey: ["/ordens-servico", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiRequest("GET", `/ordens-servico/${id}`);
      return res.data;
    },
    enabled: isEditing && !!id,
  });

  // Carrega pendências apenas se estiver editando
  const { data: pendencias = [] } = useQuery({
    queryKey: ["ordens-servico", id, "pendencias"],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/ordens-servico/${id}/pendencias`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Erro ao buscar pendências:", error);
        return [];
      }
    },
    enabled: !!id,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Carrega motoristas apenas se estiver editando
  const { data: motoristas } = useQuery({
    queryKey: ["ordens-servico", id, "motoristas"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/ordens-servico/${id}/motoristas`);
      return res.data;
    },
    enabled: isEditing && !!id,
  });

  // Carrega documentos apenas se estiver editando
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
      
      toast({
        title: "Sucesso",
        description: isEditing ? "Ordem de serviço atualizada com sucesso!" : "Nova ordem de serviço criada com sucesso!",
      });
      
      if (!isEditing) {
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
    const fieldLabels: Record<string, string> = {
      numeroOs: "Número da OS",
      nomeFalecido: "Nome do Falecido",
      plano: "Plano"
    };

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
      
      toast({
        title: "Campos Obrigatórios",
        description: `Preencha os campos: ${missingFields.join(', ')}`,
        variant: "destructive",
      });

      const firstMissingField = requiredFields.find(field => {
        const value = data[field as keyof OrdemServicoForm];
        return !value || String(value).trim() === '';
      });

      if (firstMissingField) {
        const element = document.querySelector(`[name="${firstMissingField}"]`) as HTMLElement;
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

  // Configuração dos itens da sidebar seguindo padrão dos óbitos
  const sidebarItems = [
    { id: "dados-principais", label: "Dados Principais", icon: FileText, description: "OS e Falecido" },
    { id: "dados-responsavel", label: "Responsável", icon: Users, description: "Contato principal" },
    { id: "locais-datas", label: "Locais e Datas", icon: MapPinHouse, description: "Velório e sepultamento" },
    { id: "observacoes", label: "Observações", icon: FileText, description: "Informações extras" },
    ...(isEditing ? [
      { id: "pendencias", label: "Pendências", icon: AlertTriangle, description: "Tarefas pendentes" },
      { id: "produtos", label: "Produtos", icon: Package, description: "Itens utilizados" },
      { id: "motoristas", label: "Motoristas", icon: Car, description: "Equipe responsável" },
      { id: "documentos", label: "Documentos", icon: Upload, description: "Arquivos anexos" }
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
    <div className="flex">
      {/* Sidebar de navegação seguindo padrão dos óbitos */}
      <div className="w-80 border-r border-border bg-card/50 backdrop-blur-sm p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Navegação</h2>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Edite as informações da ordem de serviço" : "Preencha os dados da ordem de serviço"}
          </p>
        </div>
        
        {isEditing && ordemData && (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-primary">OS #{ordemData.numeroOs}</p>
            <p className="text-xs text-muted-foreground mt-1">{ordemData.nomeFalecido}</p>
          </div>
        )}
        
        <div className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <div className="flex-1">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs opacity-70">{item.description}</div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="pt-4 border-t border-border">
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={createMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createMutation.isPending ? "Salvando..." : (isEditing ? "Atualizar" : "Salvar")}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleCancel}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com abas */}
      <div className="flex-1 p-6">
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {activeTab === "dados-principais" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Dados Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="numeroOs">Número OS *</Label>
                    <Input
                      id="numeroOs"
                      {...form.register("numeroOs")}
                      className="h-9"
                    />
                    {form.formState.errors.numeroOs && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.numeroOs.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="plano">Plano *</Label>
                    <Select onValueChange={(value) => form.setValue("plano", value)} defaultValue={form.watch("plano")}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basico">Básico</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="luxo">Luxo</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.plano && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.plano.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="sinistro"
                      checked={form.watch("sinistro")}
                      onCheckedChange={(checked) => form.setValue("sinistro", !!checked)}
                    />
                    <Label htmlFor="sinistro" className="text-sm">
                      Sinistro
                    </Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomeFalecido">Nome do Falecido *</Label>
                    <Input
                      id="nomeFalecido"
                      {...form.register("nomeFalecido")}
                      className="h-9"
                    />
                    {form.formState.errors.nomeFalecido && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.nomeFalecido.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="cpfFalecido">CPF do Falecido</Label>
                    <Input
                      id="cpfFalecido"
                      {...form.register("cpfFalecido")}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select onValueChange={(value) => form.setValue("sexo", value)} defaultValue={form.watch("sexo")}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      {...form.register("peso")}
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="altura">Altura (cm)</Label>
                    <Input
                      id="altura"
                      type="number"
                      {...form.register("altura")}
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="religiao">Religião</Label>
                    <Input
                      id="religiao"
                      {...form.register("religiao")}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      {...form.register("dataNascimento")}
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataFalecimento">Data de Falecimento</Label>
                    <Input
                      id="dataFalecimento"
                      type="date"
                      {...form.register("dataFalecimento")}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contratante">Contratante</Label>
                    <Input
                      id="contratante"
                      {...form.register("contratante")}
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cnpjContratante">CNPJ do Contratante</Label>
                    <Input
                      id="cnpjContratante"
                      {...form.register("cnpjContratante")}
                      className="h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "dados-responsavel" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Dados do Responsável
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomeResponsavel">Nome do Responsável</Label>
                    <Input
                      id="nomeResponsavel"
                      {...form.register("nomeResponsavel")}
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="grauParentesco">Grau de Parentesco</Label>
                    <Select onValueChange={(value) => form.setValue("grauParentesco", value)} defaultValue={form.watch("grauParentesco")}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conjuge">Cônjuge</SelectItem>
                        <SelectItem value="filho">Filho(a)</SelectItem>
                        <SelectItem value="pai">Pai</SelectItem>
                        <SelectItem value="mae">Mãe</SelectItem>
                        <SelectItem value="irmao">Irmão(ã)</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="documentoResponsavel">Documento</Label>
                    <Input
                      id="documentoResponsavel"
                      {...form.register("documentoResponsavel")}
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telefoneResponsavel">Telefone Principal</Label>
                    <Input
                      id="telefoneResponsavel"
                      {...form.register("telefoneResponsavel")}
                      className="h-9"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone2Responsavel">Telefone Secundário</Label>
                    <Input
                      id="telefone2Responsavel"
                      {...form.register("telefone2Responsavel")}
                      className="h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "locais-datas" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPinHouse className="w-5 h-5" />
                  Locais e Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="enderecoCorpo">Endereço do Corpo</Label>
                  <Textarea
                    id="enderecoCorpo"
                    {...form.register("enderecoCorpo")}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="localVelorio">Local do Velório</Label>
                  <Textarea
                    id="localVelorio"
                    {...form.register("localVelorio")}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="enderecoSepultamento">Endereço do Sepultamento</Label>
                  <Textarea
                    id="enderecoSepultamento"
                    {...form.register("enderecoSepultamento")}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="dataHoraSepultamento">Data e Hora do Sepultamento</Label>
                  <Input
                    id="dataHoraSepultamento"
                    type="datetime-local"
                    {...form.register("dataHoraSepultamento")}
                    className="h-9"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "observacoes" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="descricaoServico">Descrição do Serviço</Label>
                  <Textarea
                    id="descricaoServico"
                    {...form.register("descricaoServico")}
                    className="min-h-[120px]"
                    placeholder="Digite aqui observações importantes sobre o serviço..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seções apenas para edição */}
          {isEditing && activeTab === "pendencias" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Pendências
                  </div>
                  <Button
                    type="button"
                    onClick={() => setIsPendenciaModalOpen(true)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendencias && pendencias.length > 0 ? (
                  <div className="space-y-2">
                    {pendencias.map((pendencia: any) => (
                      <div
                        key={pendencia.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{pendencia.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            {pendencia.tipo} - {pendencia.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingPendencia(pendencia);
                              setIsPendenciaModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma pendência cadastrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isEditing && activeTab === "produtos" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Produtos e Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductsSection ordemServicoId={parseInt(id!)} />
              </CardContent>
            </Card>
          )}

          {isEditing && activeTab === "motoristas" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Motoristas
                  </div>
                  <Button
                    type="button"
                    onClick={() => setIsMotoristaModalOpen(true)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {motoristas && motoristas.length > 0 ? (
                  <div className="space-y-2">
                    {motoristas.map((motorista: any) => (
                      <div
                        key={motorista.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{motorista.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {motorista.telefone} - {motorista.veiculo}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMotorista(motorista);
                              setIsMotoristaModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum motorista cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isEditing && activeTab === "documentos" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documentos && documentos.length > 0 ? (
                  <div className="space-y-2">
                    {documentos.map((documento: any) => (
                      <div
                        key={documento.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{documento.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {documento.tipo}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(documento.url, '_blank')}
                          >
                            Ver
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Upload className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum documento anexado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </form>
      </div>

      {/* Modais */}
      <PendenciaModal
        isOpen={isPendenciaModalOpen}
        onClose={() => {
          setIsPendenciaModalOpen(false);
          setEditingPendencia(null);
        }}
        ordemServicoId={parseInt(id!)}
        pendencia={editingPendencia}
      />

      <MotoristaModal
        isOpen={isMotoristaModalOpen}
        onClose={() => {
          setIsMotoristaModalOpen(false);
          setEditingMotorista(null);
        }}
        ordemServicoId={parseInt(id!)}
        motorista={editingMotorista}
      />
    </div>
  );
}