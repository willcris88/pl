import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, Info, User, Users, MapPin, FileText, Calendar, Phone, Save, 
  Clock, AlertTriangle, Package, Car, Upload, Plus, Trash2, Edit,
  Check, ShoppingCart, UserCheck, MapPinHouse, Search, Baby, Heart,
  MoreVertical, Download, ClipboardList
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { useSound } from "@/hooks/use-sound";
import { useFormNavigation } from "@/hooks/use-form-navigation";
import { inserirObitoSchema, type Obito, type InserirObito } from "@shared/schema";

export default function Obitos() {
  const [location, navigate] = useLocation();
  const params = useParams();
  
  const id = params.id || location.split('/').pop();
  
  const { toast } = useToast();
  const { playError, playSuccess, playWarning, playClick } = useSound();
  const { formRef } = useFormNavigation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("informacoes-gerais");
  const [search, setSearch] = useState("");
  const [isNatimorto, setIsNatimorto] = useState(false);
  const [isAtaModalOpen, setIsAtaModalOpen] = useState(false);
  const [selectedObitoId, setSelectedObitoId] = useState<number | null>(null);
  const [ataProcedimento, setAtaProcedimento] = useState({
    dataProcedimento: "",
    horaProcedimento: "",
    tecnicoResponsavel: ""
  });
  const isEditing = Boolean(id) && location.includes('/editar/');
  const isCreating = location.includes('/criar');
  const isListing = !isEditing && !isCreating;

  // Query para buscar óbitos (só na listagem)
  const { data: obitos = [], isLoading: isLoadingObitos } = useQuery({
    queryKey: ["/api/obitos"],
    queryFn: async () => {
      const response = await fetch("/api/obitos", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar óbitos");
      }
      return response.json();
    },
    enabled: isListing,
  });

  // Query para buscar óbito específico (só na edição)
  const { data: obitoData, isLoading: isLoadingObito } = useQuery<Obito>({
    queryKey: ["/api/obitos", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/obitos/${id}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar óbito");
      }
      return response.json();
    },
    enabled: isEditing && !!id,
  });

  const form = useForm<InserirObito>({
    resolver: zodResolver(inserirObitoSchema),
    defaultValues: {
      nome: "",
      sexo: "",
      cor: "",
      nascimento: "",
      profissao: "",
      naturalidade: "",
      estadoCivil: "",
      rg: "",
      cpf: "",
      deixaBens: "",
      testamento: "",
      cep: "",
      endereco: "",
      bairro: "",
      cidade: "",
      estado: "",
      nomePai: "",
      estadoCivilPai: "",
      nomeMae: "",
      estadoCivilMae: "",
      nomeConjuge: "",
      filhos: "",
      observacoes: "",
      natimorto: "",
      tipo: "",
      data: "",
      dataFalecimento: "",
      horaFalecimento: "",
      localFalecimento: "",
      cidadeFalecimento: "",
      ufFalecimento: "",
      dataSepultamento: "",
      horaSepultamento: "",
      localSepultamento: "",
      cidadeSepultamento: "",
      ufSepultamento: "",
      medico1: "",
      crm1: "",
      medico2: "",
      crm2: "",
      causaMorte: "",
      declarante: "",
      rgDeclarante: "",
      cpfDeclarante: "",
      grauParentesco: "",
      telefoneDeclarante: "",
      cepDeclarante: "",
      enderecoDeclarante: "",
      bairroDeclarante: "",
      cidadeDeclarante: "",
      ufDeclarante: "",
    // Campos específicos para natimorto
    idade: "",
    descIdade: "",
    horaNasc: "",
    localNasc: "",
    gestacao: "",
    duracao: "",
    avoPaterno: "",
    avoMaterno: "",
    avoPaterna: "",
    avoMaterna: "",
    nomeTestemunha1: "",
    rgCpfCnjTestemunha1: "",
    idadeTestemunha1: "",
    enderecoTestemunha1: "",
    bairroTestemunha1: "",
    },
  });

  // Preenche o formulário com dados do óbito ao editar
  useEffect(() => {
    if (obitoData && isEditing) {
      form.reset(obitoData);
      setIsNatimorto(Boolean(obitoData.natimorto === "true" || obitoData.natimorto === "1"));
    }
  }, [obitoData, isEditing, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InserirObito) => {
      const method = isEditing ? "PATCH" : "POST";
      const url = isEditing ? `/api/obitos/${id}` : "/api/obitos";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(isEditing ? "Erro ao atualizar óbito" : "Erro ao criar óbito");
      }
      return response.json();
    },
    onSuccess: () => {
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ["/api/obitos"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ["/api/obitos", id] });
      }
      
      toast({
        title: "Sucesso",
        description: isEditing ? "Óbito atualizado com sucesso!" : "Novo óbito criado com sucesso!",
      });
      
      if (!isEditing) {
        setTimeout(() => {
          navigate("/obitos");
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

  const deleteMutation = useMutation({
    mutationFn: async (obitoId: number) => {
      const response = await fetch(`/api/obitos/${obitoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Erro ao excluir óbito");
      }
      return response.json();
    },
    onSuccess: () => {
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ["/api/obitos"] });
      toast({
        title: "Sucesso",
        description: "Óbito excluído com sucesso",
      });
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

  const onSubmit = (data: InserirObito) => {
    // Validação básica de campo obrigatório
    if (!data.nome || data.nome.trim() === '') {
      playError();
      toast({
        title: "Campo Obrigatório",
        description: "O nome é obrigatório",
        variant: "destructive",
      });
      
      const element = document.getElementById("nome");
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    playClick();
    createMutation.mutate(data);
  };

  const handleCancel = () => {
    navigate("/obitos");
  };

  const handleEdit = (obito: Obito) => {
    navigate(`/obitos/editar/${obito.id}`);
  };

  const handleDelete = (obitoId: number) => {
    if (confirm("Tem certeza que deseja excluir este óbito?")) {
      deleteMutation.mutate(obitoId);
    }
  };

  const handleCreate = () => {
    navigate("/obitos/criar");
  };

  const handlePrintDeclaracao = async (obitoId: number) => {
    console.log('Tentando gerar declaração para óbito ID:', obitoId);
    try {
      const response = await fetch(`/api/obitos/${obitoId}/declaracao-pdf`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar declaração de óbito');
      }

      // Converter resposta para blob e abrir em nova aba
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      toast({
        title: "Sucesso",
        description: "Declaração de óbito gerada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao gerar declaração:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar declaração de óbito",
        variant: "destructive",
      });
    }
  };

  const handleOpenAtaModal = (obitoId: number) => {
    setSelectedObitoId(obitoId);
    setAtaProcedimento({
      dataProcedimento: new Date().toISOString().split('T')[0],
      horaProcedimento: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      tecnicoResponsavel: ""
    });
    setIsAtaModalOpen(true);
  };

  const handleGerarAta = async () => {
    if (!selectedObitoId) {
      console.log('Erro: selectedObitoId não definido');
      return;
    }

    console.log('Gerando Ata para óbito ID:', selectedObitoId, 'com dados:', ataProcedimento);
    
    try {
      const response = await fetch(`/api/ata-somatoconservacao/${selectedObitoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(ataProcedimento),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error('Erro ao gerar Ata de Somatoconservação');
      }

      // Abrir PDF em nova aba
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

      setIsAtaModalOpen(false);
      toast({
        title: "Sucesso",
        description: "Ata de Somatoconservação gerada com sucesso!",
      });
    } catch (error) {
      console.error('Erro completo ao gerar ata:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar Ata de Somatoconservação",
        variant: "destructive",
      });
    }
  };

  const sidebarItems = [
    { id: "informacoes-gerais", label: "Informações Gerais", icon: FileText, description: "Dados pessoais básicos", color: "bg-blue-500" },
    { id: "dados-obito", label: "Dados Óbito", icon: Calendar, description: "Falecimento e sepultamento", color: "bg-orange-500" },
    { id: "declaracao-medica", label: "Declaração Médica", icon: Users, description: "Informações médicas", color: "bg-green-500" },
    { id: "declarante", label: "Declarante", icon: User, description: "Dados do declarante", color: "bg-pink-500" },
  ];

  const handleNatimortoChange = (checked: boolean) => {
    setIsNatimorto(checked);
    form.setValue("natimorto", checked ? "true" : "false");
  };

  const filteredObitos = Array.isArray(obitos) ? obitos.filter((obito: Obito) =>
    obito.nome?.toLowerCase().includes(search.toLowerCase()) ||
    obito.cpf?.includes(search) ||
    obito.rg?.includes(search)
  ) : [];

  if (isLoadingObito || (isListing && isLoadingObitos)) {
    return (
      <div className="flex h-screen bg-dark">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Óbitos" />
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Carregando dados...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Layout de listagem
  if (isListing) {
    return (
      <div className="flex h-screen bg-dark">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Óbitos" />
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 max-w-7xl mx-auto space-y-6">
              {/* Header com botão criar */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Lista de Óbitos</h1>
                  <p className="text-muted-foreground">Gerencie todos os óbitos cadastrados</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Óbito
                  </Button>
                  <Button onClick={() => setIsAtaModalOpen(true)} className="bg-red-600 hover:bg-red-700">
                    Teste Modal ({String(isAtaModalOpen)})
                  </Button>
                </div>
              </div>

              {/* Filtros */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, CPF ou RG..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de óbitos */}
              {filteredObitos.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      {search ? "Nenhum óbito encontrado com esse filtro" : "Nenhum óbito cadastrado"}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredObitos.map((obito: Obito) => (
                    <Card key={obito.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                                    ID: {obito.id}
                                  </Badge>
                                  <p className="font-semibold text-lg text-foreground">{obito.nome}</p>
                                  {(obito.natimorto === "true" || obito.natimorto === "1" || obito.natimorto === true) && (
                                    <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700">
                                      <Baby className="w-3 h-3 mr-1" />
                                      Natimorto
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {obito.sexo} • {obito.nascimento}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Documentos</p>
                                <p className="font-medium text-foreground">
                                  RG: {obito.rg || "Não informado"}
                                </p>
                                <p className="font-medium text-foreground">
                                  CPF: {obito.cpf || "Não informado"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Falecimento</p>
                                <p className="font-medium text-foreground">
                                  {obito.dataFalecimento} {obito.horaFalecimento}
                                </p>
                                <p className="text-sm text-muted-foreground">{obito.localFalecimento}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Sepultamento</p>
                                <p className="font-medium text-foreground">
                                  {obito.dataSepultamento} {obito.horaSepultamento}
                                </p>
                                <p className="text-sm text-muted-foreground">{obito.localSepultamento}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(obito)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Documentos</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                  <DropdownMenuItem onClick={() => handlePrintDeclaracao(obito.id)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Impressão de óbito</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenAtaModal(obito.id)}>
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    <span>Ata somatoconservação</span>
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(obito.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Layout de formulário (criar/editar) - Design moderno igual às ordens de serviço
  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={isEditing ? "Editar Óbito" : "Criar Óbito"} />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar">
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
                        {isEditing ? "Editar Óbito" : "Novo Óbito"}
                      </h1>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">
                        {isEditing ? "Modifique os dados do óbito" : "Preencha os dados para registrar um novo óbito"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isEditing && obitoData && (
                      <Badge variant="outline" className="px-3 py-1 bg-white/50 dark:bg-slate-700/50">
                        {obitoData.nome}
                      </Badge>
                    )}
                    <Button type="button" variant="outline" onClick={handleCancel} className="gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Grid Layout Ultra-Moderno */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Sidebar Ultra-Moderno */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-6 border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        Navegação
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Seções do formulário
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
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
                            onClick={() => setActiveTab(item.id)}
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
                        {activeTab === "informacoes-gerais" && (
                          <>
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                              Informações Gerais
                            </span>
                          </>
                        )}
                        {activeTab === "dados-obito" && (
                          <>
                            <div className="p-2 bg-red-500 rounded-lg">
                              <Heart className="h-6 w-6 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                              Dados do Óbito
                            </span>
                          </>
                        )}
                        {activeTab === "declaracao-medica" && (
                          <>
                            <div className="p-2 bg-green-500 rounded-lg">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                              Declaração Médica
                            </span>
                          </>
                        )}
                        {activeTab === "declarante" && (
                          <>
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                              Dados do Declarante
                            </span>
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Informações Gerais */}
                {activeTab === "informacoes-gerais" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Informações Gerais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Checkbox Natimorto */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="natimorto"
                              checked={isNatimorto}
                              onCheckedChange={handleNatimortoChange}
                              className="w-5 h-5"
                            />
                            <div className="flex items-center gap-2">
                              <Baby className="w-4 h-4 text-purple-600" />
                              <Label 
                                htmlFor="natimorto" 
                                className="text-sm font-medium text-purple-700 dark:text-purple-300 cursor-pointer"
                              >
                                Este óbito é de um natimorto
                              </Label>
                            </div>
                          </div>
                          {isNatimorto && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 ml-8">
                              Campos específicos para natimorto serão exibidos
                            </p>
                          )}
                        </div>

                        {/* Campos específicos para natimorto */}
                        {isNatimorto && (
                          <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-lg border border-purple-200 dark:border-purple-700 space-y-6">
                            <h4 className="font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2 text-lg">
                              <Baby className="w-5 h-5" />
                              Dados Natimorto
                            </h4>
                            
                            {/* Primeira linha - dados básicos */}
                            <div className="grid grid-cols-6 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="idade" className="text-sm font-medium">Idade</Label>
                                <Input
                                  id="idade"
                                  placeholder="Idade"
                                  {...form.register("idade")}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="descIdade" className="text-sm font-medium">Desc. Idade</Label>
                                <Input
                                  id="descIdade"
                                  placeholder="Descrição"
                                  {...form.register("descIdade")}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="horaNasc" className="text-sm font-medium">Hora Nasc</Label>
                                <Input
                                  id="horaNasc"
                                  type="time"
                                  {...form.register("horaNasc")}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="localNasc" className="text-sm font-medium">Local Nasc</Label>
                                <Input
                                  id="localNasc"
                                  placeholder="Local nascimento"
                                  {...form.register("localNasc")}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="gestacao" className="text-sm font-medium">Gestação</Label>
                                <Input
                                  id="gestacao"
                                  placeholder="Gestação"
                                  {...form.register("gestacao")}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="duracao" className="text-sm font-medium">Duração</Label>
                                <Input
                                  id="duracao"
                                  placeholder="Duração"
                                  {...form.register("duracao")}
                                  className="h-9"
                                />
                              </div>
                            </div>

                            {/* Segunda linha - avós */}
                            <div className="space-y-3">
                              <h5 className="font-medium text-purple-600 dark:text-purple-400">Avós</h5>
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label htmlFor="avoPaterno" className="text-sm font-medium">Avô Paterno</Label>
                                  <Input
                                    id="avoPaterno"
                                    placeholder="Nome do avô paterno"
                                    {...form.register("avoPaterno")}
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="avoMaterno" className="text-sm font-medium">Avô Materno</Label>
                                  <Input
                                    id="avoMaterno"
                                    placeholder="Nome do avô materno"
                                    {...form.register("avoMaterno")}
                                    className="h-9"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label htmlFor="avoPaterna" className="text-sm font-medium">Avó Paterna</Label>
                                  <Input
                                    id="avoPaterna"
                                    placeholder="Nome da avó paterna"
                                    {...form.register("avoPaterna")}
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="avoMaterna" className="text-sm font-medium">Avó Materna</Label>
                                  <Input
                                    id="avoMaterna"
                                    placeholder="Nome da avó materna"
                                    {...form.register("avoMaterna")}
                                    className="h-9"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Terceira linha - testemunhas */}
                            <div className="space-y-3">
                              <h5 className="font-medium text-purple-600 dark:text-purple-400">Testemunha 1</h5>
                              <div className="grid grid-cols-5 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="nomeTestemunha1" className="text-sm font-medium">Nome</Label>
                                  <Input
                                    id="nomeTestemunha1"
                                    placeholder="Nome completo"
                                    {...form.register("nomeTestemunha1")}
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="rgCpfCnjTestemunha1" className="text-sm font-medium">RG/CPF/CNJ</Label>
                                  <Input
                                    id="rgCpfCnjTestemunha1"
                                    placeholder="Documento"
                                    {...form.register("rgCpfCnjTestemunha1")}
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="idadeTestemunha1" className="text-sm font-medium">Idade</Label>
                                  <Input
                                    id="idadeTestemunha1"
                                    placeholder="Idade"
                                    {...form.register("idadeTestemunha1")}
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="enderecoTestemunha1" className="text-sm font-medium">Endereço</Label>
                                  <Input
                                    id="enderecoTestemunha1"
                                    placeholder="Endereço"
                                    {...form.register("enderecoTestemunha1")}
                                    className="h-9"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="bairroTestemunha1" className="text-sm font-medium">Bairro</Label>
                                  <Input
                                    id="bairroTestemunha1"
                                    placeholder="Bairro"
                                    {...form.register("bairroTestemunha1")}
                                    className="h-9"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <Separator />
                        
                        {/* Dados Pessoais - Campos básicos sempre visíveis */}
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="nome" className="text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Nome Completo *
                              </Label>
                              <Input
                                id="nome"
                                placeholder="Digite o nome completo"
                                {...form.register("nome")}
                                className={`h-11 ${form.formState.errors.nome ? "border-red-500" : ""}`}
                              />
                              {form.formState.errors.nome && (
                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.nome.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sexo" className="text-sm font-medium">Sexo</Label>
                              <Select onValueChange={(value) => form.setValue("sexo", value)} value={form.watch("sexo")}>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Selecione o sexo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Masculino">Masculino</SelectItem>
                                  <SelectItem value="Feminino">Feminino</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cor" className="text-sm font-medium">Cor/Raça</Label>
                              <Select onValueChange={(value) => form.setValue("cor", value)} value={form.watch("cor")}>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Branca">Branca</SelectItem>
                                  <SelectItem value="Preta">Preta</SelectItem>
                                  <SelectItem value="Parda">Parda</SelectItem>
                                  <SelectItem value="Amarela">Amarela</SelectItem>
                                  <SelectItem value="Indígena">Indígena</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="nascimento" className="text-sm font-medium">Data de Nascimento</Label>
                              <Input
                                id="nascimento"
                                type="date"
                                {...form.register("nascimento")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="naturalidade" className="text-sm font-medium">Naturalidade</Label>
                              <Input
                                id="naturalidade"
                                placeholder="Cidade onde nasceu"
                                {...form.register("naturalidade")}
                                className="h-9"
                              />
                            </div>
                          </div>

                          {/* Campos que ficam desabilitados quando é natimorto */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="estadoCivil" className="text-sm font-medium">Estado Civil</Label>
                              <Select 
                                onValueChange={(value) => form.setValue("estadoCivil", value)} 
                                value={form.watch("estadoCivil")}
                                disabled={isNatimorto}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                                  <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                                  <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                                  <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                                  <SelectItem value="União Estável">União Estável</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="profissao" className="text-sm font-medium">Profissão</Label>
                              <Input
                                id="profissao"
                                placeholder="Digite a profissão"
                                {...form.register("profissao")}
                                className="h-9"
                                disabled={isNatimorto}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="rg" className="text-sm font-medium">RG</Label>
                              <Input
                                id="rg"
                                placeholder="Número do RG"
                                {...form.register("rg")}
                                className="h-9"
                                disabled={isNatimorto}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                              <Input
                                id="cpf"
                                placeholder="000.000.000-00"
                                {...form.register("cpf")}
                                className="h-9"
                                disabled={isNatimorto}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="deixaBens" className="text-sm font-medium">Deixa Bens</Label>
                              <Select 
                                onValueChange={(value) => form.setValue("deixaBens", value)} 
                                value={form.watch("deixaBens")}
                                disabled={isNatimorto}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Sim">Sim</SelectItem>
                                  <SelectItem value="Não">Não</SelectItem>
                                  <SelectItem value="Não declarado">Não declarado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="testamento" className="text-sm font-medium">Testamento</Label>
                              <Select 
                                onValueChange={(value) => form.setValue("testamento", value)} 
                                value={form.watch("testamento")}
                                disabled={isNatimorto}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Sim">Sim</SelectItem>
                                  <SelectItem value="Não">Não</SelectItem>
                                  <SelectItem value="Não declarado">Não declarado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        {/* Endereço */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Endereço
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cep" className="text-sm font-medium">CEP</Label>
                              <Input
                                id="cep"
                                placeholder="00000-000"
                                {...form.register("cep")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2 col-span-2">
                              <Label htmlFor="endereco" className="text-sm font-medium">Endereço</Label>
                              <Input
                                id="endereco"
                                placeholder="Rua, número, complemento"
                                {...form.register("endereco")}
                                className="h-9"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="bairro" className="text-sm font-medium">Bairro</Label>
                              <Input
                                id="bairro"
                                placeholder="Nome do bairro"
                                {...form.register("bairro")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cidade" className="text-sm font-medium">Cidade</Label>
                              <Input
                                id="cidade"
                                placeholder="Nome da cidade"
                                {...form.register("cidade")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="estado" className="text-sm font-medium">Estado</Label>
                              <Input
                                id="estado"
                                placeholder="UF"
                                {...form.register("estado")}
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Filiação - Sempre exibe */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Filiação
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="nomePai" className="text-sm font-medium">Nome do Pai</Label>
                            <Input
                              id="nomePai"
                              placeholder="Digite o nome do pai"
                              {...form.register("nomePai")}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="estadoCivilPai" className="text-sm font-medium">Estado Civil do Pai</Label>
                            <Select onValueChange={(value) => form.setValue("estadoCivilPai", value)} value={form.watch("estadoCivilPai")}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Solteiro">Solteiro</SelectItem>
                                <SelectItem value="Casado">Casado</SelectItem>
                                <SelectItem value="Divorciado">Divorciado</SelectItem>
                                <SelectItem value="Viúvo">Viúvo</SelectItem>
                                <SelectItem value="União Estável">União Estável</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="nomeMae" className="text-sm font-medium">Nome da Mãe</Label>
                            <Input
                              id="nomeMae"
                              placeholder="Digite o nome da mãe"
                              {...form.register("nomeMae")}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="estadoCivilMae" className="text-sm font-medium">Estado Civil da Mãe</Label>
                            <Select onValueChange={(value) => form.setValue("estadoCivilMae", value)} value={form.watch("estadoCivilMae")}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Solteira">Solteira</SelectItem>
                                <SelectItem value="Casada">Casada</SelectItem>
                                <SelectItem value="Divorciada">Divorciada</SelectItem>
                                <SelectItem value="Viúva">Viúva</SelectItem>
                                <SelectItem value="União Estável">União Estável</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cônjuge e Família - Desabilitados quando é natimorto */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Dados Cônjuge e Família
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="nomeConjuge" className="text-sm font-medium">Nome do Cônjuge</Label>
                          <Input
                            id="nomeConjuge"
                            placeholder="Digite o nome do cônjuge"
                            {...form.register("nomeConjuge")}
                            className="h-9"
                            disabled={isNatimorto}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="filhos" className="text-sm font-medium">Filhos</Label>
                          <Textarea
                            id="filhos"
                            placeholder="Informações sobre filhos (nomes, idades, etc.)"
                            {...form.register("filhos")}
                            className="min-h-[60px]"
                            disabled={isNatimorto}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Observações - Sempre liberado */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Observações Importantes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label htmlFor="observacoes" className="text-sm font-medium">Observações Gerais</Label>
                          <Textarea
                            id="observacoes"
                            placeholder="Informações importantes sobre o óbito, detalhes relevantes, observações médicas, etc."
                            {...form.register("observacoes")}
                            className="min-h-[80px]"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Dados Óbito */}
                {activeTab === "dados-obito" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Dados Gerais - Informações do Óbito
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Dados do Falecimento */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Dados do Falecimento
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="dataFalecimento" className="text-sm font-medium">Data do Falecimento</Label>
                              <Input
                                id="dataFalecimento"
                                type="date"
                                {...form.register("dataFalecimento")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="horaFalecimento" className="text-sm font-medium">Hora</Label>
                              <Input
                                id="horaFalecimento"
                                type="time"
                                {...form.register("horaFalecimento")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="localFalecimento" className="text-sm font-medium">Local do Falecimento</Label>
                              <Input
                                id="localFalecimento"
                                placeholder="Hospital, residência, etc."
                                {...form.register("localFalecimento")}
                                className="h-9"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cidadeFalecimento" className="text-sm font-medium">Cidade do Falecimento</Label>
                              <Input
                                id="cidadeFalecimento"
                                placeholder="Nome da cidade"
                                {...form.register("cidadeFalecimento")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ufFalecimento" className="text-sm font-medium">UF</Label>
                              <Input
                                id="ufFalecimento"
                                placeholder="Estado"
                                {...form.register("ufFalecimento")}
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        {/* Dados do Sepultamento */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Dados do Sepultamento
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="dataSepultamento" className="text-sm font-medium">Data do Sepultamento</Label>
                              <Input
                                id="dataSepultamento"
                                type="date"
                                {...form.register("dataSepultamento")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="horaSepultamento" className="text-sm font-medium">Hora</Label>
                              <Input
                                id="horaSepultamento"
                                type="time"
                                {...form.register("horaSepultamento")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="localSepultamento" className="text-sm font-medium">Local do Sepultamento</Label>
                              <Input
                                id="localSepultamento"
                                placeholder="Cemitério, crematório, etc."
                                {...form.register("localSepultamento")}
                                className="h-9"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cidadeSepultamento" className="text-sm font-medium">Cidade do Sepultamento</Label>
                              <Input
                                id="cidadeSepultamento"
                                placeholder="Nome da cidade"
                                {...form.register("cidadeSepultamento")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ufSepultamento" className="text-sm font-medium">UF</Label>
                              <Input
                                id="ufSepultamento"
                                placeholder="Estado"
                                {...form.register("ufSepultamento")}
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Declaração Médica */}
                {activeTab === "declaracao-medica" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Declaração Médica
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="medico1" className="text-sm font-medium">Médico Responsável</Label>
                            <Input
                              id="medico1"
                              placeholder="Nome completo do médico"
                              {...form.register("medico1")}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="crm1" className="text-sm font-medium">CRM</Label>
                            <Input
                              id="crm1"
                              placeholder="Número do CRM"
                              {...form.register("crm1")}
                              className="h-9"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="medico2" className="text-sm font-medium">Médico Auxiliar (opcional)</Label>
                            <Input
                              id="medico2"
                              placeholder="Nome completo do médico"
                              {...form.register("medico2")}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="crm2" className="text-sm font-medium">CRM</Label>
                            <Input
                              id="crm2"
                              placeholder="Número do CRM"
                              {...form.register("crm2")}
                              className="h-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="causaMorte" className="text-sm font-medium">Causa da Morte</Label>
                          <Textarea
                            id="causaMorte"
                            placeholder="Descreva a causa da morte conforme declaração médica"
                            {...form.register("causaMorte")}
                            className="min-h-[120px]"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Declarante */}
                {activeTab === "declarante" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Dados do Declarante
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Dados Pessoais do Declarante */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Dados Pessoais
                          </h4>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="declarante" className="text-sm font-medium">Nome Completo do Declarante</Label>
                              <Input
                                id="declarante"
                                placeholder="Digite o nome completo"
                                {...form.register("declarante")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="grauParentesco" className="text-sm font-medium">Grau de Parentesco</Label>
                              <Select onValueChange={(value) => form.setValue("grauParentesco", value)} value={form.watch("grauParentesco")}>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pai">Pai</SelectItem>
                                  <SelectItem value="Mãe">Mãe</SelectItem>
                                  <SelectItem value="Filho(a)">Filho(a)</SelectItem>
                                  <SelectItem value="Cônjuge">Cônjuge</SelectItem>
                                  <SelectItem value="Irmão(ã)">Irmão(ã)</SelectItem>
                                  <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="rgDeclarante" className="text-sm font-medium">RG</Label>
                              <Input
                                id="rgDeclarante"
                                placeholder="Número do RG"
                                {...form.register("rgDeclarante")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cpfDeclarante" className="text-sm font-medium">CPF</Label>
                              <Input
                                id="cpfDeclarante"
                                placeholder="000.000.000-00"
                                {...form.register("cpfDeclarante")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="telefoneDeclarante" className="text-sm font-medium">Telefone</Label>
                              <Input
                                id="telefoneDeclarante"
                                placeholder="(00) 00000-0000"
                                {...form.register("telefoneDeclarante")}
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        {/* Endereço do Declarante */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Endereço do Declarante
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cepDeclarante" className="text-sm font-medium">CEP</Label>
                              <Input
                                id="cepDeclarante"
                                placeholder="00000-000"
                                {...form.register("cepDeclarante")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2 col-span-2">
                              <Label htmlFor="enderecoDeclarante" className="text-sm font-medium">Endereço</Label>
                              <Input
                                id="enderecoDeclarante"
                                placeholder="Rua, número, complemento"
                                {...form.register("enderecoDeclarante")}
                                className="h-9"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="bairroDeclarante" className="text-sm font-medium">Bairro</Label>
                              <Input
                                id="bairroDeclarante"
                                placeholder="Nome do bairro"
                                {...form.register("bairroDeclarante")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cidadeDeclarante" className="text-sm font-medium">Cidade</Label>
                              <Input
                                id="cidadeDeclarante"
                                placeholder="Nome da cidade"
                                {...form.register("cidadeDeclarante")}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ufDeclarante" className="text-sm font-medium">UF</Label>
                              <Input
                                id="ufDeclarante"
                                placeholder="Estado"
                                {...form.register("ufDeclarante")}
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}


                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Ata de Somatoconservação - Versão Funcional */}
      {(() => {
        console.log('DEBUG: isAtaModalOpen =', isAtaModalOpen, 'selectedObitoId =', selectedObitoId);
        return null;
      })()}
      {isAtaModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setIsAtaModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ata de Somatoconservação
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                Informe a data e hora do procedimento realizado
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Card principal com fundo elegante */}
              <div className="border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        📅 Data do Procedimento
                      </label>
                      <input
                        type="date"
                        value={ataProcedimento.dataProcedimento}
                        onChange={(e) => setAtaProcedimento(prev => ({ ...prev, dataProcedimento: e.target.value }))}
                        className="w-full h-11 px-3 border border-blue-200 dark:border-blue-700 rounded-md focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        🕐 Hora do Procedimento
                      </label>
                      <input
                        type="time"
                        value={ataProcedimento.horaProcedimento}
                        onChange={(e) => setAtaProcedimento(prev => ({ ...prev, horaProcedimento: e.target.value }))}
                        className="w-full h-11 px-3 border border-blue-200 dark:border-blue-700 rounded-md focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      👨‍⚕️ Técnico Responsável
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do técnico responsável pelo procedimento"
                      value={ataProcedimento.tecnicoResponsavel}
                      onChange={(e) => setAtaProcedimento(prev => ({ ...prev, tecnicoResponsavel: e.target.value }))}
                      className="w-full h-11 px-3 border border-blue-200 dark:border-blue-700 rounded-md focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAtaModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGerarAta}
                  disabled={!ataProcedimento.tecnicoResponsavel.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  Gerar Ata
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}