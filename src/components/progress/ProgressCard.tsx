"use client";

import React from "react";
import { Deck } from "@/types/deck";
import { Calendar, BookOpen, CheckCircle, TrendingUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  deck: Deck;
  onDelete: (deckId: string) => void;
  onOpen: (deckId: string) => void;
}

export function ProgressCard({ deck, onDelete, onOpen }: ProgressCardProps) {
  const { progress } = deck;

  const formatDate = (date?: Date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {deck.name}
            </h3>
            {deck.description && (
              <p className="text-sm text-gray-500">{deck.description}</p>
            )}
          </div>
          {progress.completionPercentage === 100 && (
            <div className="ml-4 flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Mastered
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-blue-600">
            {progress.completionPercentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progress.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-2 gap-4">
        {/* Total Cards */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Cards</p>
            <p className="text-lg font-semibold text-gray-800">{progress.totalCards}</p>
          </div>
        </div>

        {/* Mastered */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Mastered</p>
            <p className="text-lg font-semibold text-gray-800">{progress.masteredCards}</p>
          </div>
        </div>

        {/* Learning */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Learning</p>
            <p className="text-lg font-semibold text-gray-800">{progress.learningCards}</p>
          </div>
        </div>

        {/* Needs Review */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Needs Review</p>
            <p className="text-lg font-semibold text-gray-800">{progress.needsReviewCards}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 space-y-3">
        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created: {formatDate(deck.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last studied: {formatDate(deck.lastStudied)}</span>
          </div>
        </div>

        {/* Study Sessions */}
        <div className="text-xs text-gray-500">
          Study sessions: <span className="font-medium text-gray-700">{progress.studySessions || 0}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onOpen(deck.id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Study Now
          </button>
          <button
            onClick={() => onDelete(deck.id)}
            className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 hover:border-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
