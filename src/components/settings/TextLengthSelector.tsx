"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TextLengthSelectorProps {
  value: "Short" | "Medium" | "Long";
  onChange: (value: "Short" | "Medium" | "Long") => void;
  label: string;
  exampleFront?: string;
  exampleBack?: string;
  disabled?: boolean;
}

export function TextLengthSelector({
  value,
  onChange,
  label,
  exampleFront,
  exampleBack,
  disabled = false,
}: TextLengthSelectorProps) {
  const options: Array<"Short" | "Medium" | "Long"> = ["Short", "Medium", "Long"];

  const getExampleText = () => {
    if (exampleFront) return exampleFront;
    if (exampleBack) return exampleBack;
    return "";
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">{label}</h3>
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                value === option
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="relative flex items-center">
                <input
                  type="radio"
                  name={label}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value as "Short" | "Medium" | "Long")}
                  disabled={disabled}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    value === option
                      ? "border-primary"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {value === option && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>
              <span className="text-sm font-medium">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Example Preview */}
      {getExampleText() && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            {exampleFront ? "EXAMPLE FRONT" : "EXAMPLE BACK"}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
            {getExampleText()}
          </p>
        </div>
      )}
    </div>
  );
}
