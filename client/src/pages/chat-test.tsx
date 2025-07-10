import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';

export default function ChatTest() {
  const { user } = useAuth();
  
  console.log('🔍 ChatTest montado!');
  console.log('🔍 Usuário:', user);
  
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['/api/chat/usuarios'],
    enabled: !!user,
    queryFn: async () => {
      console.log('🔍 Executando query /api/chat/usuarios');
      const response = await fetch('/api/chat/usuarios', {
        credentials: 'include'
      });
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📊 Response data:', data);
      return data;
    }
  });

  return (
    <div className="p-4">
      <h1>Chat Test</h1>
      <p>Usuário: {user?.nome || 'Não logado'}</p>
      <p>Loading: {isLoading ? 'Sim' : 'Não'}</p>
      <p>Usuários: {JSON.stringify(usuarios)}</p>
    </div>
  );
}