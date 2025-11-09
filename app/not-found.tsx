'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileQuestion, Home, ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Icon and 404 Text */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <FileQuestion className="h-32 w-32 text-muted-foreground/50" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-primary/20">404</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Page Not Found
          </h1>

          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full">
              <BookOpen className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for something specific? Try these links:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/dashboard"
              className="text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Upload & Generate Flashcards
            </Link>
            <Link
              href="/profile"
              className="text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Your Profile
            </Link>
            <Link
              href="/settings"
              className="text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
