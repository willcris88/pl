import { X, Calendar, FileText, Users, Package, Truck, ClipboardList, Shield, Building, Heart, Camera, Receipt, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user } = useAuth();

  const menuItems = [
    { path: "/", icon: Calendar, label: "Calendário" },
    { path: "/ordens-servico", icon: FileText, label: "Ordens de Serviço" },
    { path: "/fornecedores", icon: Building, label: "Fornecedores" },
    { path: "/produtos", icon: Package, label: "Produtos" },
    { path: "/prestadoras", icon: Users, label: "Prestadoras" },
    { path: "/notas-contratuais", icon: Receipt, label: "Notas Contratuais" },
    { path: "/motoristas", icon: Truck, label: "Motoristas" },
    { path: "/obitos", icon: Heart, label: "Óbitos" },
    { path: "/logs-auditoria", icon: Shield, label: "Logs de Auditoria" },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 md:hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sistema Funerário
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Olá, {user?.nome || 'Usuário'}
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={onClose}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Implementar logout
              localStorage.removeItem('auth-token');
              window.location.href = '/auth';
              onClose();
            }}
          >
            Sair do Sistema
          </Button>
        </div>
      </div>
    </>
  );
}