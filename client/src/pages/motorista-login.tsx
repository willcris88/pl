import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Car, User, Mail, CreditCard, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useElegantDialogs } from "@/hooks/use-elegant-dialogs";

const motoristaLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

type MotoristaLoginForm = z.infer<typeof motoristaLoginSchema>;

export default function MotoristaLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { showSuccess, showError } = useElegantDialogs();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MotoristaLoginForm>({
    resolver: zodResolver(motoristaLoginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: MotoristaLoginForm) => {
      const response = await fetch("/api/motorista/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erro no login");
      }

      return response.json();
    },
    onSuccess: (motorista) => {
      // Armazenar dados do motorista logado
      localStorage.setItem("motoristaLogado", JSON.stringify(motorista));
      showSuccess(
        "Login realizado com sucesso!",
        `Bem-vindo, ${motorista.nome}!`,
        () => setLocation("/motorista/dashboard")
      );
    },
    onError: (error: any) => {
      showError("Erro no login", error.message);
    },
  });

  const onSubmit = (data: MotoristaLoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Botão Voltar para Início */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation('/')}
        className="absolute top-4 left-4 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Início
      </Button>
      
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
              <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white">
              Portal do Motorista
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Acesse seu painel de controle
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@funeraria.com"
                  className="h-11 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  className="h-11 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  {...register("senha")}
                />
                {errors.senha && (
                  <p className="text-red-500 text-sm">{errors.senha.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Problemas com o acesso?{" "}
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Entre em contato com a administração
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}