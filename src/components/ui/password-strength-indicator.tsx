"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
}

const passwordCriteria: PasswordCriteria[] = [
  { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "Contains uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "Contains lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "Contains number", test: (pwd) => /\d/.test(pwd) },
  { label: "Contains special character (@$!%*?&)", test: (pwd) => /[@$!%*?&]/.test(pwd) },
];

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const metCriteria = passwordCriteria.filter(criteria => criteria.test(password));
  const strength = metCriteria.length;
  const isStrong = strength === passwordCriteria.length;

  const getStrengthColor = () => {
    if (strength === 0) return "bg-gray-200";
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-orange-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength === 0) return "Enter password";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn(
            "font-medium",
            strength <= 2 && "text-red-600",
            strength === 3 && "text-yellow-600", 
            strength === 4 && "text-orange-600",
            strength === 5 && "text-green-600"
          )}>
            {getStrengthText()}
          </span>
        </div>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index < strength ? getStrengthColor() : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Criteria checklist */}
      <div className="space-y-1">
        {passwordCriteria.map((criteria, index) => {
          const isMet = criteria.test(password);
          return (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <div className={cn(
                "w-3 h-3 rounded-full flex items-center justify-center",
                isMet ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              )}>
                {isMet ? "✓" : "○"}
              </div>
              <span className={cn(
                isMet ? "text-green-600" : "text-muted-foreground"
              )}>
                {criteria.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}