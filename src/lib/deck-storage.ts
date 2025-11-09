import { Deck, Flashcard, DeckProgress, StudySession } from "@/types/deck";

const DECKS_KEY = "flashcard_decks";
const STUDY_SESSIONS_KEY = "study_sessions";

export const deckStorage = {
  // Get all decks for a user
  getDecks(userId: string): Deck[] {
    if (typeof window === "undefined") return [];
    const key = `${DECKS_KEY}_${userId}`;
    const data = localStorage.getItem(key);
    if (!data) return [];

    try {
      const decks = JSON.parse(data);
      // Convert date strings back to Date objects
      return decks.map((deck: any) => ({
        ...deck,
        createdAt: new Date(deck.createdAt),
        lastStudied: deck.lastStudied ? new Date(deck.lastStudied) : undefined,
        flashcards: deck.flashcards.map((card: any) => ({
          ...card,
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
        })),
      }));
    } catch (error) {
      console.error("Error loading decks:", error);
      return [];
    }
  },

  // Save decks for a user
  saveDecks(userId: string, decks: Deck[]): void {
    if (typeof window === "undefined") return;
    const key = `${DECKS_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(decks));
  },

  // Add a new deck
  addDeck(userId: string, deck: Deck): void {
    const decks = this.getDecks(userId);
    decks.push(deck);
    this.saveDecks(userId, decks);
  },

  // Update an existing deck
  updateDeck(userId: string, deckId: string, updates: Partial<Deck>): void {
    const decks = this.getDecks(userId);
    const index = decks.findIndex((d) => d.id === deckId);
    if (index !== -1) {
      decks[index] = { ...decks[index], ...updates };
      this.saveDecks(userId, decks);
    }
  },

  // Delete a deck
  deleteDeck(userId: string, deckId: string): void {
    const decks = this.getDecks(userId);
    const filtered = decks.filter((d) => d.id !== deckId);
    this.saveDecks(userId, filtered);
  },

  // Get a specific deck
  getDeck(userId: string, deckId: string): Deck | null {
    const decks = this.getDecks(userId);
    return decks.find((d) => d.id === deckId) || null;
  },

  // Mark deck as complete
  markDeckComplete(userId: string, deckId: string): void {
    this.updateDeck(userId, deckId, {
      isCompleted: true,
      lastStudied: new Date(),
    });
  },

  // Update card mastery
  updateCardMastery(
    userId: string,
    deckId: string,
    cardId: string,
    mastery: "needs-review" | "learning" | "mastered"
  ): void {
    const deck = this.getDeck(userId, deckId);
    if (!deck) return;

    const cardIndex = deck.flashcards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return;

    deck.flashcards[cardIndex] = {
      ...deck.flashcards[cardIndex],
      mastery,
      lastReviewed: new Date(),
      reviewCount: (deck.flashcards[cardIndex].reviewCount || 0) + 1,
    };

    // Recalculate progress
    deck.progress = this.calculateProgress(deck.flashcards);
    deck.lastStudied = new Date();

    this.updateDeck(userId, deckId, deck);
  },

  // Calculate deck progress
  calculateProgress(flashcards: Flashcard[]): DeckProgress {
    const totalCards = flashcards.length;
    const masteredCards = flashcards.filter((c) => c.mastery === "mastered").length;
    const learningCards = flashcards.filter((c) => c.mastery === "learning").length;
    const needsReviewCards = flashcards.filter((c) => c.mastery === "needs-review").length;
    const completionPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

    return {
      totalCards,
      masteredCards,
      learningCards,
      needsReviewCards,
      completionPercentage,
      studySessions: 0, // Will be updated separately
    };
  },

  // Create a deck from flashcards
  createDeckFromFlashcards(
    userId: string,
    name: string,
    flashcards: Array<{ question: string; answer: string }>,
    description?: string
  ): Deck {
    // Check if a deck with the same name and flashcard count already exists
    const existingDecks = this.getDecks(userId);
    const existingDeck = existingDecks.find(
      (d) => d.name === name && d.flashcards.length === flashcards.length
    );

    // If deck already exists, return it instead of creating a duplicate
    if (existingDeck) {
      return existingDeck;
    }

    const deckId = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const enhancedFlashcards: Flashcard[] = flashcards.map((card, index) => ({
      id: `card_${deckId}_${index}`,
      question: card.question,
      answer: card.answer,
      mastery: undefined,
      lastReviewed: undefined,
      reviewCount: 0,
    }));

    const deck: Deck = {
      id: deckId,
      name,
      description,
      flashcards: enhancedFlashcards,
      createdAt: new Date(),
      isCompleted: false,
      progress: this.calculateProgress(enhancedFlashcards),
    };

    this.addDeck(userId, deck);
    return deck;
  },

  // Study session management
  startStudySession(deckId: string): StudySession {
    return {
      deckId,
      startTime: new Date(),
      cardsReviewed: 0,
      cardsMarkedMastered: 0,
      cardsMarkedNeedsReview: 0,
    };
  },

  endStudySession(userId: string, session: StudySession): void {
    if (typeof window === "undefined") return;

    const completedSession = {
      ...session,
      endTime: new Date(),
    };

    const key = `${STUDY_SESSIONS_KEY}_${userId}`;
    const existing = localStorage.getItem(key);
    const sessions = existing ? JSON.parse(existing) : [];
    sessions.push(completedSession);
    localStorage.setItem(key, JSON.stringify(sessions));

    // Update deck study session count
    const deck = this.getDeck(userId, session.deckId);
    if (deck) {
      deck.progress.studySessions = (deck.progress.studySessions || 0) + 1;
      this.updateDeck(userId, session.deckId, deck);
    }
  },
};
