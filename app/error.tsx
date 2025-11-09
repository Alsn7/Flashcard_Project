'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Error Icon and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <AlertTriangle className="h-16 w-16 text-destructive" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Something Went Wrong
          </h1>

          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>
        </div>

        {/* Error Details (Development Mode) */}
        {process.env.NODE_ENV === 'development' && (
          <Alert variant="destructive" className="text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Details (Development Only)</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <div className="font-mono text-sm break-all">
                <strong>Message:</strong> {error.message}
              </div>
              {error.digest && (
                <div className="font-mono text-sm">
                  <strong>Error ID:</strong> {error.digest}
                </div>
              )}
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-48 bg-background/50 p-2 rounded">
                    {error.stack}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={reset}
            size="lg"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Button
            onClick={() => router.push('/')}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please try:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Refreshing the page</li>
            <li>• Clearing your browser cache</li>
            <li>• Checking your internet connection</li>
            <li>• Trying again in a few minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
