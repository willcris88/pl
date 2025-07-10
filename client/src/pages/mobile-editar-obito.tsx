import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MobileLayout } from '@/components/mobile/mobile-layout';
import { ArrowLeft, Save, Heart } from 'lucide-react';
import { useElegantDialogs } from '@/hooks/use-elegant-dialogs';

interface Obito {
  id: number;
  nome: string;
  dataNascimento: string;
  dataObito: string;
  idade?: number;
  sexo: string;
  estadoCivil?: string;
  naturalidade?: string;
  endereco?: string;
  nomePai?: string;
  nomeMae?: string;
  natimorto: boolean;
  // Campos específicos de natimorto
  descIdade?: string;
  horaNasc?: string;
  localNasc?: string;
  gestacao?: string;
  duracao?: string;
  avosPaterno?: string;
  avosMaterno?: string;
  avosPaterna?: string;
  avosMaterna?: string;
  testemunhaNome?: string;
  testemunhaDoc?: string;
  testemunhaIdade?: number;
  testemunhaEndereco?: string;
  testemunhaBairro?: string;
  // Outros campos
  corRaca?: string;
  profissao?: string;
  rg?: string;
  cpf?: string;
  deixaBens?: boolean;
  testamento?: boolean;
  nomeConjuge?: string;
  filhos?: string;
  observacoes?: string;
}

export default function MobileEditarObito() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [obito, setObito] = useState<Obito>({
    id: 0,
    nome: '',
    dataNascimento: '',
    dataObito: '',
    sexo: '',
    natimorto: false
  });

  const isEditing = params.id !== 'novo';
  const { showSuccess, showError, confirmSave } = useElegantDialogs();

  useEffect(() => {
    if (isEditing) {
      fetchObito();
    }
  }, [params.id]);

  const fetchObito = async () => {
    try {
      if (params.id === 'novo') return; // Não buscar se for criação
      
      const response = await fetch(`/api/obitos/${params.id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setObito(data);
      }
    } catch (error) {
      console.error('Erro ao buscar óbito:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/obitos/${params.id}` : '/api/obitos';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obito),
        credentials: 'include'
      });

      if (response.ok) {
        showSuccess(
          'Sucesso!',
          isEditing ? 'Óbito atualizado com sucesso!' : 'Óbito criado com sucesso!',
          () => setLocation('/obitos')
        );
      } else {
        showError('Erro', 'Erro ao salvar óbito');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showError('Erro', 'Erro ao salvar óbito');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Obito, value: string | number | boolean) => {
    setObito(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MobileLayout title={isEditing ? 'Editar Óbito' : 'Novo Óbito'}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/obitos')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <h1 className="text-lg font-semibold">
              {isEditing ? 'Editar Óbito' : 'Novo Óbito'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Checkbox Natimorto */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="natimorto"
                checked={obito.natimorto}
                onCheckedChange={(checked) => handleChange('natimorto', checked as boolean)}
              />
              <Label htmlFor="natimorto" className="text-purple-700 dark:text-purple-300 font-medium">
                Natimorto
              </Label>
            </div>
          </div>

          {/* Informações Gerais */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-blue-600 dark:text-blue-400">
              Informações Gerais
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={obito.nome || ''}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sexo">Sexo *</Label>
                <Select 
                  value={obito.sexo || ''} 
                  onValueChange={(value) => handleChange('sexo', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="corRaca">Cor/Raça</Label>
                <Select 
                  value={obito.corRaca || ''} 
                  onValueChange={(value) => handleChange('corRaca', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a cor/raça" />
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
            </div>
          </div>

          {/* Dados do Óbito */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-red-600 dark:text-red-400">
              Dados do Óbito
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={obito.dataNascimento ? obito.dataNascimento.split('T')[0] : ''}
                  onChange={(e) => handleChange('dataNascimento', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dataObito">Data do Óbito</Label>
                <Input
                  id="dataObito"
                  type="date"
                  value={obito.dataObito ? obito.dataObito.split('T')[0] : ''}
                  onChange={(e) => handleChange('dataObito', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="naturalidade">Naturalidade</Label>
                <Input
                  id="naturalidade"
                  value={obito.naturalidade || ''}
                  onChange={(e) => handleChange('naturalidade', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Campos condicionais baseados no natimorto */}
          {obito.natimorto ? (
            // Campos específicos para natimorto
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <h2 className="text-md font-semibold mb-4 text-purple-600 dark:text-purple-400">
                Informações de Natimorto
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="idade">Idade</Label>
                    <Input
                      id="idade"
                      type="number"
                      value={obito.idade || ''}
                      onChange={(e) => handleChange('idade', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descIdade">Desc. Idade</Label>
                    <Input
                      id="descIdade"
                      value={obito.descIdade || ''}
                      onChange={(e) => handleChange('descIdade', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horaNasc">Hora Nascimento</Label>
                    <Input
                      id="horaNasc"
                      type="time"
                      value={obito.horaNasc || ''}
                      onChange={(e) => handleChange('horaNasc', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="localNasc">Local Nascimento</Label>
                    <Input
                      id="localNasc"
                      value={obito.localNasc || ''}
                      onChange={(e) => handleChange('localNasc', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gestacao">Gestação</Label>
                    <Input
                      id="gestacao"
                      value={obito.gestacao || ''}
                      onChange={(e) => handleChange('gestacao', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duracao">Duração</Label>
                    <Input
                      id="duracao"
                      value={obito.duracao || ''}
                      onChange={(e) => handleChange('duracao', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="avosPaterno">Avôs Paterno</Label>
                    <Input
                      id="avosPaterno"
                      value={obito.avosPaterno || ''}
                      onChange={(e) => handleChange('avosPaterno', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="avosMaterno">Avôs Materno</Label>
                    <Input
                      id="avosMaterno"
                      value={obito.avosMaterno || ''}
                      onChange={(e) => handleChange('avosMaterno', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="avosPaterna">Avós Paterna</Label>
                    <Input
                      id="avosPaterna"
                      value={obito.avosPaterna || ''}
                      onChange={(e) => handleChange('avosPaterna', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="avosMaterna">Avós Materna</Label>
                    <Input
                      id="avosMaterna"
                      value={obito.avosMaterna || ''}
                      onChange={(e) => handleChange('avosMaterna', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="testemunhaNome">Testemunha - Nome</Label>
                  <Input
                    id="testemunhaNome"
                    value={obito.testemunhaNome || ''}
                    onChange={(e) => handleChange('testemunhaNome', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testemunhaDoc">RG/CPF/CNJ</Label>
                    <Input
                      id="testemunhaDoc"
                      value={obito.testemunhaDoc || ''}
                      onChange={(e) => handleChange('testemunhaDoc', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testemunhaIdade">Idade</Label>
                    <Input
                      id="testemunhaIdade"
                      type="number"
                      value={obito.testemunhaIdade || ''}
                      onChange={(e) => handleChange('testemunhaIdade', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="testemunhaEndereco">Endereço</Label>
                    <Input
                      id="testemunhaEndereco"
                      value={obito.testemunhaEndereco || ''}
                      onChange={(e) => handleChange('testemunhaEndereco', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testemunhaBairro">Bairro</Label>
                    <Input
                      id="testemunhaBairro"
                      value={obito.testemunhaBairro || ''}
                      onChange={(e) => handleChange('testemunhaBairro', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Campos habilitados para óbito normal
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-md font-semibold mb-4 text-green-600 dark:text-green-400">
                Informações Pessoais
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="estadoCivil">Estado Civil</Label>
                  <Select 
                    value={obito.estadoCivil || ''} 
                    onValueChange={(value) => handleChange('estadoCivil', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o estado civil" />
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
                <div>
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input
                    id="profissao"
                    value={obito.profissao || ''}
                    onChange={(e) => handleChange('profissao', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={obito.rg || ''}
                      onChange={(e) => handleChange('rg', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={obito.cpf || ''}
                      onChange={(e) => handleChange('cpf', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="deixaBens"
                      checked={obito.deixaBens || false}
                      onCheckedChange={(checked) => handleChange('deixaBens', checked as boolean)}
                    />
                    <Label htmlFor="deixaBens">Deixa Bens</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="testamento"
                      checked={obito.testamento || false}
                      onCheckedChange={(checked) => handleChange('testamento', checked as boolean)}
                    />
                    <Label htmlFor="testamento">Testamento</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="nomeConjuge">Nome do Cônjuge</Label>
                  <Input
                    id="nomeConjuge"
                    value={obito.nomeConjuge || ''}
                    onChange={(e) => handleChange('nomeConjuge', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="filhos">Filhos</Label>
                  <Input
                    id="filhos"
                    value={obito.filhos || ''}
                    onChange={(e) => handleChange('filhos', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filiação */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-yellow-600 dark:text-yellow-400">
              Filiação
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nomePai">Nome do Pai</Label>
                <Input
                  id="nomePai"
                  value={obito.nomePai || ''}
                  onChange={(e) => handleChange('nomePai', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="nomeMae">Nome da Mãe</Label>
                <Input
                  id="nomeMae"
                  value={obito.nomeMae || ''}
                  onChange={(e) => handleChange('nomeMae', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-purple-600 dark:text-purple-400">
              Endereço
            </h2>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={obito.endereco || ''}
                onChange={(e) => handleChange('endereco', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-md font-semibold mb-4 text-orange-600 dark:text-orange-400">
              Observações Importantes
            </h2>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={obito.observacoes || ''}
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
              onClick={() => setLocation('/obitos')}
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