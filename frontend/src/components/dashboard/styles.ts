// Custom scrollbar styles for dashboard components
export const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(55, 65, 81, 0.3);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(236, 72, 153, 0.5);
    border-radius: 4px;
    border: 1px solid rgba(55, 65, 81, 0.2);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(236, 72, 153, 0.7);
  }
  
  .custom-scrollbar-gray::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar-gray::-webkit-scrollbar-track {
    background: rgba(55, 65, 81, 0.3);
    border-radius: 4px;
  }
  .custom-scrollbar-gray::-webkit-scrollbar-thumb {
    background: rgba(107, 114, 128, 0.5);
    border-radius: 4px;
    border: 1px solid rgba(55, 65, 81, 0.2);
  }
  .custom-scrollbar-gray::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.7);
  }
`;

// Insert styles into document head
export const insertScrollbarStyles = () => {
  if (typeof document !== 'undefined') {
    const styleElement = document.getElementById('custom-scrollbar-styles');
    if (!styleElement) {
      const style = document.createElement('style');
      style.id = 'custom-scrollbar-styles';
      style.textContent = scrollbarStyles;
      document.head.appendChild(style);
    }
  }
};