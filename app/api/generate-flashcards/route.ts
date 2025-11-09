import { NextRequest, NextResponse } from "next/server";
import { generateFlashcardsFromText } from "@/lib/openai";

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, count = 10 } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const flashcards = await generateFlashcardsFromText(text, count);

    return NextResponse.json({
      success: true,
      flashcards,
      count: flashcards.length,
    });
  } catch (error) {
    console.error("Error in generate-flashcards API:", error);
    return NextResponse.json(
      {
        error: "Failed to generate flashcards",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
