import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// CORREÇÃO: Importando a instância do queryClient do seu arquivo local
import { queryClient } from "@/lib/queryClient";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Função para buscar os dados do usuário usando o apiRequest
  const fetchUser = async () => {
    try {
      const response = await apiRequest("GET", "/user");
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        // É normal não estar autenticado, então retornamos null sem gerar um erro na query.
        return null;
      }
      // Para outros erros, nós os lançamos para que o React Query possa tratá-los.
      throw error;
    }
  };

  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["user"], // Chave de query simplificada
    queryFn: fetchUser,
    retry: false, // Não tente novamente em caso de erro 401
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest("POST", "/login", credentials);
      return response.data;
    },
    onSuccess: (loggedInUser: SelectUser) => {
      // Atualiza os dados do usuário no cache do React Query
      queryClient.setQueryData(["user"], loggedInUser);
      toast({
        title: "Login bem-sucedido!",
        description: `Bem-vindo de volta, ${loggedInUser.nome}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Falha no login",
        description: error.response?.data?.message || "Email ou senha incorretos.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const response = await apiRequest("POST", "/register", credentials);
      return response.data;
    },
    onSuccess: (registeredUser: SelectUser) => {
      queryClient.setQueryData(["user"], registeredUser);
    },
    onError: (error: any) => {
      toast({
        title: "Falha no registro",
        description: error.response?.data?.message || "Não foi possível criar a conta.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/logout");
    },
    onSuccess: () => {
      // Limpa os dados do usuário do cache
      queryClient.setQueryData(["user"], null);
    },
    onError: (error: any) => {
      toast({
        title: "Falha no logout",
        description: error.response?.data?.message || "Ocorreu um erro.",
        variant: "destructive",
      });
    },
  });

  return (
      <AuthContext.Provider
          value={{
            user: user ?? null,
            isLoading,
            error,
            loginMutation,
            logoutMutation,
            registerMutation,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
