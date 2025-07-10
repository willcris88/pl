import { QueryClient } from "@tanstack/react-query";
import axios from "axios"; // 1. Importar o axios diretamente aqui

// 2. Criar e configurar a instância do apiClient DENTRO deste arquivo
const apiClient = axios.create({
  // Usar URL relativa já que o frontend e backend estão no mesmo servidor
  baseURL: '/api',
  // A configuração mais importante: permite o envio de cookies
  withCredentials: true,
});

// Interceptor para lidar com sessões expiradas de forma global
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        if (window.location.pathname !== '/auth' && window.location.pathname !== '/login') {
          console.error("Sessão inválida ou expirada. Redirecionando para o login.");
          window.location.href = '/auth';
        }
      }
      return Promise.reject(error);
    }
);

// 3. Definir o defaultQueryFn primeiro
export const defaultQueryFn = async ({ queryKey }: { queryKey: [string, ...any[]] }) => {
  const path = queryKey[0];
  const { data } = await apiClient.get(path);
  return data;
};

// 4. Criar o QueryClient usando o defaultQueryFn
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: any) => {
        if (error.response?.status === 401 || error.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export const apiRequest = async (method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE', url: string, data?: unknown) => {
  try {
    const response = await apiClient.request({
      method,
      url,
      data,
    });
    return response;
  } catch (error: any) {
    // Garantir que o erro seja propagado corretamente
    if (error.response) {
      // Erro da API
      throw error;
    } else {
      // Erro de rede ou outro
      throw new Error('Erro de conexão com o servidor');
    }
  }
};
