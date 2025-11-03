/* eslint-disable no-irregular-whitespace */
// src/components/Toast/ToastContainer.tsx

import React from 'react';
import type { Toast } from '@/contexts/ToastContext'; // Import from the context file
 // Import from the context file
import { ToastItem } from '@/components/Toast/ToastItem'; // Assuming this component exists

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    // Positioned at the top center of the screen
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 pt-4 px-4 pointer-events-none">
      <div className="flex flex-col items-center space-y-2 max-w-md w-full">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => onRemove(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};