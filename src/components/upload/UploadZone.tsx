import React, { useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect?: (file: File) => void;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  isLoading?: boolean;
}

const UploadZone = ({
  onFileSelect = () => {},
  maxFileSize = 10, // 10MB default
  acceptedFormats = [".pdf"],
  isLoading = false,
}: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File) => {
    setError(null);

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      setError(
        `Invalid file format. Accepted formats: ${acceptedFormats.join(", ")}`,
      );
      return false;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File size exceeds ${maxFileSize}MB limit`);
      return false;
    }

    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [maxFileSize, acceptedFormats, onFileSelect],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [maxFileSize, acceptedFormats, onFileSelect],
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  return (
    <Card className="w-full max-w-[800px] min-h-[200px] h-[250px] sm:h-[300px] mx-auto bg-white dark:bg-gray-800">
      <div
        className={cn(
          "w-full h-full rounded-lg border-2 border-dashed p-4 sm:p-6 md:p-8",
          "flex flex-col items-center justify-center gap-3 sm:gap-4",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300",
          isLoading && "opacity-50 cursor-not-allowed",
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
            <div className="flex items-center gap-2 p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg max-w-full">
              <FileIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-[300px]">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-8 w-8 flex-shrink-0"
                onClick={handleRemoveFile}
                disabled={isLoading}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <UploadIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            <div className="text-center px-2">
              <p className="text-base sm:text-lg font-medium">
                <span className="hidden sm:inline">Drag and drop your PDF here, or </span>
                <label className="text-primary cursor-pointer hover:underline">
                  <span className="sm:hidden">Tap to </span>browse
                  <input
                    type="file"
                    className="hidden"
                    accept={acceptedFormats.join(",")}
                    onChange={handleFileSelect}
                    disabled={isLoading}
                  />
                </label>
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Maximum file size: {maxFileSize}MB
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Supported formats: {acceptedFormats.join(", ")}
              </p>
            </div>
          </>
        )}
        {error && <p className="text-xs sm:text-sm text-red-500 mt-2 px-2 text-center">{error}</p>}
      </div>
    </Card>
  );
};

export default UploadZone;
