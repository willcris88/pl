import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useMaximize } from "@/contexts/maximize-context";
import { Bell, Menu, User, Sun, Moon, Maximize2, Minimize2, Calendar } from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isMaximized, toggleMaximize } = useMaximize();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <header className="bg-white dark:bg-primary border-b border-gray-200 dark:border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-foreground">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 h-auto">
            AVISO
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMaximize}
            className="text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-secondary"
            title={isMaximized ? "Restaurar janela" : "Maximizar tela"}
          >
            {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-secondary"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          <Link to="/">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-secondary"
              title="Calendário de Eventos"
            >
              <Calendar className="h-5 w-5" />
            </Button>
          </Link>
          
          <ChatWidget />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-500 dark:text-muted-foreground hover:text-gray-700 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-secondary">
                <div className="w-8 h-8 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                {user?.nome || user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
