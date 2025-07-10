/**
 * PÁGINA DE LOGIN PARA MOTORISTAS
 * 
 * Sistema de autenticação dedicado para motoristas com:
 * - Interface simples e otimizada para mobile
 * - Login com nome de usuário e senha
 * - Redirecionamento para dashboard após login
 * - Design moderno e responsivo
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Truck, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Schema de validação para login
const loginSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória")
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginMotorista() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [erro, setErro] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nome: "",
      senha: ""
    }
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch("/api/servicos-motorista/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao fazer login");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${data.motorista.nome}!`,
        variant: "default"
      });
      
      // Redirecionar para dashboard do motorista
      setLocation("/motorista-dashboard");
    },
    onError: (error: Error) => {
      setErro(error.message);
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LoginForm) => {
    setErro(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white dark:bg-gray-900">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Truck className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Acesso do Motorista
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
              Entre com suas credenciais para acessar seus serviços
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {erro && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertDescription className="text-red-700 dark:text-red-400">
                {erro}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome do Motorista
              </Label>
              <Input
                id="nome"
                type="text"
                placeholder="Digite seu nome"
                className="h-12 text-lg"
                {...form.register("nome")}
                disabled={loginMutation.isPending}
              />
              {form.formState.errors.nome && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.nome.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                className="h-12 text-lg"
                {...form.register("senha")}
                disabled={loginMutation.isPending}
              />
              {form.formState.errors.senha && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.senha.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sistema exclusivo para motoristas da empresa
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Em caso de problemas, contacte a administração
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}