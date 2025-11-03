/* eslint-disable no-irregular-whitespace */
// src/components/Toast/ToastItem.tsx

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast } from '@/contexts/ToastContext'; // Import Toast type
 // Import Toast type

interface ToastItemProps {
  toast: Toast;
  onRemove: () => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Logic to handle the graceful exit animation
  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove();
    }, 300); // Match the animation duration (duration-300)
  };
  
  // Auto-remove logic (for non-persistent toasts)
  useEffect(() => {
    if (toast.duration && toast.duration > 0 && !toast.persistent) {
      const autoCloseTimer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(autoCloseTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration, toast.persistent]); // Recalculate if toast properties change

  const getToastStyles = () => {
    const baseStyles = "pointer-events-auto transform transition-all duration-300 ease-in-out";
    
    if (isLeaving) {
      return `${baseStyles} -translate-y-full opacity-0 scale-95`;
    }
    
    if (isVisible) {
      return `${baseStyles} translate-y-0 opacity-100 scale-100`;
    }
    
    return `${baseStyles} -translate-y-full opacity-0 scale-95`;
  };

  const getIconAndColor = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-600',
          borderColor: 'border-green-500',
          iconColor: 'text-green-100',
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5" />,
          bgColor: 'bg-red-600',
          borderColor: 'border-red-500',
          iconColor: 'text-red-100',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-600',
          borderColor: 'border-yellow-500',
          iconColor: 'text-yellow-100',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-600',
          borderColor: 'border-blue-500',
          iconColor: 'text-blue-100',
        };
    }
  };

  const { icon, bgColor, borderColor, iconColor } = getIconAndColor();

  return (
    <div className={getToastStyles()}>
      <div className={`
        ${bgColor} ${borderColor} border 
        backdrop-blur-lg bg-opacity-95
        rounded-lg shadow-lg p-4 min-w-[320px] max-w-md
        flex items-start gap-3
      `}>
        {/* Icon */}
        <div className={`${iconColor} flex-shrink-0 mt-0.5`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="text-white font-semibold text-sm mb-1 truncate">
              {toast.title}
            </h4>
          )}
          <p className="text-white/90 text-sm leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 -m-1 rounded-md hover:bg-white/10"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};