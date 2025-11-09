"use client";

import {
  ClaudeAI,
  Google,
  OpenAI,
} from "@aliimam/logos";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Cta1 = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  return (
    <section className="relative py-16 sm:py-24">
      <div className="container">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 border-x [mask-image:linear-gradient(black,transparent)]"></div>
          <div className="absolute inset-y-0 left-1/2 w-[1200px] -translate-x-1/2">
            <svg
              className="pointer-events-none absolute inset-0 text-black/10 [mask-composite:intersect] [mask-image:linear-gradient(black,transparent),radial-gradient(black,transparent)] dark:text-white/10"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern
                  id="grid-pattern"
                  x="-1"
                  y="-1"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="1"
                  ></path>
                </pattern>
              </defs>
              <rect fill="url(#grid-pattern)" width="100%" height="100%"></rect>
            </svg>
          </div>
        </div>
        <div className="relative flex flex-col items-center px-4 text-center">
          {/* Headline and Description */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight max-w-4xl">
            Transform PDFs into Interactive Flashcards
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl">
            Leverage AI to automatically convert your PDF documents into effective study materials. Learn smarter, not harder.
          </p>

          {/* Call-to-Action Button */}
          <div className="mb-12 sm:mb-16">
            <Button size="lg" onClick={handleGetStarted} className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-shadow">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Company Logos */}
          <div className="w-full max-w-3xl px-4">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-6 sm:gap-x-8 sm:gap-y-8 md:gap-x-12 opacity-60 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center min-w-[90px]">
                <OpenAI type="wordmark" size={90} />
              </div>
              <div className="flex items-center justify-center min-w-[90px]">
                <ClaudeAI type="wordmark" size={90} />
              </div>
              <div className="flex items-center justify-center min-w-[90px]">
                <Google type="wordmark" size={80} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Cta1 };
