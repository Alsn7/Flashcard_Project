"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Shuffle, SkipBack, Printer, Download, Edit, ThumbsUp, ThumbsDown, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTextDirection } from "@/lib/language-utils";
import { Button } from "@/components/ui/button";
import { CompleteModal } from "./CompleteModal";
import { deckStorage } from "@/lib/deck-storage";
import { Flashcard as FlashcardType, Deck, StudySession } from "@/types/deck";
import { useRouter } from "next/navigation";

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  deckName?: string;
  onCreateNew?: () => void;
  existingDeckId?: string; // If viewing an existing deck, pass its ID
}

export function FlashcardViewer({ flashcards, deckName, onCreateNew, existingDeckId }: FlashcardViewerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set([0]));
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [cardMastery, setCardMastery] = useState<Map<number, "needs-review" | "learning" | "mastered">>(new Map());
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | "none">("none");
  const [lastCardInteracted, setLastCardInteracted] = useState(false);

  if (flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];
  const textDir = isFlipped
    ? getTextDirection(currentCard.answer)
    : getTextDirection(currentCard.question);

  // Initialize deck and study session
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId || !flashcards.length || currentDeck) return; // Don't create if deck already exists

    let deck;

    // If viewing an existing deck, load it
    if (existingDeckId) {
      const existingDeck = deckStorage.getDeck(userId, existingDeckId);
      if (existingDeck) {
        deck = existingDeck;
      }
    }

    // Otherwise, create a new deck
    if (!deck) {
      const name = deckName || `Study Set ${new Date().toLocaleDateString()}`;
      deck = deckStorage.createDeckFromFlashcards(userId, name, flashcards);
    }

    setCurrentDeck(deck);

    // Start study session
    const session = deckStorage.startStudySession(deck.id);
    setStudySession(session);
  }, [flashcards, deckName, currentDeck, existingDeckId]);

  // Check if all cards have been viewed and user interacted with last card
  useEffect(() => {
    if (viewedCards.size === flashcards.length && flashcards.length > 0 && lastCardInteracted) {
      setShowCompleteModal(true);
    }
  }, [viewedCards, flashcards.length, lastCardInteracted]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setSlideDirection("right");
      setIsFlipped(false);
      setCurrentIndex(newIndex);
      setViewedCards(prev => new Set(prev).add(newIndex));
      setLastCardInteracted(false);
      setTimeout(() => setSlideDirection("none"), 400);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      const newIndex = currentIndex + 1;
      setSlideDirection("left");
      setIsFlipped(false);
      setCurrentIndex(newIndex);
      setViewedCards(prev => new Set(prev).add(newIndex));
      setLastCardInteracted(false);
      setTimeout(() => setSlideDirection("none"), 400);
    }
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * flashcards.length);
    setSlideDirection(randomIndex > currentIndex ? "left" : "right");
    setIsFlipped(false);
    setCurrentIndex(randomIndex);
    setViewedCards(prev => new Set(prev).add(randomIndex));
    setLastCardInteracted(false);
    setTimeout(() => setSlideDirection("none"), 400);
  };

  const handleReset = () => {
    setSlideDirection("right");
    setIsFlipped(false);
    setCurrentIndex(0);
    setViewedCards(new Set([0]));
    setShowCompleteModal(false);
    setCardMastery(new Map());
    setLastCardInteracted(false);
    setTimeout(() => setSlideDirection("none"), 400);

    // Start new study session
    if (currentDeck) {
      const session = deckStorage.startStudySession(currentDeck.id);
      setStudySession(session);
    }
  };

  const handleMarkComplete = () => {
    const userId = localStorage.getItem("userId");
    if (!userId || !currentDeck) return;

    deckStorage.markDeckComplete(userId, currentDeck.id);

    // End study session
    if (studySession) {
      deckStorage.endStudySession(userId, studySession);
    }

    setShowCompleteModal(false);

    // Redirect to My Progress page to see achievements
    setTimeout(() => {
      router.push("/myflashcards");
    }, 500);
  };

  const handleCardMastery = (mastery: "needs-review" | "learning" | "mastered") => {
    const userId = localStorage.getItem("userId");
    if (!userId || !currentDeck) return;

    const cardId = currentDeck.flashcards[currentIndex].id;
    deckStorage.updateCardMastery(userId, currentDeck.id, cardId, mastery);

    // Update local state
    setCardMastery(prev => new Map(prev).set(currentIndex, mastery));

    // Update study session
    if (studySession) {
      studySession.cardsReviewed++;
      if (mastery === "mastered") studySession.cardsMarkedMastered++;
      if (mastery === "needs-review") studySession.cardsMarkedNeedsReview++;
    }

    // Mark that user has interacted with this card
    if (currentIndex === flashcards.length - 1) {
      setLastCardInteracted(true);
    }

    // Auto-advance to next card
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        handleNext();
      }
    }, 500);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const csvContent = flashcards
      .map((card, index) => `${index + 1},"${card.question}","${card.answer}"`)
      .join("\n");
    const blob = new Blob([`Number,Question,Answer\n${csvContent}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcards.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-8 overflow-hidden">
      {/* Flashcard Container Wrapper with fixed height */}
      <div className="w-full h-[400px] relative">
        {/* Edit and Sound Icons */}
        <div className="absolute top-4 right-4 flex gap-2 z-20 pointer-events-none">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors pointer-events-auto">
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors pointer-events-auto">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>

        {/* Perspective Container */}
        <div className="perspective-container w-full h-full">
          {/* Flashcard with 3D Flip */}
          <div
            key={currentIndex}
            onClick={handleCardClick}
            className="flip-card w-full h-full cursor-pointer animate-slide-in"
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.6s ease-in-out",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              animation: slideDirection !== "none"
                ? `slideIn${slideDirection === "left" ? "Left" : "Right"} 0.4s ease-out`
                : "none",
            }}
          >
            {/* Front of Card */}
            <div
              className="flip-card-face flip-card-front absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border-2 border-gray-200 hover:shadow-3xl hover:border-blue-300 transition-all duration-300"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="w-full h-full flex items-center justify-center p-12">
                <div className="text-center max-w-3xl">
                  <p
                    className="text-xl leading-relaxed text-gray-800 font-medium"
                    dir={getTextDirection(currentCard.question)}
                    style={{ textAlign: getTextDirection(currentCard.question) === 'rtl' ? 'right' : 'center' }}
                  >
                    {currentCard.question}
                  </p>
                </div>
              </div>
            </div>

            {/* Back of Card */}
            <div
              className="flip-card-face flip-card-back absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-2xl border-2 border-blue-200 hover:shadow-3xl hover:border-blue-400 transition-all duration-300"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="w-full h-full flex items-center justify-center p-12">
                <div className="text-center max-w-3xl">
                  <p
                    className="text-xl leading-relaxed text-gray-800 font-medium"
                    dir={getTextDirection(currentCard.answer)}
                    style={{ textAlign: getTextDirection(currentCard.answer) === 'rtl' ? 'right' : 'center' }}
                  >
                    {currentCard.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Mastery Buttons */}
      {isFlipped && (
        <div className="flex items-center justify-center gap-4 animate-fade-in-up">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardMastery("needs-review");
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95",
              cardMastery.get(currentIndex) === "needs-review"
                ? "bg-red-50 border-red-500 text-red-700 scale-105 shadow-md"
                : "border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500"
            )}
          >
            <ThumbsDown className="w-5 h-5" />
            <span className="font-medium">Needs Review</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardMastery("learning");
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95",
              cardMastery.get(currentIndex) === "learning"
                ? "bg-yellow-50 border-yellow-500 text-yellow-700 scale-105 shadow-md"
                : "border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-500"
            )}
          >
            <BookmarkCheck className="w-5 h-5" />
            <span className="font-medium">Learning</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardMastery("mastered");
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95",
              cardMastery.get(currentIndex) === "mastered"
                ? "bg-green-50 border-green-500 text-green-700 scale-105 shadow-md"
                : "border-green-300 text-green-600 hover:bg-green-50 hover:border-green-500"
            )}
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="font-medium">Mastered</span>
          </button>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Shuffle and Reset */}
        <button
          onClick={handleShuffle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
          title="Shuffle"
        >
          <Shuffle className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
          title="Reset to first card"
        >
          <SkipBack className="w-5 h-5 text-gray-600" />
        </button>

        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={cn(
            "p-3 rounded-full transition-all duration-200 transform",
            currentIndex === 0
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-110 active:scale-95"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Page Counter */}
        <div
          key={`counter-${currentIndex}`}
          className="px-6 py-2 bg-white rounded-full shadow-sm border border-gray-200 transition-all duration-200 animate-pulse-scale"
        >
          <span className="text-gray-700 font-medium">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className={cn(
            "p-3 rounded-full transition-all duration-200 transform",
            currentIndex === flashcards.length - 1
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 active:scale-95 hover:shadow-lg"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Print, Download, Edit */}
        <button
          onClick={handlePrint}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
          title="Print"
        >
          <Printer className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={handleDownload}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
          title="Download"
        >
          <Download className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95" title="Edit">
          <Edit className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Complete Modal */}
      <CompleteModal
        isOpen={showCompleteModal}
        onRestart={handleReset}
        onMarkComplete={handleMarkComplete}
        onCreateNew={onCreateNew}
      />

      <style jsx>{`
        .perspective-container {
          perspective: 1000px;
          -webkit-perspective: 1000px;
        }

        .flip-card {
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          position: relative;
        }

        .flip-card-face {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -moz-backface-visibility: hidden;
          overflow: hidden;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseScale {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }

        .animate-pulse-scale {
          animation: pulseScale 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
