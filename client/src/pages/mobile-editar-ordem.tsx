import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileLayout } from '@/components/mobile/mobile-layout';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { useElegantDialogs } from '@/hooks/use-elegant-dialogs';

interface OrdemServico {
  id: number;
  nomeDefunto: string;
  enderecoDefunto: string;
  numeroEndereco: string;
  bairroDefunto: string;
  cidadeDefunto: string;
  ufDefunto: string;
  servico: string;
  dataServico: string;
  horaServico: string;
  localCerimonia: string;
  enderecoCerimonia: string;
  numeroCerimonia: string;
  bairroCerimonia: string;
  cidadeCerimonia: string;
  ufCerimonia: string;
  observacoes: string;
  status: string;
  nomeContratante: string;
  enderecoContratante: string;
  telefoneContratante: string;
  emailContratante: string;
  numeroContrato: string;
  valorTotal: number;
  formaPagamento: string;
  prazoEntrega: string;
}

export default function MobileEditarOrdem() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [ordem, setOrdem] = useState<OrdemServico>({
    id: 0,
    nomeDefunto: '',
    enderecoDefunto: '',
    numeroEndereco: '',
    bairroDefunto: '',
    cidadeDefunto: '',
    ufDefunto: '',
    servico: '',
    dataServico: '',
    horaServico: '',
    localCerimonia: '',
    enderecoCerimonia: '',
    numeroCerimonia: '',
    bairroCerimonia: '',
    cidadeCerimonia: '',
    ufCerimonia: '',
    observacoes: '',
    status: 'pendente',
    nomeContratante: '',
    enderecoContratante: '',
    telefoneContratante: '',
    emailContratante: '',
    numeroContrato: '',
    valorTotal: 0,
    formaPagamento: '',
    prazoEntrega: ''
  });

  const isEditing = params.id !== 'nova';
  const { showSuccess, showError, confirmSave } = useElegantDialogs();

  useEffect(() => {
    if (isEditing) {
      fetchOrdem();
    }
  }, [params.id]);

  const fetchOrdem = async () => {
    try {
      if (params.id === 'nova') return; // Não buscar se for criação
      
      const response = await fetch(`/api/ordens-servico/${params.id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setOrdem(data);
      }
    } catch (error) {
      console.error('Erro ao buscar ordem:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/ordens-servico/${params.id}` : '/api/ordens-servico';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ordem),
        credentials: 'include'
      });

      if (response.ok) {
        setLocation('/ordens-servico');
      } else {
        alert('Erro ao salvar ordem de serviço');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar ordem de serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof OrdemServico, value: string | number) => {
    setOrdem(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MobileLayout title={isEditing ? 'Editar Ordem' : 'Nova Ordem'}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/ordens-servico')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold">
              {isEditing ? 'Editar Ordem' : 'Nova Ordem'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Defunto */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-blue-600 dark:text-blue-400">
              Informações do Defunto
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nomeDefunto">Nome Completo *</Label>
                <Input
                  id="nomeDefunto"
                  value={ordem.nomeDefunto}
                  onChange={(e) => handleChange('nomeDefunto', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="enderecoDefunto">Endereço</Label>
                <Input
                  id="enderecoDefunto"
                  value={ordem.enderecoDefunto}
                  onChange={(e) => handleChange('enderecoDefunto', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroEndereco">Número</Label>
                  <Input
                    id="numeroEndereco"
                    value={ordem.numeroEndereco}
                    onChange={(e) => handleChange('numeroEndereco', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bairroDefunto">Bairro</Label>
                  <Input
                    id="bairroDefunto"
                    value={ordem.bairroDefunto}
                    onChange={(e) => handleChange('bairroDefunto', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidadeDefunto">Cidade</Label>
                  <Input
                    id="cidadeDefunto"
                    value={ordem.cidadeDefunto}
                    onChange={(e) => handleChange('cidadeDefunto', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ufDefunto">UF</Label>
                  <Input
                    id="ufDefunto"
                    value={ordem.ufDefunto}
                    onChange={(e) => handleChange('ufDefunto', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Serviço */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-green-600 dark:text-green-400">
              Informações do Serviço
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="servico">Tipo de Serviço *</Label>
                <Select 
                  value={ordem.servico} 
                  onValueChange={(value) => handleChange('servico', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sepultamento">Sepultamento</SelectItem>
                    <SelectItem value="Cremação">Cremação</SelectItem>
                    <SelectItem value="Velório">Velório</SelectItem>
                    <SelectItem value="Missa">Missa</SelectItem>
                    <SelectItem value="Translado">Translado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataServico">Data do Serviço</Label>
                  <Input
                    id="dataServico"
                    type="date"
                    value={ordem.dataServico ? ordem.dataServico.split('T')[0] : ''}
                    onChange={(e) => handleChange('dataServico', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="horaServico">Hora do Serviço</Label>
                  <Input
                    id="horaServico"
                    type="time"
                    value={ordem.horaServico}
                    onChange={(e) => handleChange('horaServico', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={ordem.status} 
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Local da Cerimônia */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Local da Cerimônia
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="localCerimonia">Nome do Local</Label>
                <Input
                  id="localCerimonia"
                  value={ordem.localCerimonia}
                  onChange={(e) => handleChange('localCerimonia', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="enderecoCerimonia">Endereço</Label>
                <Input
                  id="enderecoCerimonia"
                  value={ordem.enderecoCerimonia}
                  onChange={(e) => handleChange('enderecoCerimonia', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroCerimonia">Número</Label>
                  <Input
                    id="numeroCerimonia"
                    value={ordem.numeroCerimonia}
                    onChange={(e) => handleChange('numeroCerimonia', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bairroCerimonia">Bairro</Label>
                  <Input
                    id="bairroCerimonia"
                    value={ordem.bairroCerimonia}
                    onChange={(e) => handleChange('bairroCerimonia', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidadeCerimonia">Cidade</Label>
                  <Input
                    id="cidadeCerimonia"
                    value={ordem.cidadeCerimonia}
                    onChange={(e) => handleChange('cidadeCerimonia', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ufCerimonia">UF</Label>
                  <Input
                    id="ufCerimonia"
                    value={ordem.ufCerimonia}
                    onChange={(e) => handleChange('ufCerimonia', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Contratante */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-orange-600 dark:text-orange-400">
              Informações do Contratante
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nomeContratante">Nome do Contratante</Label>
                <Input
                  id="nomeContratante"
                  value={ordem.nomeContratante}
                  onChange={(e) => handleChange('nomeContratante', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="enderecoContratante">Endereço</Label>
                <Input
                  id="enderecoContratante"
                  value={ordem.enderecoContratante}
                  onChange={(e) => handleChange('enderecoContratante', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefoneContratante">Telefone</Label>
                  <Input
                    id="telefoneContratante"
                    value={ordem.telefoneContratante}
                    onChange={(e) => handleChange('telefoneContratante', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emailContratante">Email</Label>
                  <Input
                    id="emailContratante"
                    type="email"
                    value={ordem.emailContratante}
                    onChange={(e) => handleChange('emailContratante', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-red-600 dark:text-red-400">
              Informações Financeiras
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="numeroContrato">Número do Contrato</Label>
                <Input
                  id="numeroContrato"
                  value={ordem.numeroContrato}
                  onChange={(e) => handleChange('numeroContrato', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="valorTotal">Valor Total (R$)</Label>
                <Input
                  id="valorTotal"
                  type="number"
                  step="0.01"
                  value={ordem.valorTotal}
                  onChange={(e) => handleChange('valorTotal', parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                  <Select 
                    value={ordem.formaPagamento} 
                    onValueChange={(value) => handleChange('formaPagamento', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                      <SelectItem value="Parcelado">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prazoEntrega">Prazo de Entrega</Label>
                  <Input
                    id="prazoEntrega"
                    value={ordem.prazoEntrega}
                    onChange={(e) => handleChange('prazoEntrega', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-gray-600 dark:text-gray-400">
              Observações
            </h2>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={ordem.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/ordens-servico')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
}