import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if essential environment variables are present
    const requiredEnvVars = ['OPENAI_API_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: `Missing environment variables: ${missingVars.join(', ')}`,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Test PDF.js availability
    let pdfJsStatus = 'unknown';
    try {
      const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js') || require('pdfjs-dist');
      pdfJsStatus = 'available';
    } catch (error) {
      pdfJsStatus = 'unavailable';
    }

    return NextResponse.json({
      status: 'healthy',
      services: {
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
        pdfjs: pdfJsStatus,
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}