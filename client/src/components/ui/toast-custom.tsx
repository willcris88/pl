import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

interface CustomToastProps {
  show: boolean;
  title: string;
  description: string;
  fields: string[];
  onClose: () => void;
  duration?: number;
}

export function CustomToast({ 
  show, 
  title, 
  description, 
  fields, 
  onClose, 
  duration = 8000 
}: CustomToastProps) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-slide-in">
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="mt-1 text-sm text-white/90">
              {description}
            </p>
            
            {fields.length > 0 && (
              <div className="mt-4 space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-sm text-white"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
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

export function useCustomToast() {
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    description: string;
    fields: string[];
  }>({
    show: false,
    title: "",
    description: "",
    fields: [],
  });

  const showToast = (title: string, description: string, fields: string[] = []) => {
    setToast({
      show: true,
      title,
      description,
      fields,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}