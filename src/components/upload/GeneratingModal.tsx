"use client";

import React, { useEffect } from "react";

interface GeneratingModalProps {
  isOpen: boolean;
}

export function GeneratingModal({ isOpen }: GeneratingModalProps) {
  // Prevent body scroll when modal is open but preserve scrollbar space
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Prevent any clicks on backdrop from doing anything
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Animated Circle */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-blue-500 animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-blue-500/30 animate-ping" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-800">
            Generating
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 text-sm">
            Your flashcards are being created.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
