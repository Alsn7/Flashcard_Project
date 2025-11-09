"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Cta1 } from "@/components/ui/call-to-action-01";
import { useRouter } from "next/navigation";

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

const Hero = ({
  title = "Transform PDFs into Interactive Flashcards",
  subtitle = "Leverage AI to automatically convert your PDF documents into effective study materials. Learn smarter, not harder.",
  ctaText = "Get Started",
  onCtaClick,
}: HeroProps) => {
  const router = useRouter();

  const handleCtaClick = () => {
    console.log("🔘 Button clicked!");
    if (onCtaClick) {
      onCtaClick();
    } else {
      router.push("/dashboard");
    }
  };
  return (
    <div className="relative w-full min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] bg-background flex items-center justify-center overflow-hidden py-8 sm:py-12">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        {/* Call to Action Component */}
        <Cta1 />
      </div>
    </div>
  );
};

export default Hero;
