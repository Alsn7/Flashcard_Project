export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  mastery?: "needs-review" | "learning" | "mastered";
  lastReviewed?: Date;
  reviewCount?: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  flashcards: Flashcard[];
  createdAt: Date;
  lastStudied?: Date;
  isCompleted?: boolean;
  progress: DeckProgress;
}

export interface DeckProgress {
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  needsReviewCards: number;
  completionPercentage: number;
  studySessions: number;
  totalTimeSpent?: number; // in minutes
}

export interface StudySession {
  deckId: string;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  cardsMarkedMastered: number;
  cardsMarkedNeedsReview: number;
}
