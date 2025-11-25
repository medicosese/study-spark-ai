import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { GeneratedContent } from "@/pages/Index";
import { generateStudyMaterials } from "@/lib/api";

interface GeneratorProps {
  onGenerate: (content: GeneratedContent) => void;
  onUpgradeClick: () => void;
}

const contentOptions = [
  { id: "summary", label: "Summary", icon: "📝" },
  { id: "flashcards", label: "Flashcards", icon: "🗂️" },
  { id: "mcqs", label: "MCQs", icon: "✅" },
  { id: "trueFalse", label: "True/False", icon: "⚖️" },
  { id: "definitions", label: "Key Definitions", icon: "📚" },
  { id: "kidsExplanation", label: "Kids Mode", icon: "🎨" },
  { id: "professionalExplanation", label: "Professional", icon: "💼" },
];

export const Generator = ({ onGenerate, onUpgradeClick }: GeneratorProps) => {
  const [text, setText] = useState("");
  const [difficulty, setDifficulty] = useState("university");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["summary", "flashcards", "mcqs"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Text Required",
        description: "Please paste some text to generate study materials.",
        variant: "destructive",
      });
      return;
    }

    if (selectedOptions.length === 0) {
      toast({
        title: "Select Options",
        description: "Please select at least one content type to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const content = await generateStudyMaterials({
        text,
        difficulty,
        options: selectedOptions,
      });

      onGenerate(content);
      
      toast({
        title: "Success!",
        description: "Your study materials have been generated.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-8 bg-gradient-card shadow-md border-0">
      <div className="space-y-6">
        {/* Difficulty Selector */}
        <div className="space-y-2">
          <Label htmlFor="difficulty" className="text-lg font-semibold text-foreground">
            Difficulty Level
          </Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="difficulty" className="w-full md:w-64 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kids">👶 Kids (Easy)</SelectItem>
              <SelectItem value="highschool">🎓 High School</SelectItem>
              <SelectItem value="university">🎯 University</SelectItem>
              <SelectItem value="professional">💼 Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="text-input" className="text-lg font-semibold text-foreground">
            Your Text
          </Label>
          <Textarea
            id="text-input"
            placeholder="Paste your notes, article, chapter, or any text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[250px] bg-background resize-none text-base"
          />
          <p className="text-sm text-muted-foreground">
            {text.length} characters
          </p>
        </div>

        {/* Content Options */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-foreground">
            What to Generate
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {contentOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 p-4 rounded-lg bg-background hover:bg-muted transition-colors cursor-pointer"
                onClick={() => handleOptionToggle(option.id)}
              >
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={() => handleOptionToggle(option.id)}
                />
                <Label
                  htmlFor={option.id}
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <span className="text-xl">{option.icon}</span>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="lg"
          className="w-full bg-gradient-button text-primary-foreground hover:opacity-90 shadow-md font-semibold text-lg py-6 rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Study Materials
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
