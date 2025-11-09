// Alternative PDF processing utilities for deployment environments

export async function extractTextFromPDF(uint8Array: Uint8Array): Promise<string> {
  console.log('🔄 Starting PDF text extraction...');
  let pdfjsLib: any;
  
  try {
    // Try loading PDF.js with different approaches
    try {
      console.log('📚 Attempting to load legacy PDF.js build...');
      pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
      console.log('✅ Using legacy PDF.js build');
    } catch (legacyError) {
      console.log('⚠️ Legacy build failed, trying standard build...');
      console.log('Legacy error:', legacyError.message);
      try {
        pdfjsLib = require('pdfjs-dist');
        console.log('✅ Using standard PDF.js build');
      } catch (standardError) {
        console.error('❌ Both PDF.js builds failed:', standardError.message);
        throw new Error(`PDF.js library could not be loaded: ${standardError.message}`);
      }
    }

    // Configure for Node.js environment
    console.log('⚙️ Configuring PDF.js for Node.js environment...');
    if (typeof window === 'undefined') {
      // Ensure we're in Node.js environment
      try {
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = null;
          pdfjsLib.GlobalWorkerOptions.workerPort = null;
          console.log('✅ PDF.js worker disabled for Node.js');
        }
      } catch (configError) {
        console.warn('⚠️ Could not configure PDF.js worker options:', configError.message);
      }
    }

    console.log('📄 Loading PDF document...');
    console.log('📊 PDF size:', uint8Array.length, 'bytes');
    
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      verbosity: 0, // Reduce logging
      maxImageSize: 1024 * 1024, // 1MB max image size
      disableFontFace: true, // Disable font loading for server
      disableRange: true, // Disable range requests
      disableStream: true, // Disable streaming
      // Additional compatibility options
      standardFontDataUrl: null,
      ignoreErrors: true,
      worker: null,
    });

    console.log('⏳ Waiting for PDF to load (30s timeout)...');
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF loading timeout after 30 seconds')), 30000)
      )
    ]);

    const numPages = (pdfDoc as any).numPages;
    console.log('✅ PDF loaded successfully, pages:', numPages);

    let text = '';

    // Limit pages to prevent memory issues
    const maxPages = Math.min(numPages, 50);
    console.log(`Extracting text from ${maxPages} pages (out of ${numPages})...`);

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await (pdfDoc as any).getPage(pageNum);
        const textContent = await Promise.race([
          page.getTextContent(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Page ${pageNum} extraction timeout`)), 10000)
          )
        ]);
        
        const pageText = (textContent as any).items
          .map((item: any) => item.str || '')
          .join(' ');
        text += pageText + '\n';
        
        // Add some spacing between pages
        if (pageNum < maxPages) {
          text += '\n---\n';
        }
        
        console.log(`Page ${pageNum}/${maxPages} extracted (${pageText.length} chars)`);
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        // Continue with other pages
        continue;
      }
    }

    console.log('Text extraction complete. Total length:', text.length, 'characters');
    return text;

  } catch (error) {
    console.error('❌ PDF.js extraction failed:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
    
    // Provide more specific error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('PDF.js library could not be loaded')) {
      throw new Error('PDF processing is not available on this server. The PDF.js library could not be loaded.');
    } else if (errorMessage.includes('timeout')) {
      throw new Error('PDF processing timed out. The PDF file may be too large or complex.');
    } else if (errorMessage.includes('Invalid PDF')) {
      throw new Error('The uploaded file is not a valid PDF document.');
    } else {
      throw new Error(`PDF text extraction failed: ${errorMessage}`);
    }
  }
}

// Utility function to validate PDF data
export function validatePDFData(fileData: string): boolean {
  try {
    const buffer = Buffer.from(fileData, 'base64');
    const header = buffer.subarray(0, 4).toString();
    return header === '%PDF';
  } catch {
    return false;
  }
}

// Utility function to get PDF info without full text extraction
export async function getPDFInfo(uint8Array: Uint8Array): Promise<{ pages: number; size: number }> {
  let pdfjsLib: any;
  
  try {
    pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js') || require('pdfjs-dist');
    
    if (typeof window === 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = null;
    }

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      verbosity: 0,
    });

    const pdfDoc = await loadingTask.promise;
    
    return {
      pages: pdfDoc.numPages,
      size: uint8Array.length,
    };
  } catch (error) {
    console.error('Failed to get PDF info:', error);
    return {
      pages: 0,
      size: uint8Array.length,
    };
  }
}