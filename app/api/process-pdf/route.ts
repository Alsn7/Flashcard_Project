import { NextRequest, NextResponse } from "next/server";
import { generateFlashcardsFromPDF } from "@/lib/openai";
import { extractTextFromPDF, validatePDFData, getPDFInfo } from "@/lib/pdf-processor";

// Force Node.js runtime for file processing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Set max duration for PDF processing (important for larger files)
export const maxDuration = 60;

// PDF processing is now handled by the pdf-processor utility

export async function POST(request: NextRequest) {
  console.log('=== PDF Processing Request Started ===');
  
  // Add timeout wrapper for the entire process
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('PDF processing timeout')), 50000) // 50 seconds
  );

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

    // Validate PDF data format
    if (!validatePDFData(fileData)) {
      console.error('ERROR: Invalid PDF data format');
      return NextResponse.json(
        { error: "Invalid PDF file format" },
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

    // Get PDF info first (lightweight operation)
    const pdfInfo = await getPDFInfo(uint8Array);
    console.log('PDF info:', pdfInfo);

    if (pdfInfo.pages === 0) {
      console.error('ERROR: Could not read PDF structure');
      return NextResponse.json(
        { error: "Could not read PDF file" },
        { status: 400 }
      );
    }

    // Extract text using the robust PDF processor
    console.log('🔄 Starting PDF text extraction...');
    let text: string;
    
    try {
      text = await extractTextFromPDF(uint8Array);
      console.log('✅ PDF text extraction completed, text length:', text.length);
    } catch (pdfError) {
      console.error('❌ PDF text extraction failed:', pdfError);
      
      // Return a more specific error based on the PDF processing failure
      const errorMessage = pdfError instanceof Error ? pdfError.message : 'Unknown PDF processing error';
      
      return NextResponse.json(
        {
          error: "PDF Processing Failed",
          message: errorMessage,
          details: {
            fileName,
            pdfSize: uint8Array.length,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }

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
        pages: pdfInfo.pages,
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
