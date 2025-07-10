import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MobileFabProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
}

export function MobileFab({ onClick, icon = <Plus className="h-5 w-5" />, label }: MobileFabProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-40 md:hidden"
      size="lg"
    >
      {icon}
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </Button>
  );
}