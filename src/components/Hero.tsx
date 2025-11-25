import { Sparkles, Crown } from "lucide-react";
import { Button } from "./ui/button";

interface HeroProps {
  onUpgradeClick: () => void;
}

export const Hero = ({ onUpgradeClick }: HeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 text-center shadow-lg animate-fade-in">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Universal Study Material Generator
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
          Paste your text. Get instant study materials.
          <br />
          <span className="text-lg">Perfect for students, professionals, and lifelong learners.</span>
        </p>
        
        <Button 
          onClick={onUpgradeClick}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 shadow-glow font-semibold text-lg px-8 py-6 rounded-full transition-all hover:scale-105"
        >
          <Crown className="w-5 h-5 mr-2" />
          Upgrade to Premium
        </Button>
      </div>
    </div>
  );
};
