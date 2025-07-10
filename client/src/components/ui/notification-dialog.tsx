import { useState, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

interface NotificationDialogProps {
  title: string;
  description: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
  onClose?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const variantConfig = {
  success: {
    icon: <CheckCircle className="h-8 w-8 text-green-600" />,
    titleClass: "text-green-900 dark:text-green-100",
    buttonClass: "bg-green-600 hover:bg-green-700",
    borderClass: "border-green-200 dark:border-green-800",
    bgClass: "bg-green-50 dark:bg-green-950/30"
  },
  error: {
    icon: <XCircle className="h-8 w-8 text-red-600" />,
    titleClass: "text-red-900 dark:text-red-100",
    buttonClass: "bg-red-600 hover:bg-red-700",
    borderClass: "border-red-200 dark:border-red-800",
    bgClass: "bg-red-50 dark:bg-red-950/30"
  },
  warning: {
    icon: <AlertTriangle className="h-8 w-8 text-yellow-600" />,
    titleClass: "text-yellow-900 dark:text-yellow-100",
    buttonClass: "bg-yellow-600 hover:bg-yellow-700",
    borderClass: "border-yellow-200 dark:border-yellow-800",
    bgClass: "bg-yellow-50 dark:bg-yellow-950/30"
  },
  info: {
    icon: <Info className="h-8 w-8 text-blue-600" />,
    titleClass: "text-blue-900 dark:text-blue-100",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
    borderClass: "border-blue-200 dark:border-blue-800",
    bgClass: "bg-blue-50 dark:bg-blue-950/30"
  }
};

export function NotificationDialog({
  title,
  description,
  variant = 'info',
  buttonText = "OK",
  onClose,
  open,
  onOpenChange
}: NotificationDialogProps) {
  const config = variantConfig[variant];

  const handleClose = () => {
    if (onClose) onClose();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={`max-w-md border-2 ${config.borderClass} ${config.bgClass} shadow-2xl`}>
        <AlertDialogHeader className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg">
              {config.icon}
            </div>
            <AlertDialogTitle className={`text-xl font-semibold ${config.titleClass}`}>
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300 leading-relaxed text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center pt-4">
          <AlertDialogAction asChild>
            <Button 
              onClick={handleClose}
              className={`px-8 text-white ${config.buttonClass} hover:shadow-lg transition-all duration-200`}
            >
              {buttonText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook para usar notificações programaticamente
export const useNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    buttonText?: string;
    onClose?: () => void;
  } | null>(null);

  const showNotification = (options: {
    title: string;
    description: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    buttonText?: string;
    onClose?: () => void;
  }) => {
    setConfig(options);
    setIsOpen(true);
  };

  const showSuccess = (title: string, description: string, onClose?: () => void) => {
    showNotification({ title, description, variant: 'success', onClose });
  };

  const showError = (title: string, description: string, onClose?: () => void) => {
    showNotification({ title, description, variant: 'error', onClose });
  };

  const showWarning = (title: string, description: string, onClose?: () => void) => {
    showNotification({ title, description, variant: 'warning', onClose });
  };

  const showInfo = (title: string, description: string, onClose?: () => void) => {
    showNotification({ title, description, variant: 'info', onClose });
  };

  const NotificationModal = config ? (
    <NotificationDialog
      title={config.title}
      description={config.description}
      variant={config.variant}
      buttonText={config.buttonText}
      onClose={config.onClose}
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  ) : null;

  return { 
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationModal 
  };
};