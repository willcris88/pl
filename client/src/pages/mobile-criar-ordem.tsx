import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Calendar, User, Phone, MapPin, DollarSign } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

const ordemSchema = z.object({
  nomeDefunto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  servico: z.string().min(1, "Selecione um serviço"),
  dataServico: z.string().min(1, "Data do serviço é obrigatória"),
  horaServico: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  responsavel: z.string().optional(),
  observacoes: z.string().optional(),
  valorTotal: z.number().min(0, "Valor deve ser positivo").optional(),
});

type OrdemFormData = z.infer<typeof ordemSchema>;

export default function MobileCriarOrdem() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrdemFormData>({
    resolver: zodResolver(ordemSchema),
    defaultValues: {
      nomeDefunto: '',
      servico: '',
      dataServico: '',
      horaServico: '',
      endereco: '',
      telefone: '',
      responsavel: '',
      observacoes: '',
      valorTotal: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: OrdemFormData) => {
      const response = await fetch('/api/ordens-servico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      setLocation('/ordens-servico');
    },
  });

  const onSubmit = (data: OrdemFormData) => {
    setIsSubmitting(true);
    createMutation.mutate(data);
  };

  const servicos = [
    'Velório Simples',
    'Velório Luxo',
    'Cremação',
    'Sepultamento',
    'Traslado',
    'Velório + Sepultamento',
    'Velório + Cremação',
  ];

  return (
    <MobileLayout title="Nova Ordem de Serviço">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Informações do Defunto */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Defunto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nomeDefunto">Nome do Defunto *</Label>
              <Input
                id="nomeDefunto"
                {...form.register('nomeDefunto')}
                placeholder="Nome completo"
              />
              {form.formState.errors.nomeDefunto && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.nomeDefunto.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                {...form.register('responsavel')}
                placeholder="Nome do responsável"
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                {...form.register('telefone')}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                {...form.register('endereco')}
                placeholder="Endereço completo"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações do Serviço */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações do Serviço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="servico">Tipo de Serviço *</Label>
              <Select onValueChange={(value) => form.setValue('servico', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((servico) => (
                    <SelectItem key={servico} value={servico}>
                      {servico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.servico && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.servico.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dataServico">Data do Serviço *</Label>
                <Input
                  id="dataServico"
                  type="date"
                  {...form.register('dataServico')}
                />
                {form.formState.errors.dataServico && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.dataServico.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="horaServico">Hora do Serviço</Label>
                <Input
                  id="horaServico"
                  type="time"
                  {...form.register('horaServico')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="valorTotal">Valor Total</Label>
              <Input
                id="valorTotal"
                type="number"
                step="0.01"
                {...form.register('valorTotal', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...form.register('observacoes')}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-3 pb-8">
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
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </form>
    </MobileLayout>
  );
}