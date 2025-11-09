import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Flashcard {
  question: string;
  answer: string;
}

export interface FlashcardPreferences {
  frontTextLength?: "Short" | "Medium" | "Long";
  backTextLength?: "Short" | "Medium" | "Long";
  language?: string;
  flashcardType?: string;
}

function getLengthGuidance(length: "Short" | "Medium" | "Long", isQuestion: boolean = false): string {
  if (isQuestion) {
    // Front/Question guidance
    switch (length) {
      case "Short":
        return "very brief, just the topic name or 2-3 words (e.g., 'Ionic Bonding')";
      case "Medium":
        return "concise, one clear sentence describing what to explain (e.g., 'Describe the process of ionic bonding')";
      case "Long":
        return "detailed, multiple sentences with specific aspects to address (e.g., 'Describe the process of ionic bonding and how it relates to the formation of positive and negative ions. Explain the factors that contribute to the strength of ionic bonding.')";
      default:
        return "concise, one clear sentence";
    }
  } else {
    // Back/Answer guidance
    switch (length) {
      case "Short":
        return "very concise, key terms or brief phrase only (e.g., 'Electrostatic attraction, oppositely charged ions, electron transfer')";
      case "Medium":
        return "moderately detailed, 1-2 sentences with main explanation (e.g., 'Ionic bonding occurs when metals lose electrons to form positive ions, and non-metals gain them, forming negative ions, leading to attraction.')";
      case "Long":
        return "comprehensive, 3-4 sentences with detailed explanation including factors and effects (e.g., 'Ionic bonding involves metal atoms losing electrons to form positive ions and non-metal atoms gaining electrons to form negative ions. The strength of ionic bonding is influenced by the size and charge of the ions involved. Smaller and/or higher charged ions result in stronger ionic bonding, leading to higher melting points.')";
      default:
        return "moderately detailed, 1-2 sentences";
    }
  }
}

export async function generateFlashcardsFromText(
  text: string,
  count: number | "auto" = 10,
  preferences?: FlashcardPreferences
): Promise<Flashcard[]> {
  try {
    // Build length guidance based on preferences
    const frontGuidance = preferences?.frontTextLength
      ? `Questions should be ${getLengthGuidance(preferences.frontTextLength, true)}.`
      : "";
    const backGuidance = preferences?.backTextLength
      ? `Answers should be ${getLengthGuidance(preferences.backTextLength, false)}.`
      : "";
    const lengthInstructions = (frontGuidance || backGuidance)
      ? `\n\nIMPORTANT LENGTH REQUIREMENTS:\n${frontGuidance}\n${backGuidance}`
      : "";

    // Language instruction
    const languageInstruction = preferences?.language && preferences.language !== "Auto Detect"
      ? `Generate all flashcards in ${preferences.language}.`
      : "Detect the language of the text and generate flashcards in the SAME LANGUAGE.";

    // Flashcard type instruction
    const typeInstruction = preferences?.flashcardType === "Cloze"
      ? " Use cloze deletion format where appropriate (e.g., 'The {{c1::mitochondria}} is the powerhouse of the cell')."
      : "";

    // Build the user prompt based on count mode
    let userPrompt: string;
    if (count === "auto") {
      userPrompt = `Analyze the following text and generate an appropriate number of flashcards based on the content length and key concepts (minimum 5, maximum 50). ${languageInstruction}${typeInstruction}${lengthInstructions} Return ONLY a valid JSON object with a "flashcards" array containing objects with "question" and "answer" fields. Format: {"flashcards": [{"question": "...", "answer": "..."}]}\n\nText:\n${text}`;
    } else {
      userPrompt = `Generate ${count} flashcards from the following text. ${languageInstruction}${typeInstruction}${lengthInstructions} Return ONLY a valid JSON object with a "flashcards" array containing objects with "question" and "answer" fields. Format: {"flashcards": [{"question": "...", "answer": "..."}]}\n\nText:\n${text}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates educational flashcards from text content. Generate clear, concise flashcards that help students learn and retain information. Each flashcard should have a question and a detailed answer. IMPORTANT: Always generate flashcards in the SAME LANGUAGE as the input text. If the text is in Arabic, generate Arabic flashcards. If it's in English, generate English flashcards. Preserve the original language of the content.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);

    // Handle different response formats
    const flashcards = parsed.flashcards || parsed.cards || [];

    if (!Array.isArray(flashcards)) {
      console.error("Unexpected response format:", parsed);
      throw new Error("Invalid response format from OpenAI. Expected an array of flashcards.");
    }

    // If count is "auto", return all generated flashcards; otherwise limit to count
    const result = count === "auto" ? flashcards : flashcards.slice(0, count);

    // Log warning if fewer cards were generated than requested
    if (count !== "auto" && result.length < count) {
      console.warn(`Requested ${count} flashcards but only ${result.length} were generated. The content may not be sufficient for ${count} cards.`);
    }

    return result;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error(
      `Failed to generate flashcards: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function generateFlashcardsFromPDF(
  pdfText: string,
  count: number | "auto" = 10,
  preferences?: FlashcardPreferences
): Promise<Flashcard[]> {
  return generateFlashcardsFromText(pdfText, count, preferences);
}
