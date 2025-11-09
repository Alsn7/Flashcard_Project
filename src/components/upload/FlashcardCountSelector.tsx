"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface FlashcardCountSelectorProps {
  onSelect: (count: number | "auto") => void;
  disabled?: boolean;
}

const PRESET_COUNTS = [5, 10, 15, 20, 30];

export default function FlashcardCountSelector({
  onSelect,
  disabled = false,
}: FlashcardCountSelectorProps) {
  const [selectedCount, setSelectedCount] = React.useState<number | "auto">(10);
  const [customCount, setCustomCount] = React.useState<string>("");
  const [showCustomInput, setShowCustomInput] = React.useState(false);

  const handleSelect = (count: number | "auto") => {
    setSelectedCount(count);
    setShowCustomInput(false);
    setCustomCount("");
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomCount(value);
      const numValue = parseInt(value);
      if (numValue > 0 && numValue <= 100) {
        setSelectedCount(numValue);
      }
    }
  };

  const handleGenerate = () => {
    onSelect(selectedCount);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How many flashcards would you like?
        </h3>

        {/* Preset buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {PRESET_COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => handleSelect(count)}
              disabled={disabled}
              className={cn(
                "px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm",
                selectedCount === count
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {count}
            </button>
          ))}

          {/* Custom button */}
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            disabled={disabled}
            className={cn(
              "px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm",
              showCustomInput && typeof selectedCount === "number" && !PRESET_COUNTS.includes(selectedCount)
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            Custom
          </button>
        </div>

        {/* Custom input */}
        {showCustomInput && (
          <div className="mb-4">
            <input
              type="text"
              value={customCount}
              onChange={handleCustomInputChange}
              placeholder="Enter number (1-100)"
              disabled={disabled}
              className={cn(
                "w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700",
                "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                "focus:outline-none focus:border-primary",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum 100 flashcards
            </p>
          </div>
        )}

        {/* Auto mode */}
        <button
          onClick={() => handleSelect("auto")}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm mb-4 flex items-center justify-center gap-2",
            selectedCount === "auto"
              ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Sparkles size={16} />
          Auto (AI decides based on content)
        </button>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={disabled || (showCustomInput && !customCount)}
          className="w-full"
        >
          Generate Flashcards
          {selectedCount === "auto" ? "" : ` (${selectedCount})`}
        </Button>

        {/* Info text */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
          {selectedCount === "auto"
            ? "AI will analyze your PDF and generate an optimal number of flashcards"
            : `${selectedCount} flashcard${selectedCount === 1 ? "" : "s"} will be generated from your PDF`}
        </p>
      </div>
    </div>
  );
}
