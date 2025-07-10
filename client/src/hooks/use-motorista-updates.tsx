/**
 * Hook para gerenciar atualizações automáticas do dashboard do motorista
 * Inclui polling, notificações e invalidação de cache
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface MotoristaLogado {
  id: number;
  nome: string;
}

export function useMotoristaUpdates(motoristaLogado: MotoristaLogado | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const previousDataRef = useRef<any[]>([]);
  
  useEffect(() => {
    if (!motoristaLogado) return;

    const interval = setInterval(async () => {
      try {
        // Buscar dados atualizados
        const response = await fetch(`/api/motorista/ordens-servico?motoristaId=${motoristaLogado.id}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const newData = await response.json();
          const previousData = previousDataRef.current;
          
          // Verificar se houve mudanças
          if (JSON.stringify(newData) !== JSON.stringify(previousData)) {
            // Invalidar cache para forçar atualização
            queryClient.invalidateQueries({
              queryKey: ['/api/motorista/ordens-servico', motoristaLogado.id]
            });
            
            // Verificar se foi adicionada uma nova vinculação
            if (newData.length > previousData.length) {
              toast({
                title: "Nova vinculação!",
                description: "Você foi vinculado a uma nova ordem de serviço.",
                duration: 5000,
              });
            }
            
            // Verificar se foi removida uma vinculação
            if (newData.length < previousData.length) {
              toast({
                title: "Vinculação removida",
                description: "Uma vinculação foi removida do seu dashboard.",
                duration: 5000,
              });
            }
            
            previousDataRef.current = newData;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
      }
    }, 8000); // Verifica a cada 8 segundos

    return () => clearInterval(interval);
  }, [motoristaLogado, queryClient, toast]);

  // Invalidar cache quando o componente é montado
  useEffect(() => {
    if (motoristaLogado) {
      queryClient.invalidateQueries({
        queryKey: ['/api/motorista/ordens-servico', motoristaLogado.id]
      });
    }
  }, [motoristaLogado, queryClient]);
}