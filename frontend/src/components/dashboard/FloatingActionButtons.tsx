/* eslint-disable no-irregular-whitespace */
// src/components/FloatingActionButtons.tsx (Vite/React Conversion)

// Removed: 'use client'; // 🌟 VITE FIX 1: Remove Next.js-specific directive

import { ArrowLeft, X, Heart, MessageCircle } from 'lucide-react';

interface FloatingActionButtonsProps {
  onGoBack: () => void;
  onPass: () => void;
  onLike: () => void;
  onMessage: () => void;
}

export const FloatingActionButtons = ({
  onGoBack,
  onPass,
  onLike,
  onMessage
}: FloatingActionButtonsProps) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex items-center justify-center space-x-3">
        {/* Go Back Button */}
        <div className="relative group">
          <button
            onClick={onGoBack}
            className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900/90 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm border border-gray-700/50 whitespace-nowrap">
              Go Back
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90"></div>
            </div>
          </div>
        </div>

        {/* Pass Button */}
        <div className="relative group">
          <button
            onClick={onPass}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900/90 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm border border-gray-700/50 whitespace-nowrap">
              Pass
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90"></div>
            </div>
            </div>
        </div>

        {/* Like Button */}
        <div className="relative group">
          <button
            onClick={onLike}
            className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <Heart className="w-6 h-6 group-hover:scale-110 group-hover:fill-current transition-all duration-300" />
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900/90 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm border border-gray-700/50 whitespace-nowrap">
              Like
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90"></div>
            </div>
          </div>
        </div>

        {/* Message Button */}
        <div className="relative group">
          <button
            onClick={onMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          </button>
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900/90 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm border border-gray-700/50 whitespace-nowrap">
              Message
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};