import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Generator } from "@/components/Generator";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { PremiumModal } from "@/components/PremiumModal";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Toaster } from "@/components/ui/toaster";

export type GeneratedContent = {
  summary: string;
  flashcards: Array<{ question: string; answer: string }>;
  mcqs: Array<{ question: string; options: string[]; correctAnswer: number }>;
  trueFalse: Array<{ statement: string; answer: boolean }>;
  definitions: Array<{ term: string; definition: string }>;
  kidsExplanation: string;
  professionalExplanation: string;
};

const Index = () => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Ad */}
      <AdPlaceholder position="header" />
      
      <div className="container mx-auto px-4 py-8">
        <Hero onUpgradeClick={() => setIsPremiumModalOpen(true)} />
        
        <div className="grid lg:grid-cols-12 gap-8 mt-12">
          {/* Sidebar Ad */}
          <div className="hidden lg:block lg:col-span-2">
            <AdPlaceholder position="sidebar" />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-10">
            <Generator 
              onGenerate={setGeneratedContent}
              onUpgradeClick={() => setIsPremiumModalOpen(true)}
            />
            
            {generatedContent && (
              <div className="mt-8 animate-slide-up">
                <ResultsDisplay content={generatedContent} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer Ad */}
      <AdPlaceholder position="footer" />
      
      <PremiumModal 
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
      
      <Toaster />
    </div>
  );
};

export default Index;
