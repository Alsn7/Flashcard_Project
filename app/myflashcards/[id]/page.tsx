"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { deckStorage } from "@/lib/deck-storage";
import { Deck } from "@/types/deck";
import { FlashcardViewer } from "@/components/flashcard/FlashcardViewer";
import { ArrowLeft } from "lucide-react";

export default function DeckViewPage() {
  const params = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) {
      router.push("/");
      return;
    }

    setUserId(id);

    if (params.id) {
      const loadedDeck = deckStorage.getDeck(id, params.id as string);
      if (loadedDeck) {
        setDeck(loadedDeck);
      } else {
        router.push("/myflashcards");
      }
    }
  }, [params.id, router]);

  if (!deck) {
    return null;
  }

  // Convert deck flashcards to the format expected by FlashcardViewer
  const flashcards = deck.flashcards.map((card) => ({
    question: card.question,
    answer: card.answer,
  }));

  return (
    <div className="w-full min-h-screen">
      {/* Header with back button */}
      <div className="w-full border-b border-gray-200 bg-white">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
          <button
            onClick={() => router.push("/myflashcards")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to My Flashcards</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4">
            {deck.name}
          </h1>
          {deck.description && (
            <p className="text-gray-600 mt-2">{deck.description}</p>
          )}
        </div>
      </div>

      {/* Flashcard Viewer */}
      <div className="w-full">
        <FlashcardViewer
          flashcards={flashcards}
          deckName={deck.name}
          existingDeckId={deck.id}
        />
      </div>
    </div>
  );
}