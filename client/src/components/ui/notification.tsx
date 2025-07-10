import { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationProps {
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  fields?: string[];
  duration?: number;
  onClose?: () => void;
}

export function Notification({ 
  type, 
  title, 
  message, 
  fields = [], 
  duration = 6000,
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-6 w-6" />;
      case "success":
        return <CheckCircle className="h-6 w-6" />;
      case "warning":
        return <AlertCircle className="h-6 w-6" />;
      case "info":
        return <Info className="h-6 w-6" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "error":
        return {
          container: "bg-gradient-to-r from-red-500 to-pink-500",
          icon: "text-white",
          text: "text-white"
        };
      case "success":
        return {
          container: "bg-gradient-to-r from-green-500 to-emerald-500",
          icon: "text-white",
          text: "text-white"
        };
      case "warning":
        return {
          container: "bg-gradient-to-r from-orange-500 to-amber-500",
          icon: "text-white",
          text: "text-white"
        };
      case "info":
        return {
          container: "bg-gradient-to-r from-blue-500 to-cyan-500",
          icon: "text-white",
          text: "text-white"
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-300",
      isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100 animate-slide-in-right"
    )}>
      <div className={cn(
        "rounded-2xl p-6 shadow-2xl backdrop-blur-sm border border-white/20",
        styles.container
      )}>
        <div className="flex items-start space-x-4">
          <div className={cn("flex-shrink-0", styles.icon)}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {getIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className={cn("text-lg font-bold uppercase tracking-wide", styles.text)}>
                {title}
              </h3>
              <button
                onClick={handleClose}
                className={cn("hover:bg-white/20 rounded-full p-1 transition-colors", styles.text)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className={cn("text-sm mb-3", styles.text, "opacity-90")}>
              {message}
            </p>
            
            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-3 text-sm py-2 px-3 rounded-lg bg-white/10 backdrop-blur-sm",
                      styles.text
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <span className="font-medium">{field}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

let notificationId = 0;

interface NotificationItem {
  id: number;
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  fields?: string[];
  duration?: number;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (
    type: "error" | "success" | "warning" | "info",
    title: string,
    message: string,
    fields: string[] = [],
    duration: number = 6000
  ) => {
    const id = ++notificationId;
    const notification: NotificationItem = {
      id,
      type,
      title,
      message,
      fields,
      duration
    };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showError = (title: string, message: string, fields: string[] = []) => {
    return addNotification("error", title, message, fields);
  };

  const showSuccess = (title: string, message: string, fields: string[] = []) => {
    return addNotification("success", title, message, fields, 4000);
  };

  const showWarning = (title: string, message: string, fields: string[] = []) => {
    return addNotification("warning", title, message, fields, 5000);
  };

  const showInfo = (title: string, message: string, fields: string[] = []) => {
    return addNotification("info", title, message, fields, 5000);
  };

  return {
    notifications,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    removeNotification
  };
}