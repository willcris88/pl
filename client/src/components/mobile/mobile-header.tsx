import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Bell, Settings, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

interface MobileHeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export function MobileHeader({ title, onMenuToggle }: MobileHeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between md:hidden">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="p-2"
        >
          <User className="h-5 w-5" />
        </Button>

        {showUserMenu && (
          <div className="absolute top-16 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px] z-50">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {user?.nome || 'Usuário'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {user?.email}
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="sm" className="justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button variant="ghost" size="sm" className="justify-start text-red-600">
                Sair
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}