import { useState, ReactNode } from "react";
import { MobileHeader } from "./mobile-header";
import { MobileSidebar } from "./mobile-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
}

export function MobileLayout({ children, title }: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileHeader
        title={title}
        onMenuToggle={() => setSidebarOpen(true)}
      />
      
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="px-4 py-4">
        {children}
      </main>
    </div>
  );
}