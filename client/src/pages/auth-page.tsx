import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { navigate } from "wouter/use-browser-location";
import { Heart, Shield, Users, FileText, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const registerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string(),
}).refine(data => data.senha === data.confirmarSenha, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onLogin = async (data: LoginData) => {
    try {
      await loginMutation.mutateAsync({
        username: data.email,
        password: data.senha,
      });
      navigate("/");
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  const onRegister = async (data: RegisterData) => {
    try {
      await registerMutation.mutateAsync({
        nome: data.nome,
        username: data.email,
        password: data.senha,
      });
      navigate("/");
    } catch (error) {
      console.error("Erro no registro:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex flex-col lg:flex-row">
      {/* Formulário de Login/Registro */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md space-y-6 lg:space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 lg:h-16 lg:w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">Sistema Funerário</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm lg:text-base">
              Gerencie seus serviços com cuidado e respeito
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 lg:h-11">
              <TabsTrigger value="login" className="text-sm lg:text-base">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="text-sm lg:text-base">Registrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="shadow-xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
                <CardHeader className="pb-4 lg:pb-6">
                  <CardTitle className="text-lg lg:text-xl">Faça login</CardTitle>
                  <CardDescription className="text-sm lg:text-base">
                    Digite suas credenciais para acessar o sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 lg:space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm lg:text-base text-slate-700 dark:text-slate-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="h-10 lg:h-11 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                        {...loginForm.register("email")}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senha" className="text-sm lg:text-base text-slate-700 dark:text-slate-300">Senha</Label>
                      <Input
                        id="senha"
                        type="password"
                        placeholder="Sua senha"
                        className="h-10 lg:h-11 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                        {...loginForm.register("senha")}
                      />
                      {loginForm.formState.errors.senha && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.senha.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="lembrar" />
                      <Label htmlFor="lembrar" className="text-sm">
                        Lembrar de mim
                      </Label>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-10 lg:h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="shadow-xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
                <CardHeader className="pb-4 lg:pb-6">
                  <CardTitle className="text-lg lg:text-xl">Criar conta</CardTitle>
                  <CardDescription className="text-sm lg:text-base">
                    Preencha os dados para criar uma nova conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4 lg:space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-sm lg:text-base text-slate-700 dark:text-slate-300">Nome completo</Label>
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Seu nome completo"
                        className="h-10 lg:h-11 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                        {...registerForm.register("nome")}
                      />
                      {registerForm.formState.errors.nome && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.nome.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-register" className="text-sm lg:text-base text-slate-700 dark:text-slate-300">Email</Label>
                      <Input
                        id="email-register"
                        type="email"
                        placeholder="seu@email.com"
                        className="h-10 lg:h-11 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senha-register" className="text-sm lg:text-base text-slate-700 dark:text-slate-300">Senha</Label>
                      <Input
                        id="senha-register"
                        type="password"
                        placeholder="Sua senha"
                        className="h-10 lg:h-11 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                        {...registerForm.register("senha")}
                      />
                      {registerForm.formState.errors.senha && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.senha.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmar-senha" className="text-sm lg:text-base text-slate-700 dark:text-slate-300">Confirmar senha</Label>
                      <Input
                        id="confirmar-senha"
                        type="password"
                        placeholder="Confirme sua senha"
                        className="h-10 lg:h-11 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                        {...registerForm.register("confirmarSenha")}
                      />
                      {registerForm.formState.errors.confirmarSenha && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.confirmarSenha.message}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-10 lg:h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        "Criar conta"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Seção Hero - apenas para desktop */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-20">
          <h1 className="text-4xl font-bold mb-6">
            Sistema Completo de
            <br />
            Gerenciamento
          </h1>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="mt-1 p-2 bg-white/20 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ordens de Serviço</h3>
                <p className="text-white/90">
                  Gerencie todas as ordens de serviço de forma organizada
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="mt-1 p-2 bg-white/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Controle de Equipe</h3>
                <p className="text-white/90">
                  Monitore motoristas, produtos e documentação
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="mt-1 p-2 bg-white/20 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Segurança</h3>
                <p className="text-white/90">
                  Dados protegidos com criptografia avançada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
