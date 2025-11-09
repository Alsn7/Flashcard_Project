"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import ModernUploadZone from "../upload/ModernUploadZone";
import { FlashcardOptionsModal, FlashcardOptions } from "../upload/FlashcardOptionsModal";
import { GeneratingModal } from "../upload/GeneratingModal";
import { FlashcardViewer } from "../flashcard/FlashcardViewer";

export function Dashboard() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [uploadKey, setUploadKey] = useState(0); // Key to force upload zone reset

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowOptionsModal(true);
    setError(null);
    setFlashcards([]);
  };

  const handleResetDashboard = () => {
    setFlashcards([]);
    setError(null);
    setSelectedFile(null);
    setIsProcessing(false);
    setShowOptionsModal(false);
    setUploadKey(prev => prev + 1); // Change key to force remount

    // Scroll to top smoothly to show upload zone
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateWithOptions = async (options: FlashcardOptions) => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setShowOptionsModal(false);
    setError(null);

    try {
      // Upload file using FormData
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      console.log('File uploaded successfully:', uploadResult.fileName);

      // Send file data to API for processing
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: uploadResult.fileData,
          fileName: uploadResult.fileName,
          count: options.maxFlashcards === "auto" ? "auto" : String(options.maxFlashcards),
          preferences: {
            frontTextLength: options.frontTextLength,
            backTextLength: options.backTextLength,
          },
          flashcardType: options.flashcardType,
          language: options.language,
          visibility: options.visibility,
        }),
      });

      // Handle 413 Payload Too Large specifically
      if (response.status === 413) {
        throw new Error("PDF file is too large. Please use a file smaller than 50MB or try a PDF with fewer pages.");
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);

        throw new Error("Server returned an invalid response. Check console for details.");
      }

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error details:", data);
        throw new Error(data.error || data.message || "Failed to process PDF");
      }

      setFlashcards(data.flashcards || []);
      console.log(`Generated ${data.count} flashcards from ${data.pdfInfo?.pages} pages`);

      // Check if fewer cards were generated than requested
      const requestedCount = options.maxFlashcards === "auto" ? null : options.maxFlashcards;
      if (requestedCount && data.count < requestedCount) {
        setError(`Note: Only ${data.count} flashcards were generated instead of ${requestedCount}. The PDF content may not be sufficient for more cards.`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Full error details:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-7xl",
        "min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]",
      )}
      style={{ 
        marginLeft: 'auto', 
        marginRight: 'auto',
        paddingRight: 'calc(100vw - 100%)'
      }}
    >
      <DashboardContent
        onFileSelect={handleFileSelect}
        isProcessing={isProcessing}
        flashcards={flashcards}
        error={error}
        onReset={handleResetDashboard}
        uploadKey={uploadKey}
        fileName={selectedFile?.name || null}
      />
      <FlashcardOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        onGenerate={handleGenerateWithOptions}
        fileName={selectedFile?.name}
      />
      <GeneratingModal isOpen={isProcessing} />
    </div>
  );
}

const DashboardContent = ({
  onFileSelect,
  isProcessing,
  flashcards,
  error,
  onReset,
  uploadKey,
  fileName,
}: {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  flashcards: any[];
  error: string | null;
  onReset: () => void;
  uploadKey: number;
  fileName: string | null;
}) => {
  // Extract filename without extension for deck name
  const deckName = fileName ? fileName.replace(/\.[^/.]+$/, '') : undefined;

  return (
    <div className="block w-full">
      <div className="p-4 sm:p-6 md:p-10 w-full h-full overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-xl sm:text-2xl font-bold">Upload PDF</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Upload your PDF to convert it into flashcards using AI
          </p>
          <ModernUploadZone key={uploadKey} onFileSelect={onFileSelect} isLoading={isProcessing} />

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {flashcards.length > 0 && (
            <FlashcardViewer flashcards={flashcards} deckName={deckName} onCreateNew={onReset} />
          )}
        </div>
      </div>
    </div>
  );
};