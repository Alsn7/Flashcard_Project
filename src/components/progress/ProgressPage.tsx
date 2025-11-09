"use client";

import React, { useState, useEffect } from "react";
import { Deck } from "@/types/deck";
import { deckStorage } from "@/lib/deck-storage";
import { ProgressCard } from "./ProgressCard";
import { Layers, TrendingUp, CheckCircle2, BookOpen, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProgressPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filter, setFilter] = useState<"all" | "completed" | "in-progress">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "progress">("newest");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setUserId(id);
      loadDecks(id);
    }
  }, []);

  const loadDecks = (id: string) => {
    const userDecks = deckStorage.getDecks(id);

    // Recalculate progress for each deck to ensure accuracy
    const decksWithUpdatedProgress = userDecks.map(deck => ({
      ...deck,
      progress: deckStorage.calculateProgress(deck.flashcards)
    }));

    setDecks(decksWithUpdatedProgress);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (!userId) return;

    if (confirm("Are you sure you want to delete this study set? This action cannot be undone.")) {
      deckStorage.deleteDeck(userId, deckId);
      loadDecks(userId);
    }
  };

  const handleOpenDeck = (deckId: string) => {
    // Navigate to the study set viewer page
    router.push(`/myflashcards/${deckId}`);
  };

  const handleSortChange = (newSort: "newest" | "oldest" | "name" | "progress") => {
    setIsSorting(true);
    setSortBy(newSort);

    // Simulate brief loading for visual feedback
    setTimeout(() => {
      setIsSorting(false);
    }, 400);
  };

  const filteredDecks = decks
    .filter(deck => {
      if (filter === "completed") return deck.isCompleted;
      if (filter === "in-progress") return !deck.isCompleted;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return b.progress.completionPercentage - a.progress.completionPercentage;
        default:
          return 0;
      }
    });

  // Calculate overall statistics
  const stats = {
    totalSets: decks.length,
    completedSets: decks.filter(d => d.isCompleted).length,
    totalCards: decks.reduce((sum, d) => sum + d.progress.totalCards, 0),
    masteredCards: decks.reduce((sum, d) => sum + d.progress.masteredCards, 0),
  };

  const overallProgress = stats.totalCards > 0
    ? Math.round((stats.masteredCards / stats.totalCards) * 100)
    : 0;

  if (!userId) {
    return (
      <div className="w-full max-w-7xl mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Please log in to view your study sets.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Flashcards</h1>
          <p className="text-gray-600">Track your learning journey and manage your study sets</p>
        </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Layers className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{stats.totalSets}</p>
          <p className="text-blue-100 text-sm">Total Sets</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{stats.completedSets}</p>
          <p className="text-green-100 text-sm">Completed</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{stats.totalCards}</p>
          <p className="text-purple-100 text-sm">Total Cards</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-3xl font-bold">{overallProgress}%</p>
          <p className="text-orange-100 text-sm">Overall Progress</p>
        </div>
      </div>

      {/* Filter Tabs and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-0">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            All ({decks.length})
          </button>
          <button
            onClick={() => setFilter("in-progress")}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === "in-progress"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            In Progress ({decks.filter(d => !d.isCompleted).length})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === "completed"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Completed ({stats.completedSets})
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 pb-2 sm:pb-0">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="progress">Progress (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Study Sets Grid */}
      {filteredDecks.length === 0 ? (
        <div className="text-center py-16">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No study sets found</h3>
          <p className="text-gray-500">
            {filter === "all"
              ? "Create your first study set by uploading a PDF!"
              : `No ${filter === "completed" ? "completed" : "in-progress"} study sets yet.`
            }
          </p>
        </div>
      ) : (
        <div
          key={sortBy}
          className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${
            isSorting ? 'opacity-50' : 'opacity-100 animate-in fade-in duration-300'
          }`}
        >
          {filteredDecks.map((deck, index) => (
            <div
              key={deck.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              <ProgressCard
                deck={deck}
                onDelete={handleDeleteDeck}
                onOpen={handleOpenDeck}
              />
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Loading Overlay - Outside main container */}
      {isSorting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 bg-black/20 backdrop-blur-md">
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Animated Circle */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-blue-500 animate-pulse-custom" />
                <div className="absolute inset-0 w-16 h-16 rounded-full bg-blue-500/30 animate-ping-custom" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-gray-800">
                Sorting
              </h2>

              {/* Description */}
              <p className="text-center text-gray-600 text-sm">
                Reorganizing your study sets...
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-custom {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes ping-custom {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-pulse-custom {
          animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-ping-custom {
          animation: ping-custom 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}
