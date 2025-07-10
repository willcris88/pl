import { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { Button } from "./button";

interface AlertItem {
  id: string;
  type: "error" | "warning" | "success" | "info";
  title: string;
  description?: string;
  fields?: string[];
  duration?: number;
}

interface CustomAlertProps {
  alert: AlertItem;
  onClose: () => void;
}

const alertIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const alertStyles = {
  error: {
    container: "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-900 dark:text-red-100",
    description: "text-red-700 dark:text-red-300",
    button: "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
  },
  warning: {
    container: "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800",
    icon: "text-yellow-600 dark:text-yellow-400",
    title: "text-yellow-900 dark:text-yellow-100",
    description: "text-yellow-700 dark:text-yellow-300",
    button: "text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
  },
  success: {
    container: "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    title: "text-green-900 dark:text-green-100",
    description: "text-green-700 dark:text-green-300",
    button: "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
  },
  info: {
    container: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-900 dark:text-blue-100",
    description: "text-blue-700 dark:text-blue-300",
    button: "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
  }
};

export function CustomAlert({ alert, onClose }: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const Icon = alertIcons[alert.type];
  const styles = alertStyles[alert.type];

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 50);

    // Auto-close se tiver duração
    if (alert.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, alert.duration);
      return () => clearTimeout(timer);
    }
  }, [alert.duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 200);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-500 ease-out transform ${
        isVisible && !isClosing
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div
        className={`rounded-2xl border-2 p-6 shadow-2xl backdrop-blur-sm ${styles.container} ${
          isVisible && !isClosing ? "animate-bounce-in" : ""
        }`}
      >
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 ${styles.icon}`}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold ${styles.title}`}>
              {alert.title}
            </h3>
            
            {alert.description && (
              <p className={`mt-1 text-sm ${styles.description}`}>
                {alert.description}
              </p>
            )}
            
            {alert.fields && alert.fields.length > 0 && (
              <div className="mt-3">
                <p className={`text-sm font-medium ${styles.title}`}>
                  Campos obrigatórios:
                </p>
                <ul className="mt-2 space-y-1">
                  {alert.fields.map((field, index) => (
                    <li
                      key={index}
                      className={`text-sm flex items-center space-x-2 ${styles.description}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${styles.icon.replace('text-', 'bg-')}`} />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className={`flex-shrink-0 h-6 w-6 p-0 hover:bg-white/20 ${styles.button}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook para gerenciar alertas
export function useCustomAlert() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = (alert: Omit<AlertItem, "id">) => {
    const newAlert: AlertItem = {
      ...alert,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    
    setAlerts(prev => [...prev, newAlert]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const showError = (title: string, description?: string, fields?: string[]) => {
    showAlert({ type: "error", title, description, fields });
  };

  const showSuccess = (title: string, description?: string) => {
    showAlert({ type: "success", title, description, duration: 4000 });
  };

  const showWarning = (title: string, description?: string) => {
    showAlert({ type: "warning", title, description, duration: 5000 });
  };

  const showInfo = (title: string, description?: string) => {
    showAlert({ type: "info", title, description, duration: 4000 });
  };

  return {
    alerts,
    removeAlert,
    showAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

// Componente para renderizar todos os alertas
export function AlertContainer() {
  const { alerts, removeAlert } = useCustomAlert();

  return (
    <>
      {alerts.map((alert, index) => (
        <div key={alert.id} style={{ zIndex: 1000 + index }}>
          <CustomAlert
            alert={alert}
            onClose={() => removeAlert(alert.id)}
          />
        </div>
      ))}
    </>
  );
}