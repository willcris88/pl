import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  HeartHandshake,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Pet, InserirPet } from "@/shared/schema";

const ITEMS_PER_PAGE = 10;

// Interface para estatísticas
interface PetStats {
  total: number;
  caes: number;
  gatos: number;
  outros: number;
}

export default function PetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState<Partial<InserirPet>>({
    data: '',
    agenteFunerario: '',
    numeroLacre: '',
    nome: '',
    raca: '',
    cor: '',
    peso: '',
    utilizaMarcapasso: 'nao',
    especie: '',
    localObito: '',
    causaFalecimento: '',
    crematorio: '',
    tipoCremacao: '',
    nomeTutor: '',
    cpf: '',
    rg: '',
    cep: '',
    endereco: '',
    telefoneCelular: '',
    telefoneFixo: '',
    email: '',
    contratante: '',
    seguro: '',
    numeroSinistro: '',
    valorCobertura: '',
    documentos: '',
    valorPago: '',
    servicoContratado: '',
    descricoes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pets = [], isLoading, error } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
    queryFn: async () => {
      const response = await fetch("/api/pets");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      return response.json();
    },
  });

  // Calcular estatísticas
  const stats: PetStats = useMemo(() => {
    const total = pets.length;
    const caes = pets.filter(pet => pet.especie?.toLowerCase().includes('cão') || pet.especie?.toLowerCase().includes('cachorro')).length;
    const gatos = pets.filter(pet => pet.especie?.toLowerCase().includes('gato')).length;
    const outros = total - caes - gatos;
    
    return { total, caes, gatos, outros };
  }, [pets]);

  // Filtrar pets baseado na busca
  const filteredPets = useMemo(() => {
    if (!searchTerm) return pets;
    
    const searchLower = searchTerm.toLowerCase();
    return pets.filter(pet => 
      pet.nome.toLowerCase().includes(searchLower) ||
      (pet.especie && pet.especie.toLowerCase().includes(searchLower)) ||
      (pet.raca && pet.raca.toLowerCase().includes(searchLower)) ||
      (pet.nomeTutor && pet.nomeTutor.toLowerCase().includes(searchLower)) ||
      (pet.telefoneCelular && pet.telefoneCelular.toLowerCase().includes(searchLower))
    );
  }, [pets, searchTerm]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredPets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPets = filteredPets.slice(startIndex, endIndex);

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return 'N/A';
    try {
      const num = parseFloat(value);
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(num);
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'pago':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getEspecieColor = (especie: string | null) => {
    const especieLower = especie?.toLowerCase() || '';
    if (especieLower.includes('cão') || especieLower.includes('cachorro')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
    if (especieLower.includes('gato')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    }
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
  };

  // Mutação para criar pet
  const createPetMutation = useMutation({
    mutationFn: async (petData: InserirPet) => {
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petData),
      });
      if (!response.ok) throw new Error('Erro ao criar pet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      setShowModal(false);
      resetForm();
      toast({
        title: "Sucesso!",
        description: "Pet criado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar pet:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar pet. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar pet
  const updatePetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InserirPet> }) => {
      const response = await fetch(`/api/pets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao atualizar pet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      setShowModal(false);
      resetForm();
      toast({
        title: "Sucesso!",
        description: "Pet atualizado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar pet:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar pet. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutação para deletar pet
  const deletePetMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/pets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar pet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
      toast({
        title: "Sucesso!",
        description: "Pet excluído com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Erro ao deletar pet:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir pet. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      data: '',
      agenteFunerario: '',
      numeroLacre: '',
      nome: '',
      raca: '',
      cor: '',
      peso: '',
      utilizaMarcapasso: 'nao',
      especie: '',
      localObito: '',
      causaFalecimento: '',
      crematorio: '',
      tipoCremacao: '',
      nomeTutor: '',
      cpf: '',
      rg: '',
      cep: '',
      endereco: '',
      telefoneCelular: '',
      telefoneFixo: '',
      email: '',
      contratante: '',
      seguro: '',
      numeroSinistro: '',
      valorCobertura: '',
      documentos: '',
      valorPago: '',
      servicoContratado: '',
      descricoes: ''
    });
    setEditingPet(null);
  };

  const handleOpenModal = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet);
      setFormData({
        data: pet.data || '',
        agenteFunerario: pet.agenteFunerario || '',
        numeroLacre: pet.numeroLacre || '',
        nome: pet.nome || '',
        raca: pet.raca || '',
        cor: pet.cor || '',
        peso: pet.peso || '',
        utilizaMarcapasso: pet.utilizaMarcapasso || 'nao',
        especie: pet.especie || '',
        localObito: pet.localObito || '',
        causaFalecimento: pet.causaFalecimento || '',
        crematorio: pet.crematorio || '',
        tipoCremacao: pet.tipoCremacao || '',
        nomeTutor: pet.nomeTutor || '',
        cpf: pet.cpf || '',
        rg: pet.rg || '',
        cep: pet.cep || '',
        endereco: pet.endereco || '',
        telefoneCelular: pet.telefoneCelular || '',
        telefoneFixo: pet.telefoneFixo || '',
        email: pet.email || '',
        contratante: pet.contratante || '',
        seguro: pet.seguro || '',
        numeroSinistro: pet.numeroSinistro || '',
        valorCobertura: pet.valorCobertura || '',
        documentos: pet.documentos || '',
        valorPago: pet.valorPago || '',
        servicoContratado: pet.servicoContratado || '',
        descricoes: pet.descricoes || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPet) {
      updatePetMutation.mutate({ id: editingPet.id, data: formData });
    } else {
      createPetMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este pet?')) {
      deletePetMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-foreground mb-8">
                Pets
              </h1>
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-foreground mb-8">
                Pets
              </h1>
              <div className="text-center text-red-600 dark:text-red-400">
                Erro ao carregar pets: {error.message}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-foreground">
                Gerenciamento de Pets
              </h1>
              <Button 
                onClick={() => handleOpenModal()} 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Pet
              </Button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Pets</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{stats.total}</p>
                  </div>
                  <HeartHandshake className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cães</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.caes}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">🐕</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gatos</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.gatos}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">🐱</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Outros</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.outros}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <span className="text-orange-600 font-bold">🐾</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Busca */}
            <div className="flex gap-4 items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, espécie, raça ou tutor..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {searchTerm ? (
                  <>Mostrando {filteredPets.length} de {pets.length}</>
                ) : (
                  <>Total: {pets.length} pets</>
                )}
              </div>
            </div>

            {/* Tabela */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Espécie
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tutor
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Valor Serviço
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentPets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'Nenhum pet encontrado para esta busca' : 'Nenhum pet encontrado'}
                        </td>
                      </tr>
                    ) : (
                      currentPets.map((pet) => (
                        <tr key={pet.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-foreground max-w-48 truncate">
                            {pet.nome}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getEspecieColor(pet.especie)}`}
                            >
                              {pet.especie || 'N/I'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-32 truncate">
                            {pet.nomeTutor || 'N/I'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {pet.telefoneCelular || 'N/I'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {formatCurrency(pet.valorPago)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getStatusColor(pet.statusPagamento)}`}
                            >
                              {pet.statusPagamento || 'N/I'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                title="Editar"
                                onClick={() => handleOpenModal(pet)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700" 
                                title="Excluir"
                                onClick={() => handleDelete(pet.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredPets.length)} de {filteredPets.length} resultados
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="h-8 w-8 p-0 text-xs"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Moderno e Atrativo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] border border-slate-700/50 backdrop-blur-md flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Premium com Gradiente */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 px-8 py-6 rounded-t-2xl relative overflow-hidden">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                      {editingPet ? 'Editar Pet' : 'Adicionar Novo Pet'}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {editingPet ? 'Atualize as informações do pet' : 'Preencha os dados do novo pet'}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0 transition-all duration-300 hover:rotate-90"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Conteúdo do Formulário */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seção - Informações Gerais */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Informações Gerais</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Dados básicos do atendimento</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        📅 Data
                      </label>
                      <Input
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData({...formData, data: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        👨‍💼 Agente Funerário
                      </label>
                      <Input
                        type="text"
                        value={formData.agenteFunerario}
                        onChange={(e) => setFormData({...formData, agenteFunerario: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Nome do agente responsável"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🏷️ Número Lacre
                      </label>
                      <Input
                        type="text"
                        value={formData.numeroLacre}
                        onChange={(e) => setFormData({...formData, numeroLacre: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Número do lacre"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção - Dados do Pet */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Dados do Pet</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Informações específicas do animal</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🐕 Nome *
                      </label>
                      <Input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Nome do pet"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🧬 Raça
                      </label>
                      <Input
                        type="text"
                        value={formData.raca}
                        onChange={(e) => setFormData({...formData, raca: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Raça do animal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🎨 Cor
                      </label>
                      <Input
                        type="text"
                        value={formData.cor}
                        onChange={(e) => setFormData({...formData, cor: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Cor do pet"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        ⚖️ Peso
                      </label>
                      <Input
                        type="text"
                        value={formData.peso}
                        onChange={(e) => setFormData({...formData, peso: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Peso em kg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        💓 Marcapasso
                      </label>
                      <select
                        value={formData.utilizaMarcapasso}
                        onChange={(e) => setFormData({...formData, utilizaMarcapasso: e.target.value})}
                        className="w-full h-10 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all"
                      >
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🦴 Espécie
                      </label>
                      <Input
                        type="text"
                        value={formData.especie}
                        onChange={(e) => setFormData({...formData, especie: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Cão, Gato, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Seção - Dados do Óbito */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Dados do Óbito</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Informações sobre o falecimento</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        📍 Local do óbito
                      </label>
                      <Input
                        type="text"
                        value={formData.localObito}
                        onChange={(e) => setFormData({...formData, localObito: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        placeholder="Local onde ocorreu o óbito"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🩺 Causa Falecimento
                      </label>
                      <Input
                        type="text"
                        value={formData.causaFalecimento}
                        onChange={(e) => setFormData({...formData, causaFalecimento: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        placeholder="Causa do falecimento"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🏛️ Crematório / Cemitério
                      </label>
                      <Input
                        type="text"
                        value={formData.crematorio}
                        onChange={(e) => setFormData({...formData, crematorio: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        placeholder="Local do sepultamento"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🔥 Tipo Cremação
                      </label>
                      <Input
                        type="text"
                        value={formData.tipoCremacao}
                        onChange={(e) => setFormData({...formData, tipoCremacao: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        placeholder="Tipo de cremação"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção - Dados do Tutor */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Dados do Tutor</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Informações pessoais do responsável</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        👤 Nome do tutor
                      </label>
                      <Input
                        type="text"
                        value={formData.nomeTutor}
                        onChange={(e) => setFormData({...formData, nomeTutor: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🆔 CPF
                      </label>
                      <Input
                        type="text"
                        value={formData.cpf}
                        onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        📄 RG
                      </label>
                      <Input
                        type="text"
                        value={formData.rg}
                        onChange={(e) => setFormData({...formData, rg: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="00.000.000-0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🏠 CEP
                      </label>
                      <Input
                        type="text"
                        value={formData.cep}
                        onChange={(e) => setFormData({...formData, cep: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="00000-000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        🗺️ Endereço
                      </label>
                      <Input
                        type="text"
                        value={formData.endereco}
                        onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="Rua, número, bairro"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        📱 Telefone Celular
                      </label>
                      <Input
                        type="text"
                        value={formData.telefoneCelular}
                        onChange={(e) => setFormData({...formData, telefoneCelular: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        ☎️ Telefone Fixo
                      </label>
                      <Input
                        type="text"
                        value={formData.telefoneFixo}
                        onChange={(e) => setFormData({...formData, telefoneFixo: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="(00) 0000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        📧 E-mail
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="h-10 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção Compacta - Serviços e Valores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Serviços do Seguro</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Informações do seguro</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            🏢 Contratante
                          </label>
                          <Input
                            type="text"
                            value={formData.contratante}
                            onChange={(e) => setFormData({...formData, contratante: e.target.value})}
                            className="h-9 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Nome do contratante"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            🛡️ Seguro
                          </label>
                          <Input
                            type="text"
                            value={formData.seguro}
                            onChange={(e) => setFormData({...formData, seguro: e.target.value})}
                            className="h-9 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Nome da seguradora"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            📊 Número Sinistro
                          </label>
                          <Input
                            type="text"
                            value={formData.numeroSinistro}
                            onChange={(e) => setFormData({...formData, numeroSinistro: e.target.value})}
                            className="h-9 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Número do sinistro"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            💰 Valor Cobertura
                          </label>
                          <Input
                            type="text"
                            value={formData.valorCobertura}
                            onChange={(e) => setFormData({...formData, valorCobertura: e.target.value})}
                            className="h-9 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="R$ 0,00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Serviços do Tutor</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Valores particulares</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          💵 Valor pago
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.valorPago}
                          onChange={(e) => setFormData({...formData, valorPago: e.target.value})}
                          className="h-9 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                          placeholder="R$ 0,00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          🛠️ Serviço contratado
                        </label>
                        <Input
                          type="text"
                          value={formData.servicoContratado}
                          onChange={(e) => setFormData({...formData, servicoContratado: e.target.value})}
                          className="h-9 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                          placeholder="Descrição do serviço"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção - Observações */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Observações</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Informações complementares</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        📄 Documentos
                      </label>
                      <textarea
                        value={formData.documentos}
                        onChange={(e) => setFormData({...formData, documentos: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-violet-500 transition-all"
                        placeholder="Lista de documentos necessários..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        📝 Descrições
                      </label>
                      <textarea
                        value={formData.descricoes}
                        onChange={(e) => setFormData({...formData, descricoes: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-violet-500 transition-all"
                        placeholder="Observações e descrições adicionais..."
                      />
                    </div>
                  </div>
                </div>

                {/* Botões de Ação Modernos */}
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all duration-300 font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={createPetMutation.isPending || updatePetMutation.isPending}
                  >
                    {createPetMutation.isPending || updatePetMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Salvando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {editingPet ? 'Atualizar Pet' : 'Adicionar Pet'}
                      </div>
                    )}
                  </Button>
                </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
