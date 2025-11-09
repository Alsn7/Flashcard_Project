"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEXT_LENGTH_EXAMPLES } from "@/types/preferences";

interface FlashcardOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: FlashcardOptions) => void;
  fileName?: string;
}

export interface FlashcardOptions {
  flashcardType: string;
  language: string;
  maxFlashcards: number | "auto";
  visibility: string;
  frontTextLength: "Short" | "Medium" | "Long";
  backTextLength: "Short" | "Medium" | "Long";
}

export function FlashcardOptionsModal({
  isOpen,
  onClose,
  onGenerate,
  fileName,
}: FlashcardOptionsModalProps) {
  const [flashcardType, setFlashcardType] = useState("Standard");
  const [language, setLanguage] = useState("Auto Detect");
  const [maxFlashcards, setMaxFlashcards] = useState<number | "auto">("auto");
  const [visibility, setVisibility] = useState("Public");
  const [frontTextLength, setFrontTextLength] = useState<"Short" | "Medium" | "Long">("Medium");
  const [backTextLength, setBackTextLength] = useState<"Short" | "Medium" | "Long">("Medium");

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

  // Load preferences from localStorage
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const userId = localStorage.getItem("userId");
      if (userId) {
        const savedPreferences = localStorage.getItem(`preferences_${userId}`);
        if (savedPreferences) {
          try {
            const prefs = JSON.parse(savedPreferences);
            setFrontTextLength(prefs.frontTextLength || "Medium");
            setBackTextLength(prefs.backTextLength || "Medium");
          } catch (error) {
            console.error("Error loading preferences:", error);
          }
        }
      }
    }
  }, [isOpen]);

  const handleGenerate = () => {
    onGenerate({
      flashcardType,
      language,
      maxFlashcards,
      visibility,
      frontTextLength,
      backTextLength,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal - Centered with absolute positioning instead of flex */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Options</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Row 1: Flashcard Type & Language */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flashcard Type
              </label>
              <Select value={flashcardType} onValueChange={setFlashcardType}>
                <SelectTrigger className="w-full bg-gray-50 border-0 h-10 rounded-lg hover:bg-gray-100 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Cloze">Cloze</SelectItem>
                  <SelectItem value="Image Occlusion">Image Occlusion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full bg-gray-50 border-0 h-10 rounded-lg hover:bg-gray-100 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto Detect">Auto Detect</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Max Flashcards & Visibility */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Flashcards
              </label>
              <Select
                value={String(maxFlashcards)}
                onValueChange={(value) => setMaxFlashcards(value === "auto" ? "auto" : parseInt(value))}
              >
                <SelectTrigger className="w-full bg-gray-50 border-0 h-10 rounded-lg hover:bg-gray-100 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="w-full bg-gray-50 border-0 h-10 rounded-lg hover:bg-gray-100 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Front Text Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Front Text Length
            </label>
            <div className="grid md:grid-cols-[120px_1fr] gap-4 w-full">
              {/* Radio buttons on the left */}
              <div className="block space-y-4">
                {(["Short", "Medium", "Long"] as const).map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="frontTextLength"
                        value={option}
                        checked={frontTextLength === option}
                        onChange={(e) => setFrontTextLength(e.target.value as "Short" | "Medium" | "Long")}
                        className="w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer transition-all hover:border-blue-500 checked:border-blue-600 checked:border-[6px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      />
                    </div>
                    <span className="text-base text-gray-700 font-normal">{option}</span>
                  </label>
                ))}
              </div>
              {/* Example Front Card on the right */}
              <div className="block w-full max-w-md">
                <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-6 min-h-[200px]">
                  <div className="text-center mb-4">
                    <span className="text-xs font-medium text-gray-400 tracking-wider uppercase">
                      Example Front
                    </span>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                      {TEXT_LENGTH_EXAMPLES.front[frontTextLength]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Text Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Back Text Length
            </label>
            <div className="grid md:grid-cols-[120px_1fr] gap-4 w-full">
              {/* Radio buttons on the left */}
              <div className="block space-y-4">
                {(["Short", "Medium", "Long"] as const).map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="backTextLength"
                        value={option}
                        checked={backTextLength === option}
                        onChange={(e) => setBackTextLength(e.target.value as "Short" | "Medium" | "Long")}
                        className="w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer transition-all hover:border-blue-500 checked:border-blue-600 checked:border-[6px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      />
                    </div>
                    <span className="text-base text-gray-700 font-normal">{option}</span>
                  </label>
                ))}
              </div>
              {/* Example Back Card on the right */}
              <div className="block w-full max-w-md">
                <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-6 min-h-[200px]">
                  <div className="text-center mb-4">
                    <span className="text-xs font-medium text-gray-400 tracking-wider uppercase">
                      Example Back
                    </span>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                      {TEXT_LENGTH_EXAMPLES.back[backTextLength]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-save message */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Options are automatically saved to your account.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-6 h-10 rounded-lg text-gray-600 hover:bg-gray-100 font-normal transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            className="px-6 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-normal transition-colors"
          >
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}
