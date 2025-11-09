"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Brain, Zap, Clock, LineChart } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({
  icon,
  title = "Feature Title",
  description = "Feature description goes here",
}: FeatureCardProps) => {
  return (
    <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 h-full">
      <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
        <div className="p-2.5 sm:p-3 bg-primary/10 rounded-full">{icon}</div>
        <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
        <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
};

interface FeaturesGridProps {
  features?: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}

const defaultFeatures = [
  {
    icon: <Brain className="w-6 h-6 text-primary" />,
    title: "AI-Powered Extraction",
    description:
      "Advanced machine learning algorithms ensure accurate content extraction from your PDFs",
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "Instant Conversion",
    description: "Transform your PDFs into interactive flashcards in seconds",
  },
  {
    icon: <Clock className="w-6 h-6 text-primary" />,
    title: "Quick Study Sessions",
    description:
      "Optimize your learning with efficiently organized study materials",
  },
  {
    icon: <LineChart className="w-6 h-6 text-primary" />,
    title: "Progress Tracking",
    description:
      "Monitor your learning journey with detailed analytics and insights",
  },
];

const FeaturesGrid = ({ features = defaultFeatures }: FeaturesGridProps) => {
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Powerful Features</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Transform your learning experience with our cutting-edge PDF to
            flashcard conversion tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div key={index} className="h-full">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
