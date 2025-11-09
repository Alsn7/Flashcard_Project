"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFileUpload } from "@/hooks/use-file-upload";
import { FileText, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernUploadZoneProps {
  onFileSelect?: (file: File) => void;
  maxFileSize?: number;
  acceptedFormats?: string[];
  isLoading?: boolean;
}

export default function ModernUploadZone({
  onFileSelect,
  maxFileSize = 50,
  acceptedFormats = [".pdf"],
  isLoading = false,
}: ModernUploadZoneProps) {
  const {
    fileName,
    error,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useFileUpload({
    onUpload: onFileSelect,
    maxFileSize,
    acceptedFormats,
  });

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type === "application/pdf") {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fakeEvent = {
          target: {
            files: dataTransfer.files,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(fakeEvent);
      }
    },
    [handleFileChange]
  );

  if (fileName) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="group relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-background p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-6 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{fileName}</p>
              <p className="text-xs text-muted-foreground">PDF Document</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 hover:bg-transparent group/delete"
              onClick={handleRemove}
              disabled={isLoading}
            >
              <Trash2 className="size-4 group-hover/delete:text-red-500" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div
        className={cn(
          "group relative grid cursor-pointer gap-6 rounded-lg border-2 border-dashed p-16 text-center hover:border-muted-foreground/50 min-h-[400px]",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isLoading && "pointer-events-none opacity-50"
        )}
        onClick={handleThumbnailClick}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-full border border-dashed border-muted-foreground/25">
            <Upload className="size-10 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              <span className="hidden sm:inline">Drag and drop or </span>
              <span className="text-primary">click to upload</span>
            </p>
            <p className="text-sm text-muted-foreground">
              PDF files only • Max {maxFileSize}MB
            </p>
          </div>
        </div>
        <Input
          id="file-upload"
          name="file-upload"
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(",")}
          onChange={handleFileChange}
          className="sr-only"
          disabled={isLoading}
          aria-label="File upload input"
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
