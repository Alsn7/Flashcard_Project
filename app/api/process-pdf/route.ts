import { NextRequest, NextResponse } from "next/server";
import { generateFlashcardsFromPDF } from "@/lib/openai";

// Force Node.js runtime for file processing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Set max duration for PDF processing (important for larger files)
export const maxDuration = 60;

// Import pdfjs for Node.js environment
// Using legacy build for better Node.js compatibility
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// Configure PDF.js to disable worker in Node.js environment
// Workers aren't needed for server-side text extraction
if (typeof window === 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = null;
}

export async function POST(request: NextRequest) {
  console.log('=== PDF Processing Request Started ===');
  try {
    const body = await request.json();
    const { fileData, fileName, count: countParam, preferences, flashcardType, language, visibility } = body;

    console.log('Request body:', { fileName, countParam, flashcardType, language });

    const count = countParam === "auto" ? "auto" : (parseInt(countParam) || 10);

    if (!fileData) {
      console.error('ERROR: No file data provided');
      return NextResponse.json(
        { error: "No file data provided" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('ERROR: OpenAI API key not configured');
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Process the PDF data directly
    console.log('Processing PDF file:', fileName);

    // Convert base64 to Uint8Array
    console.log('Converting PDF to buffer...');
    const buffer = Buffer.from(fileData, 'base64');
    const uint8Array = new Uint8Array(buffer);
    console.log('PDF buffer size:', uint8Array.length, 'bytes');

    // Extract text from PDF using pdfjs
    // Disable worker for Node.js environment
    console.log('Loading PDF document...');
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    const pdfDoc = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdfDoc.numPages);

    let text = '';
    const numPages = pdfDoc.numPages;

    // Extract text from each page
    console.log('Extracting text from', numPages, 'pages...');
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      text += pageText + '\n';
    }
    console.log('Text extraction complete. Total length:', text.length, 'characters');

    if (!text || text.trim().length === 0) {
      console.error('ERROR: No text extracted from PDF');
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    // Generate flashcards from extracted text
    console.log('Generating flashcards with OpenAI...');
    const enhancedPreferences = {
      ...preferences,
      language,
      flashcardType,
    };
    const flashcards = await generateFlashcardsFromPDF(text, count, enhancedPreferences);
    console.log('Generated', flashcards.length, 'flashcards successfully');

    console.log('=== PDF Processing Request Completed Successfully ===');
    return NextResponse.json({
      success: true,
      flashcards,
      count: flashcards.length,
      pdfInfo: {
        pages: numPages,
        textLength: text.length,
      },
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}
