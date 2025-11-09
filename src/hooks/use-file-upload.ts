import { useRef, useState, useCallback } from "react";

interface UseFileUploadOptions {
  onUpload?: (file: File) => void;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
}

export function useFileUpload({
  onUpload,
  maxFileSize = 50,
  acceptedFormats = [".pdf"],
}: UseFileUploadOptions = {}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    setError(null);

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      setError(
        `Invalid file format. Accepted formats: ${acceptedFormats.join(", ")}`
      );
      return false;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File size exceeds ${maxFileSize}MB limit`);
      return false;
    }

    return true;
  };

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!validateFile(file)) {
        return;
      }

      setFileName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
      onUpload?.(file);
    },
    [onUpload, maxFileSize, acceptedFormats]
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return {
    previewUrl,
    fileName,
    error,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  };
}
