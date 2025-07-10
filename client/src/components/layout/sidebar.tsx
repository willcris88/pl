import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart3,
  ClipboardList, 
  Building2,
  Package,
  Shield,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Users,
  User,
  ListTodo,
  FileText,
  Heart,
  ChevronLeft,
  ChevronRight,
  Menu,
  Calendar,
  DollarSign,
  CreditCard,
  HeartHandshake,
  Plus,
  Search,
  Edit,
  Receipt,
  Download,
  Palette
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });
  
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-expanded-sections');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-expanded-sections', JSON.stringify(expandedSections));
    }
  }, [expandedSections]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setIsHoverExpanded(false);
  };

  const handleMouseEnter = () => {
    if (isCollapsed) {
      setIsHoverExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHoverExpanded(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const isCurrentlyExpanded = prev[sectionId];
      if (isCurrentlyExpanded) {
        // Se já está expandida, recolhe
        return {};
      } else {
        // Se não está expandida, recolhe todas e expande esta
        return { [sectionId]: true };
      }
    });
  };

  // Determinar qual seção deve estar ativa baseada na URL atual (apenas uma por vez)
  const getActiveSection = () => {
    // Calendário/Home não ativa nenhuma seção do menu
    if (location === "/") return null;
    
    // Prioridade: URLs mais específicas primeiro para garantir apenas uma seção ativa
    if (location.startsWith("/logs-auditoria")) return "logs";
    if (location.startsWith("/notas-contratuais")) return "notas";
    if (location.startsWith("/ordens-servico")) return "ordens-servico";
    if (location.startsWith("/obitos") || location.startsWith("/prestadoras")) return "funeraria";
    if (location.startsWith("/financeiro") || location.startsWith("/lancamentos") || location.startsWith("/livro-caixa")) return "financeiro";
    if (location.startsWith("/relatorios")) return "relatorios";
    if (location.startsWith("/produtos") || location.startsWith("/fornecedores") || location.startsWith("/motoristas")) return "cadastros";
    if (location.startsWith("/chat")) return "chat";
    if (location.startsWith("/pets")) return "pets";
    if (location.startsWith("/suporte")) return "suporte";
    
    return null;
  };

  const activeSection = getActiveSection();
  
  // Expandir automaticamente apenas a seção ativa
  useEffect(() => {
    if (activeSection) {
      setExpandedSections({ [activeSection]: true });
    } else {
      setExpandedSections({});
    }
  }, [activeSection]);

  const menuSections = [
    {
      id: "ordens-servico",
      title: "Ordens de Serviço",
      icon: ClipboardList,
      color: "text-purple-500",
      hasSubmenu: true,
      active: activeSection === "ordens-servico",
      items: [
        {
          name: "Nova Ordem de Serviço",
          href: "/ordens-servico/criar",
          icon: Plus
        },
        {
          name: "Listar Ordens",
          href: "/ordens-servico",
          icon: Search
        }
      ]
    },
    {
      id: "funeraria",
      title: "Funerária",
      icon: Heart,
      color: "text-gray-500",
      hasSubmenu: true,
      active: activeSection === "funeraria",
      items: [
        {
          name: "Novo Óbito",
          href: "/obitos/criar",
          icon: Plus
        },
        {
          name: "Gerenciar Óbitos",
          href: "/obitos",
          icon: Search
        }
      ]
    },
    {
      id: "pets",
      title: "Pets",
      icon: HeartHandshake,
      color: "text-pink-500",
      hasSubmenu: false,
      active: activeSection === "pets",
      href: "/pets"
    },
    {
      id: "notas",
      title: "Notas",
      icon: Receipt,
      color: "text-blue-500",
      hasSubmenu: true,
      active: activeSection === "notas",
      items: [
        {
          name: "Notas N-C",
          href: "/notas-contratuais",
          icon: FileText
        },
        {
          name: "Notas N-D",
          href: "/nota-debito",
          icon: FileText
        },
        {
          name: "Nota G-T-C",
          href: "/nota-gtc",
          icon: FileText
        },
        {
          name: "Designer de Cartão",
          href: "/designer-cartao",
          icon: Palette
        }
      ]
    },
    {
      id: "financeiro",
      title: "Financeiro",
      icon: DollarSign,
      color: "text-emerald-500",
      hasSubmenu: true,
      active: activeSection === "financeiro",
      items: [
        {
          name: "Livro Caixa",
          href: "/livro-caixa",
          icon: Receipt
        },
        {
          name: "Lançamentos",
          href: "/lancamentos",
          icon: CreditCard
        },
        {
          name: "Pagamentos NF_ND",
          href: "/financeiro/pagamentos",
          icon: CreditCard
        },
        {
          name: "Contas à Pagar",
          href: "/financeiro/contas-pagar",
          icon: FileText
        }
      ]
    },
    {
      id: "relatorios",
      title: "Relatórios",
      icon: BarChart3,
      color: "text-blue-500",
      hasSubmenu: true,
      active: activeSection === "relatorios",
      items: [
        {
          name: "Produtos utilizados",
          href: "/relatorios",
          icon: Package
        },
        {
          name: "Serviços feitos",
          href: "/relatorios/servicos-realizados",
          icon: ClipboardList
        },
        {
          name: "Serviço frota",
          href: "/relatorios/servicos-frota",
          icon: Users
        }
      ]
    },
    {
      id: "cadastros",
      title: "Cadastros",
      icon: Building2,
      color: "text-green-500",
      hasSubmenu: true,
      active: activeSection === "cadastros",
      items: [
        {
          name: "Produtos",
          href: "/produtos",
          icon: Package
        },
        {
          name: "Fornecedores",
          href: "/fornecedores",
          icon: Building2
        },
        {
          name: "Fornecedores de Produtos",
          href: "/fornecedores-produtos",
          icon: Building2
        },
        {
          name: "Motoristas",
          href: "/motoristas",
          icon: Users
        }
      ]
    },
    {
      id: "chat",
      title: "Chat",
      icon: MessageSquare,
      color: "text-blue-500",
      href: "/chat",
      hasSubmenu: false,
      active: activeSection === "chat"
    },
    {
      id: "pet",
      title: "Área PET",
      icon: HeartHandshake,
      color: "text-pink-500",
      href: "/pet",
      hasSubmenu: false,
      active: activeSection === "pet"
    },
    {
      id: "suporte",
      title: "Suporte 9:00h a 00:00h",
      icon: MessageSquare,
      color: "text-blue-500",
      href: "/suporte",
      hasSubmenu: false,
      active: activeSection === "suporte"
    },
    {
      id: "logs",
      title: "Logs de Auditoria",
      icon: Shield,
      color: "text-red-500",
      href: "/logs-auditoria",
      hasSubmenu: false,
      active: activeSection === "logs"
    },
    {
      id: "backup",
      title: "Backup do Banco",
      icon: Download,
      color: "text-green-500",
      href: "/api/backup/download",
      hasSubmenu: false,
      active: false,
      isDownload: true
    }
  ];

  // Auto-expandir seção baseada na URL atual (apenas uma por vez)
  useEffect(() => {
    const currentSection = menuSections.find(section => section.active);
    if (currentSection && currentSection.hasSubmenu) {
      // Recolhe todas as seções e expande apenas a ativa
      setExpandedSections({
        [currentSection.id]: true
      });
    }
  }, [location]);

  const effectiveExpanded = isCollapsed ? isHoverExpanded : true;

  return (
    <div 
      className={cn(
        "bg-white dark:bg-primary border-r border-gray-200 dark:border-border flex flex-col transition-all duration-300 relative z-40 h-screen",
        isCollapsed && !isHoverExpanded ? "w-16" : "w-64",
        isHoverExpanded && "shadow-xl z-50",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo e Botão Toggle */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-border">
        {effectiveExpanded && (
          <div className="flex items-center">
            <div className="h-8 w-8 bg-purple-600 dark:bg-accent rounded-full flex items-center justify-center mr-3">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-foreground">Memorium</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700",
            isCollapsed && !isHoverExpanded && "mx-auto"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className={cn(
        "flex-1 py-6 space-y-2 overflow-y-auto sidebar-scroll",
        isCollapsed && !isHoverExpanded ? "px-2" : "px-4"
      )}>
        {menuSections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections[section.id] ?? false;
          const isActive = section.active;
          
          if (!section.hasSubmenu) {
            // Item sem submenu - link direto ou download
            const content = (
              <div
                className={cn(
                  "flex items-center justify-between rounded-lg transition-colors group relative",
                  isCollapsed && !isHoverExpanded ? "px-2 py-3 mx-auto w-12 justify-center" : "px-4 py-3",
                  isActive
                    ? "bg-purple-50 dark:bg-accent/20 text-purple-700 dark:text-white"
                    : "text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-50 dark:hover:bg-secondary"
                )}
                title={isCollapsed && !isHoverExpanded ? section.title : undefined}
              >
                <div className={cn(
                  "flex items-center",
                  isCollapsed && !isHoverExpanded && "justify-center"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    effectiveExpanded ? "mr-3" : "",
                    section.color
                  )} />
                  {effectiveExpanded && <span className="text-sm font-medium">{section.title}</span>}
                </div>
                
                {/* Tooltip para modo colapsado sem hover */}
                {isCollapsed && !isHoverExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    {section.title}
                  </div>
                )}
              </div>
            );

            // Se for um link de download, usar <a> com target="_blank"
            if ((section as any).isDownload) {
              return (
                <a key={section.id} href={section.href!} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              );
            }

            // Link normal do wouter
            return (
              <Link key={section.id} to={section.href!}>
                {content}
              </Link>
            );
          }

          // Item com submenu - expandível/colapsável
          return (
            <div key={section.id} className="space-y-1">
              {/* Header do grupo com toggle */}
              <div
                onClick={() => !isCollapsed && toggleSection(section.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg transition-colors group relative cursor-pointer",
                  isCollapsed && !isHoverExpanded ? "px-2 py-3 mx-auto w-12 justify-center" : "px-4 py-3",
                  isActive
                    ? "bg-purple-50 dark:bg-accent/20 text-purple-700 dark:text-white"
                    : "text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-50 dark:hover:bg-secondary"
                )}
                title={isCollapsed && !isHoverExpanded ? section.title : undefined}
              >
                <div className={cn(
                  "flex items-center",
                  isCollapsed && !isHoverExpanded && "justify-center"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    effectiveExpanded ? "mr-3" : "",
                    section.color
                  )} />
                  {effectiveExpanded && <span className="text-sm font-medium">{section.title}</span>}
                </div>
                
                {effectiveExpanded && section.hasSubmenu && (
                  <div className="transition-transform duration-200">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400 dark:text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 dark:text-muted-foreground" />
                    )}
                  </div>
                )}
                
                {/* Tooltip para modo colapsado sem hover */}
                {isCollapsed && !isHoverExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    {section.title}
                  </div>
                )}
              </div>

              {/* Submenu items */}
              {section.items && Array.isArray(section.items) && effectiveExpanded && (isExpanded || isCollapsed) && (
                <div className={cn(
                  "space-y-1 transition-all duration-200",
                  isCollapsed ? "ml-0" : "ml-6"
                )}>
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const itemActive = location === item.href || 
                      (item.href !== "/" && location.startsWith(item.href)) ||
                      (item.href === "/ordens-servico" && location === "/ordens-servico");
                    
                    return (
                      <Link key={item.name} to={item.href}>
                        <div
                          className={cn(
                            "flex items-center rounded-lg transition-colors group relative",
                            isCollapsed && !isHoverExpanded ? "px-2 py-2 mx-auto w-10 justify-center" : "px-4 py-2",
                            itemActive
                              ? "bg-purple-100 dark:bg-accent/30 text-purple-700 dark:text-white"
                              : "text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground hover:bg-gray-50 dark:hover:bg-secondary"
                          )}
                          title={isCollapsed && !isHoverExpanded ? item.name : undefined}
                        >
                          <div className={cn(
                            "flex items-center",
                            isCollapsed && !isHoverExpanded && "justify-center"
                          )}>
                            {isCollapsed && !isHoverExpanded ? (
                              <ItemIcon className="h-4 w-4" />
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-gray-400 dark:bg-muted-foreground rounded-full mr-3 flex-shrink-0" />
                                <span className="text-sm">{item.name}</span>
                              </>
                            )}
                          </div>
                          
                          {/* Tooltip para submenu colapsado */}
                          {isCollapsed && !isHoverExpanded && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                              {item.name}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}