"use client";

import React, { useEffect, useState } from "react";
import { useNavigation } from "@/contexts/NavigationContext";
import { usePathname } from "next/navigation";

interface NavigationLoaderProps {
  messages?: string[];
}

const defaultMessages = [
  "Loading your content...",
  "Preparing your experience...",
  "Just a moment...",
  "Getting things ready...",
];

export function NavigationLoader({
  messages = defaultMessages
}: NavigationLoaderProps) {
  const { isNavigating, stopNavigation } = useNavigation();
  const pathname = usePathname();
  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Record start time when navigation begins
  useEffect(() => {
    if (isNavigating && startTime === null) {
      setStartTime(Date.now());
    } else if (!isNavigating) {
      setStartTime(null);
    }
  }, [isNavigating, startTime]);

  // Handle navigation completion with minimum 2 second display
  useEffect(() => {
    if (pathname !== prevPathname && isNavigating && startTime !== null) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);

      // Wait for remaining time to ensure minimum 2 seconds
      const stopTimeout = setTimeout(() => {
        stopNavigation();
        setPrevPathname(pathname);
      }, remaining);

      return () => {
        clearTimeout(stopTimeout);
      };
    }
  }, [pathname, prevPathname, isNavigating, stopNavigation, startTime]);

  // Safety: Force stop after 2 seconds if pathname doesn't change
  useEffect(() => {
    if (!isNavigating || startTime === null) return;

    const maxDurationTimeout = setTimeout(() => {
      stopNavigation();
    }, 2000);

    return () => {
      clearTimeout(maxDurationTimeout);
    };
  }, [isNavigating, stopNavigation, startTime]);

  // Cycle through messages while navigating
  useEffect(() => {
    if (!isNavigating) return;

    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);

    let messageIndex = 0;
    const messageIntervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setCurrentMessage(messages[messageIndex]);
    }, 2000);

    return () => {
      clearInterval(messageIntervalId);
    };
  }, [isNavigating, messages]);

  // Prevent body scroll when loader is open
  useEffect(() => {
    if (isNavigating) {
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
  }, [isNavigating]);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 backdrop-blur-lg" />

      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Animated Circle with Gradient */}
          <div className="relative">
            {/* Main animated circle */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 animate-spin-slow"
                   style={{ clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%)' }} />
              <div className="absolute inset-1 rounded-full bg-white" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 animate-pulse" />
            </div>
            {/* Outer glow ring */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-ping-slow" />
          </div>

          {/* Title with gradient */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading
          </h2>

          {/* Dynamic Description */}
          <p className="text-center text-gray-600 text-sm font-medium animate-pulse-text">
            {currentMessage}
          </p>

          {/* Progress dots */}
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes pulse-text {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-spin-slow {
          animation: spin-slow 1.5s linear infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-pulse-text {
          animation: pulse-text 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
