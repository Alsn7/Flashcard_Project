// Alternative PDF processing utilities for deployment environments

export async function extractTextFromPDF(uint8Array: Uint8Array): Promise<string> {
  let pdfjsLib: any;
  
  try {
    // Try loading PDF.js with different approaches
    try {
      pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
      console.log('Using legacy PDF.js build');
    } catch (legacyError) {
      console.log('Legacy build failed, trying standard build');
      pdfjsLib = require('pdfjs-dist');
      console.log('Using standard PDF.js build');
    }

    // Configure for Node.js environment
    if (typeof window === 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = null;
      pdfjsLib.GlobalWorkerOptions.workerPort = null;
      
      // Additional Node.js specific settings
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = false;
      }
    }

    console.log('Loading PDF document...');
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      verbosity: 0,
      maxImageSize: 1024 * 1024,
      disableFontFace: true,
      disableRange: true,
      disableStream: true,
      // Additional compatibility options
      standardFontDataUrl: null,
      ignoreErrors: true,
    });

    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF loading timeout')), 30000)
      )
    ]);

    console.log('PDF loaded successfully, pages:', (pdfDoc as any).numPages);

    let text = '';
    const numPages = (pdfDoc as any).numPages;

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
    console.error('PDF.js extraction failed:', error);
    
    // Fallback: Return a message indicating the PDF couldn't be processed
    throw new Error(`PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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