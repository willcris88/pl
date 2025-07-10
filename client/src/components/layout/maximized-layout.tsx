import { useMaximize } from "@/contexts/maximize-context";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface MaximizedLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function MaximizedLayout({ children, title }: MaximizedLayoutProps) {
  const { isMaximized } = useMaximize();

  if (isMaximized) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}