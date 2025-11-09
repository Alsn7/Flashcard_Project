"use client";

import React, { useEffect } from "react";
import { Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface CompleteModalProps {
  isOpen: boolean;
  onRestart: () => void;
  onMarkComplete: () => void;
  onCreateNew?: () => void;
}

export function CompleteModal({ isOpen, onRestart, onMarkComplete, onCreateNew }: CompleteModalProps) {
  const router = useRouter();

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

  const handleCreateNew = () => {
    if (onCreateNew) {
      // If callback is provided, use it (for dashboard reset)
      onCreateNew();
    } else {
      // Otherwise, navigate to dashboard (for other pages)
      router.push("/dashboard");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Success Icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-500">
              <Check className="w-12 h-12 text-white stroke-[3]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-semibold text-gray-800">
            Complete!
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 text-base">
            Great job! You've finished all of the flashcards in this set.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full pt-4">
            <button
              onClick={onMarkComplete}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              View My Progress
            </button>

            <button
              onClick={handleCreateNew}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-medium hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Flashcards
            </button>

            <button
              onClick={onRestart}
              className="w-full px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-105 active:scale-95"
            >
              Study Again
            </button>
          </div>

          {/* Hint Text */}
          <p className="text-center text-gray-500 text-sm mt-2">
            Your progress will be saved automatically
          </p>
        </div>
      </div>
    </div>
  );
}
