import { useState, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle, XCircle, Trash2, Save, AlertCircle } from "lucide-react";

interface ConfirmationDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  children: ReactNode;
  icon?: ReactNode;
}

const variantConfig = {
  default: {
    icon: <Info className="h-6 w-6 text-blue-600" />,
    titleClass: "text-blue-900 dark:text-blue-100",
    confirmClass: "bg-blue-600 hover:bg-blue-700",
    borderClass: "border-blue-200 dark:border-blue-800"
  },
  destructive: {
    icon: <Trash2 className="h-6 w-6 text-red-600" />,
    titleClass: "text-red-900 dark:text-red-100",
    confirmClass: "bg-red-600 hover:bg-red-700",
    borderClass: "border-red-200 dark:border-red-800"
  },
  success: {
    icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    titleClass: "text-green-900 dark:text-green-100",
    confirmClass: "bg-green-600 hover:bg-green-700",
    borderClass: "border-green-200 dark:border-green-800"
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
    titleClass: "text-yellow-900 dark:text-yellow-100",
    confirmClass: "bg-yellow-600 hover:bg-yellow-700",
    borderClass: "border-yellow-200 dark:border-yellow-800"
  },
  info: {
    icon: <AlertCircle className="h-6 w-6 text-blue-600" />,
    titleClass: "text-blue-900 dark:text-blue-100",
    confirmClass: "bg-blue-600 hover:bg-blue-700",
    borderClass: "border-blue-200 dark:border-blue-800"
  }
};

export function ConfirmationDialog({
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'default',
  onConfirm,
  onCancel,
  children,
  icon
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const config = variantConfig[variant];

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className={`max-w-md border-2 ${config.borderClass} shadow-2xl`}>
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            {icon || config.icon}
            <AlertDialogTitle className={`text-lg font-semibold ${config.titleClass}`}>
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 pt-4">
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={handleConfirm}
              className={`flex-1 text-white ${config.confirmClass}`}
            >
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook para usar confirmação programaticamente
export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const confirm = (options: {
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
  }) => {
    setConfig(options);
    setIsOpen(true);
  };

  const ConfirmationModal = config ? (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className={`max-w-md border-2 ${variantConfig[config.variant || 'default'].borderClass} shadow-2xl`}>
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            {variantConfig[config.variant || 'default'].icon}
            <AlertDialogTitle className={`text-lg font-semibold ${variantConfig[config.variant || 'default'].titleClass}`}>
              {config.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 pt-4">
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {config.cancelText || "Cancelar"}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={() => {
                config.onConfirm();
                setIsOpen(false);
              }}
              className={`flex-1 text-white ${variantConfig[config.variant || 'default'].confirmClass}`}
            >
              {config.confirmText || "Confirmar"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null;

  return { confirm, ConfirmationModal };
};