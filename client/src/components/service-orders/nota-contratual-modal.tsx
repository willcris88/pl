import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calculator, CreditCard, Banknote, Smartphone, ArrowRight } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface NotaContratualModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordemServico: any;
  produtos: any[];
}

interface FormaPagamento {
  tipo: string;
  valor: string;
}

const FORMAS_PAGAMENTO = [
  "DINHEIRO",
  "CARTÃO",
  "TRANSFERÊNCIA", 
  "PIX"
];

export function NotaContratualModal({ isOpen, onClose, ordemServico, produtos }: NotaContratualModalProps) {
  const [etapa, setEtapa] = useState<'contratante' | 'pagamento' | 'processando'>('contratante');
  const [dadosContratante, setDadosContratante] = useState({
    nomeContratante: '',
    cpfCnpjContratante: '',
    enderecoContratante: '',
    cidadeContratante: '',
    telefoneContratante: '',
    observacoes: ''
  });
  
  const [valorEditavel, setValorEditavel] = useState<string>('');
  
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([
    { tipo: '', valor: '' }
  ]);
  
  const [formData, setFormData] = useState({
    nomeContratante: '',
    cpfCnpjContratante: '',
    enderecoContratante: '',
    cidadeContratante: '',
    telefoneContratante: '',
    observacoes: ''
  });
  
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [operador, setOperador] = useState('');
  const [notaContratual, setNotaContratual] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calcular valor total dos produtos
  const valorCalculado = produtos.reduce((sum, produto) => {
    return sum + (parseFloat(produto.valor) || 0);
  }, 0);
  
  // Usar valor editável se definido, senão usar valor calculado
  const valorTotal = valorEditavel ? parseFloat(valorEditavel.replace(',', '.')) || 0 : valorCalculado;
  const totalValue = valorTotal;
  
  // Inicializar valor editável quando modal abrir
  useEffect(() => {
    if (isOpen && !valorEditavel) {
      setValorEditavel(valorCalculado.toFixed(2).replace('.', ','));
    }
  }, [isOpen, valorCalculado]);

  const createNotaMutation = useMutation({
    mutationFn: (dados: any) => apiRequest('POST', '/notas-contratuais', dados),
    onSuccess: (response) => {
      setNotaContratual(response.data);
      setEtapa('pagamento');
      toast({ title: "Sucesso", description: "Nota contratual criada!" });
    },
    onError: (error: any) => {
      console.error('Erro ao criar nota:', error);
      toast({ 
        title: "Erro", 
        description: "Erro ao criar nota contratual", 
        variant: "destructive" 
      });
    },
  });

  const createPagamentoMutation = useMutation({
    mutationFn: async (pagamentos: any[]) => {
      console.log('Criando pagamentos e marcando produtos como indisponíveis...');
      
      // Criar pagamentos
      await Promise.all(
        pagamentos.map(pagamento => 
          apiRequest('POST', '/pagamentos-nota-contratual', pagamento)
        )
      );
      
      console.log('Pagamentos criados, marcando produtos com NC:', {
        ordemServicoId: ordemServico.id,
        notaContratualId: notaContratual.id,
        numeroNc: notaContratual.numeroNota
      });
      
      // Marcar produtos como indisponíveis após pagamento criado
      const response = await apiRequest('POST', '/api/produtos-os/marcar-nc', {
        ordemServicoId: ordemServico.id,
        notaContratualId: notaContratual.id,
        numeroNc: notaContratual.numeroNota
      });
      
      console.log('Resposta da marcação:', response);
      return response;
    },
    onSuccess: () => {
      console.log('Pagamento processado com sucesso, forçando atualização completa...');
      
      // Invalidar e recarregar TODAS as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/ordens-servico'] });
      queryClient.invalidateQueries({ queryKey: ['/api/produtos-os'] });
      queryClient.invalidateQueries({ queryKey: ['/produtos-os'] });
      
      // Forçar refetch imediato para garantir dados atualizados
      queryClient.refetchQueries({ 
        queryKey: ['/produtos-os', ordemServico.id], 
        exact: true 
      });
      queryClient.refetchQueries({ 
        queryKey: ['/api/produtos-os'], 
        exact: false 
      });
      
      // Aguardar 2 segundos para permitir que o backend processe
      setTimeout(() => {
        // Forçar refetch final após processamento
        queryClient.refetchQueries({ 
          queryKey: ['/produtos-os'], 
          exact: false 
        });
      }, 2000);
      
      toast({ title: "Sucesso", description: `Nota contratual ${notaContratual.numeroNota} concluída! Produtos marcados como indisponíveis. Atualizando página...` });
      setEtapa('processando');
      setTimeout(() => {
        gerarPDF();
        onClose();
        resetForm();
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Erro ao registrar pagamento:', error);
      toast({ 
        title: "Erro", 
        description: "Erro ao registrar pagamento", 
        variant: "destructive" 
      });
    },
  });

  const deleteNotaMutation = useMutation({
    mutationFn: (notaId: number) => apiRequest('DELETE', `/notas-contratuais/${notaId}`),
    onSuccess: () => {
      toast({ title: "Nota cancelada", description: "Nota contratual foi excluída." });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      console.error('Erro ao excluir nota:', error);
      toast({ 
        title: "Erro", 
        description: "Erro ao excluir nota", 
        variant: "destructive" 
      });
    },
  });

  const handleSubmitContratante = () => {
    // Validar campos obrigatórios
    if (!dadosContratante.nomeContratante || !dadosContratante.cpfCnpjContratante || 
        !dadosContratante.enderecoContratante || !dadosContratante.cidadeContratante) {
      toast({ 
        title: "Erro", 
        description: "Preencha todos os campos obrigatórios", 
        variant: "destructive" 
      });
      return;
    }

    const dadosNota = {
      ordemServicoId: ordemServico.id,
      valorTotal: valorTotal.toString(),
      ...dadosContratante
    };

    createNotaMutation.mutate(dadosNota);
  };

  const handleSubmitPagamento = () => {
    // Validar formas de pagamento
    const formasValidas = formasPagamento.filter(forma => forma.tipo && forma.valor);
    
    if (formasValidas.length === 0) {
      toast({ 
        title: "Erro", 
        description: "Selecione pelo menos uma forma de pagamento", 
        variant: "destructive" 
      });
      return;
    }

    // Validar se valor total confere
    const totalPagamentos = formasValidas.reduce((sum, forma) => sum + parseFloat(forma.valor), 0);
    
    if (Math.abs(totalPagamentos - valorTotal) > 0.01) {
      toast({ 
        title: "Erro", 
        description: `Valor dos pagamentos (R$ ${totalPagamentos.toFixed(2)}) deve ser exatamente R$ ${valorTotal.toFixed(2)}`, 
        variant: "destructive" 
      });
      return;
    }

    if (!operador) {
      toast({ 
        title: "Erro", 
        description: "Informe o operador", 
        variant: "destructive" 
      });
      return;
    }

    const pagamentos = formasValidas.map(forma => ({
      notaContratualId: notaContratual.id,
      formaPagamento: forma.tipo,
      valor: forma.valor,
      dataPagamento: new Date(dataPagamento),
      operador: operador
    }));

    createPagamentoMutation.mutate(pagamentos);
  };

  const adicionarFormaPagamento = () => {
    setFormasPagamento([...formasPagamento, { tipo: '', valor: '' }]);
  };

  const removerFormaPagamento = (index: number) => {
    if (formasPagamento.length > 1) {
      setFormasPagamento(formasPagamento.filter((_, i) => i !== index));
    }
  };

  const handleCancelarPagamento = () => {
    if (notaContratual?.id) {
      deleteNotaMutation.mutate(notaContratual.id);
    } else {
      onClose();
      resetForm();
    }
  };

  const atualizarFormaPagamento = (index: number, campo: string, valor: string) => {
    const novasFormas = [...formasPagamento];
    novasFormas[index] = { ...novasFormas[index], [campo]: valor };
    setFormasPagamento(novasFormas);
  };

  const gerarPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Preparar dados para o PDF usando os dados corretos
      const dadosNota = {
        numeroNota: notaContratual?.numeroNota || `NC${Date.now()}`,
        nomeContratante: dadosContratante.nomeContratante,
        cpfCnpjContratante: dadosContratante.cpfCnpjContratante,
        enderecoContratante: dadosContratante.enderecoContratante,
        cidadeContratante: dadosContratante.cidadeContratante,
        telefoneContratante: dadosContratante.telefoneContratante,
        valorTotal: notaContratual?.valorTotal || totalValue,
        observacoes: dadosContratante.observacoes,
        produtos: produtos.map(produto => ({
          nome: produto.nome,
          quantidade: produto.quantidade || 1,
          valorUnitario: produto.valor || 0,
          valorTotal: produto.valor || 0
        }))
      };
      
      console.log('Enviando dados para gerar PDF:', dadosNota);
      
      // Chamada para API usando TCPDF-like
      const response = await fetch('/api/notas-contratuais/gerar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dadosNota)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }
      
      // Abrir PDF no navegador em nova aba
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Limpar URL após um tempo para liberar memória
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);
      
      toast({
        title: "PDF Gerado!",
        description: "Nota contratual aberta em nova aba do navegador",
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF da nota contratual",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const gerarPDFLegacy = () => {
    // Código jsPDF antigo mantido como backup
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Logo e cabeçalho - configurar fonte
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('FUNERÁRIA CENTRAL DE BARUERI LTDA', 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RUA ANHANGUERA 2391 - VL. SÃO FRANCISCO BARUERI / SP - 06.452-050', 105, 30, { align: 'center' });
    doc.text('(11) 4706-1166 / (11) 4198-3843 / 08000-557355', 105, 35, { align: 'center' });

    // Linha horizontal
    doc.line(15, 40, 195, 40);

    // Título da nota e número
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('NOTA CONTRATUAL', 15, 50);
    doc.text(`NC ${notaContratual?.numeroNota?.replace('NC', '') || ''}`, 155, 50);

    // Seção prestadora de serviços
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Tabela prestadora
    const prestadoraData = [
      ['Prestadora de Serviços', 'CNPJ/CPF 52.516.969/0001-87'],
      ['FUNERÁRIA CENTRAL DE BARUERI LTDA-ME', 'Inscrição Municipal 54-5119-3'],
      ['RUA ANHANGUERA , 2391 VILA SÃO FRANCISCO / FAZENDA MILITAR CEP 06452-050 - BARUERI - SP', 'administração@funerariacentral.com.br']
    ];

    autoTable(doc, {
      startY: 55,
      head: [],
      body: prestadoraData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1, lineWidth: 0.1 },
      columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 75 } },
      margin: { left: 15, right: 10 }
    });

    // Dados do contratante
    let currentY = (doc as any).lastAutoTable?.finalY + 5 || 85;
    
    const contratanteData = [
      ['NOME CONTRATANTE', 'CNP/CPFJ'],
      [dadosContratante.nomeContratante || '', dadosContratante.cpfCnpjContratante || ''],
      ['ENDEREÇO', 'CIDADE'],
      [dadosContratante.enderecoContratante || '', dadosContratante.cidadeContratante || ''],
      ['NOME FALECIDO', 'TELEFONE'],
      ['', dadosContratante.telefoneContratante || ''],
      ['OS DE TESTE NÃO APAGAR', ''],
      ['LOCAL DO FALECIMENTO', 'ORDEM SERVIÇO'],
      ['', ordemServico?.id || ''],
      ['DATA SEPULTAMENTO', 'LOCAL SEPULTAMENTO'],
      [new Date().toLocaleDateString('pt-BR'), '']
    ];

    autoTable(doc, {
      startY: currentY,
      head: [],
      body: contratanteData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1, lineWidth: 0.1 },
      columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 75 } },
      margin: { left: 15, right: 10 }
    });

    // Seção Produtos e Serviços
    currentY = (doc as any).lastAutoTable?.finalY + 5 || currentY + 50;
    
    doc.setFillColor(128, 128, 128);
    doc.rect(15, currentY, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUTOS E SERVIÇOS', 105, currentY + 5, { align: 'center' });
    
    currentY += 10;
    doc.setTextColor(0, 0, 0);

    // Tabela de produtos
    const produtosTableData = produtos.map(produto => [
      produto.nome,
      produto.quantidade.toString(),
      `R$ ${parseFloat(produto.valor).toFixed(2).replace('.', ',')}`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Serviços / Produtos', 'Quantidade', 'Valor']],
      body: produtosTableData,
      theme: 'grid',
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 1, lineWidth: 0.1 },
      columnStyles: { 
        0: { cellWidth: 110 }, 
        1: { cellWidth: 25, halign: 'center' }, 
        2: { cellWidth: 50, halign: 'right' } 
      },
      margin: { left: 15, right: 10 }
    });

    // Total geral
    currentY = (doc as any).lastAutoTable?.finalY || currentY + 30;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Geral R$ ${valorTotal.toFixed(2).replace('.', ',')}`, 195, currentY + 5, { align: 'right' });

    // Seção Observações
    currentY += 15;
    doc.setFillColor(128, 128, 128);
    doc.rect(15, currentY, 185, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Observações', 105, currentY + 4, { align: 'center' });
    
    currentY += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    // Caixa de observações
    doc.rect(15, currentY, 185, 12);
    if (dadosContratante.observacoes) {
      doc.setFontSize(7);
      doc.text(dadosContratante.observacoes, 17, currentY + 4);
    }
    
    // Linha "Valor por extenso"
    currentY += 14;
    doc.rect(15, currentY, 185, 8);
    doc.setFontSize(7);
    doc.text('Valor por extenso:', 17, currentY + 3);
    doc.text('DUZENTOS REAIS', 17, currentY + 6);

    // Valor total do recibo
    currentY += 10;
    doc.setFillColor(255, 255, 255);
    doc.rect(15, currentY, 185, 6, 'D');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`VALOR TOTAL DO RECIBO R$ ${valorTotal.toFixed(2).replace('.', ',')}`, 105, currentY + 4, { align: 'center' });

    // Pagamento
    currentY += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(255, 255, 255);
    doc.rect(15, currentY, 185, 6, 'D');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    const formaPagamentoTexto = formasPagamento.filter(f => f.tipo).map(f => f.tipo).join(', ');
    doc.text(`PAGAMENTO: ${formaPagamentoTexto}`, 105, currentY + 4, { align: 'center' });

    // Assinaturas
    currentY += 8;
    doc.rect(15, currentY, 92, 20);
    doc.rect(108, currentY, 92, 20);
    
    doc.setFontSize(7);
    doc.text('Assinatura do Responsável', 61, currentY + 16, { align: 'center' });
    doc.text('Assinatura do Operador', 154, currentY + 16, { align: 'center' });

    // Abrir PDF em nova aba em vez de fazer download
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  const resetForm = () => {
    setEtapa('contratante');
    setDadosContratante({
      nomeContratante: '',
      cpfCnpjContratante: '',
      enderecoContratante: '',
      cidadeContratante: '',
      telefoneContratante: '',
      observacoes: ''
    });
    setFormasPagamento([{ tipo: '', valor: '' }]);
    setOperador('');
    setNotaContratual(null);
    setValorEditavel('');
  };

  const totalFormasPagamento = formasPagamento.reduce((sum, forma) => {
    return sum + (parseFloat(forma.valor) || 0);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" 
                     onPointerDownOutside={(e) => e.preventDefault()}
                     onEscapeKeyDown={(e) => e.preventDefault()}>
        
        {etapa === 'contratante' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                Prencha o Contratante
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={dadosContratante.nomeContratante}
                  onChange={(e) => setDadosContratante({...dadosContratante, nomeContratante: e.target.value})}
                  placeholder="Sed et porro dolorib"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="cpf">CPF ou CNPJ Contratada</Label>
                <Input
                  id="cpf"
                  value={dadosContratante.cpfCnpjContratante}
                  onChange={(e) => setDadosContratante({...dadosContratante, cpfCnpjContratante: e.target.value})}
                  placeholder="--"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={dadosContratante.enderecoContratante}
                  onChange={(e) => setDadosContratante({...dadosContratante, enderecoContratante: e.target.value})}
                  placeholder="Nostrum reiciendis n"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={dadosContratante.cidadeContratante}
                  onChange={(e) => setDadosContratante({...dadosContratante, cidadeContratante: e.target.value})}
                  placeholder="Nulla velit voluptat"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={dadosContratante.telefoneContratante}
                  onChange={(e) => setDadosContratante({...dadosContratante, telefoneContratante: e.target.value})}
                  placeholder="0-"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="valorNota" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Valor Nota
                </Label>
                <Input
                  id="valorNota"
                  value={`R$ ${valorEditavel}`}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^0-9,]/g, '');
                    setValorEditavel(valor);
                  }}
                  placeholder="R$ 0,00"
                  className="bg-blue-900 border-blue-600 text-white font-bold text-lg"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Valor calculado automaticamente: R$ {valorCalculado.toFixed(2).replace('.', ',')}
                </p>
              </div>
              
              <div>
                <Label htmlFor="valor">Valor Nota</Label>
                <Input
                  id="valor"
                  value={`R$ ${valorTotal.toFixed(2)}`}
                  readOnly
                  className="bg-blue-900 border-blue-600 text-white font-bold"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="observacoes">Valor Nota</Label>
                <Textarea
                  id="observacoes"
                  value={dadosContratante.observacoes}
                  onChange={(e) => setDadosContratante({...dadosContratante, observacoes: e.target.value})}
                  placeholder="Nulla pariatur Aliq"
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={handleSubmitContratante}
                disabled={createNotaMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {createNotaMutation.isPending ? "Salvando..." : "Enviar"}
              </Button>
            </div>
          </>
        )}

        {etapa === 'pagamento' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                Métodos de pagamento NC {notaContratual?.numeroNota}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex gap-6">
              {/* Card lateral com informações */}
              <Card className="w-80 bg-blue-800 text-white">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">Total da Nota {valorTotal.toFixed(2)}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>NÚMERO DA OS:</strong><br />
                      {ordemServico.id}
                    </div>
                    
                    <div>
                      <strong>NÚMERO DA NC:</strong><br />
                      {notaContratual?.numeroNota}
                    </div>
                  </div>
                  
                  <div className="mt-6 text-xs">
                    <p>AO FINALIZAR O PAGAMENTO O</p>
                    <p>MESMO SERÁ</p>
                    <p>LANÇADO NO LIVRO CAIXA</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Formulário de pagamento */}
              <div className="flex-1">
                <div className="bg-pink-600 text-white p-2 text-center font-bold mb-4">
                  Forma de pagamento
                </div>
                
                <div className="space-y-4">
                  {formasPagamento.map((forma, index) => {
                    // Só mostrar formulários adicionais se a primeira forma for "2 FORMAS PGTO"
                    if (index > 0 && formasPagamento[0].tipo !== "2 FORMAS PGTO") {
                      return null;
                    }
                    
                    return (
                    <div key={index} className="border rounded p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          {formasPagamento[0].tipo === "2 FORMAS PGTO" ? `${index + 1} FORMA PGTO` : 'FORMA PGTO'}
                        </span>
                        {formasPagamento.length > 1 && index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removerFormaPagamento(index)}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                      
                      <Select 
                        value={forma.tipo} 
                        onValueChange={(value) => {
                          atualizarFormaPagamento(index, 'tipo', value);
                          // Se selecionar "2 FORMAS PGTO", adicionar segunda forma
                          if (value === "2 FORMAS PGTO" && formasPagamento.length === 1) {
                            adicionarFormaPagamento();
                          }
                          // Se desselecionar "2 FORMAS PGTO", remover formas extras
                          if (value !== "2 FORMAS PGTO" && formasPagamento.length > 1) {
                            setFormasPagamento([{ tipo: value, valor: forma.valor }]);
                          }
                        }}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Escolha forma pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {FORMAS_PAGAMENTO.map(forma => (
                            <SelectItem key={forma} value={forma}>{forma}</SelectItem>
                          ))}
                          <SelectItem value="2 FORMAS PGTO">2 FORMAS PGTO</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Valor pgto {index + 1}</Label>
                          <Input
                            type="text"
                            value={forma.valor}
                            onChange={(e) => atualizarFormaPagamento(index, 'valor', e.target.value)}
                            placeholder="0,00"
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        
                        {/* Só mostrar valor pgto 2 se for realmente 2 formas de pagamento */}
                        {formasPagamento[0]?.tipo === "2 FORMAS PGTO" && index === 0 && formasPagamento.length > 1 && (
                          <div>
                            <Label>Valor pgto 2</Label>
                            <Input
                              value={formasPagamento[1]?.valor || '0,00'}
                              readOnly
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Data de Pagamento</Label>
                      <Input
                        type="date"
                        value={dataPagamento}
                        onChange={(e) => setDataPagamento(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label>Operador</Label>
                      <Input
                        value={operador}
                        onChange={(e) => setOperador(e.target.value)}
                        placeholder="William"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Mostrar diferença de valores */}
                  {totalFormasPagamento !== valorTotal && (
                    <div className="text-center text-red-500 font-bold">
                      Diferença: R$ {(valorTotal - totalFormasPagamento).toFixed(2)}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Button
                      type="button"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleSubmitPagamento}
                      disabled={createPagamentoMutation.isPending}
                    >
                      {createPagamentoMutation.isPending ? "Processando..." : "Realizar pagamento"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full"
                      onClick={handleCancelarPagamento}
                      disabled={deleteNotaMutation.isPending}
                    >
                      {deleteNotaMutation.isPending ? "Cancelando..." : "Cancelar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {etapa === 'processando' && (
          <div className="text-center py-8">
            <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Processando pagamento...</h3>
            <p className="text-gray-600">Gerando PDF da nota contratual</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}