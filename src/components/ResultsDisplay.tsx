import { useState } from "react";
import { Copy, Download, ChevronDown, ChevronUp, Check, FileDown } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedContent } from "@/types/studyMaterials";
import {
  downloadSummaryPDF,
  downloadFlashcardsPDF,
  downloadMCQsPDF,
  downloadTrueFalsePDF,
  downloadDefinitionsPDF,
  downloadExplanationPDF,
  downloadAllContentPDF
} from "@/lib/pdfGenerator";

interface ResultsDisplayProps {
  content: GeneratedContent;
  difficulty?: string;
}

type SectionKey = keyof GeneratedContent;

const sections: Array<{ key: SectionKey; title: string; icon: string }> = [
  { key: "summary", title: "Summary", icon: "📝" },
  { key: "flashcards", title: "Flashcards", icon: "🗂️" },
  { key: "mcqs", title: "Multiple Choice Questions", icon: "✅" },
  { key: "trueFalse", title: "True/False Questions", icon: "⚖️" },
  { key: "definitions", title: "Key Definitions", icon: "📚" },
  { key: "kidsExplanation", title: "Kids Mode Explanation", icon: "🎨" },
  { key: "professionalExplanation", title: "Professional Explanation", icon: "💼" },
];

export const ResultsDisplay = ({ content, difficulty = "university" }: ResultsDisplayProps) => {
  const [expandedSections, setExpandedSections] = useState<SectionKey[]>(["summary"]);
  const [copiedSection, setCopiedSection] = useState<SectionKey | null>(null);
  const { toast } = useToast();

  const toggleSection = (key: SectionKey) => {
    setExpandedSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const copySection = async (key: SectionKey) => {
    const data = content[key];
    let textToCopy = "";

    if (typeof data === "string") {
      textToCopy = data;
    } else if (Array.isArray(data)) {
      textToCopy = JSON.stringify(data, null, 2);
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
    
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
  };

  const downloadPDF = () => {
    try {
      downloadAllContentPDF(content, difficulty);
      toast({
        title: "Success!",
        description: "Complete study materials downloaded as PDF.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadSectionPDF = (key: SectionKey) => {
    try {
      const data = content[key];
      const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
      
      const section = sections.find(s => s.key === key);
      const title = section?.title || key;
      
      switch (key) {
        case "summary":
          downloadSummaryPDF(data as string, {
            title,
            difficulty: capitalizedDifficulty,
            fileName: `${key}.pdf`
          });
          break;
        case "flashcards":
          downloadFlashcardsPDF(data as GeneratedContent["flashcards"], {
            title,
            difficulty: capitalizedDifficulty,
            fileName: `${key}.pdf`
          });
          break;
        case "mcqs":
          downloadMCQsPDF(data as GeneratedContent["mcqs"], {
            title,
            difficulty: capitalizedDifficulty,
            fileName: `${key}.pdf`
          });
          break;
        case "trueFalse":
          downloadTrueFalsePDF(data as GeneratedContent["trueFalse"], {
            title,
            difficulty: capitalizedDifficulty,
            fileName: `${key}.pdf`
          });
          break;
        case "definitions":
          downloadDefinitionsPDF(data as GeneratedContent["definitions"], {
            title,
            difficulty: capitalizedDifficulty,
            fileName: `${key}.pdf`
          });
          break;
        case "kidsExplanation":
        case "professionalExplanation":
          downloadExplanationPDF(data as string, {
            title,
            difficulty: capitalizedDifficulty,
            fileName: `${key}.pdf`
          });
          break;
      }
      
      toast({
        title: "Success!",
        description: `${title} downloaded as PDF.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderContent = (key: SectionKey) => {
    const data = content[key];

    if (typeof data === "string") {
      return <p className="text-foreground leading-relaxed whitespace-pre-wrap">{data}</p>;
    }

    if (key === "flashcards") {
      return (
        <div className="space-y-3">
          {(data as GeneratedContent["flashcards"]).map((card, idx) => (
            <Card key={idx} className="p-4 bg-muted border-border">
              <p className="font-semibold text-foreground mb-2">Q: {card.question}</p>
              <p className="text-muted-foreground">A: {card.answer}</p>
            </Card>
          ))}
        </div>
      );
    }

    if (key === "mcqs") {
      return (
        <div className="space-y-4">
          {(data as GeneratedContent["mcqs"]).map((mcq, idx) => (
            <Card key={idx} className="p-4 bg-muted border-border">
              <p className="font-semibold text-foreground mb-3">
                {idx + 1}. {mcq.question}
              </p>
              <div className="space-y-2 ml-4">
                {mcq.options.map((option, optIdx) => (
                  <div
                    key={optIdx}
                    className={`p-2 rounded ${
                      optIdx === mcq.correctAnswer
                        ? "bg-secondary/20 border border-secondary"
                        : "bg-background"
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}. {option}
                    {optIdx === mcq.correctAnswer && (
                      <span className="ml-2 text-secondary font-semibold">✓ Correct</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (key === "trueFalse") {
      return (
        <div className="space-y-3">
          {(data as GeneratedContent["trueFalse"]).map((item, idx) => (
            <Card key={idx} className="p-4 bg-muted border-border">
              <p className="text-foreground mb-2">{item.statement}</p>
              <p className="text-sm font-semibold">
                Answer:{" "}
                <span className={item.answer ? "text-secondary" : "text-destructive"}>
                  {item.answer ? "True" : "False"}
                </span>
              </p>
            </Card>
          ))}
        </div>
      );
    }

    if (key === "definitions") {
      return (
        <div className="space-y-3">
          {(data as GeneratedContent["definitions"]).map((def, idx) => (
            <Card key={idx} className="p-4 bg-muted border-border">
              <p className="font-semibold text-primary mb-1">{def.term}</p>
              <p className="text-foreground">{def.definition}</p>
            </Card>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button
          onClick={downloadPDF}
          variant="default"
          data-testid="button-download-all-pdf"
        >
          <Download className="w-4 h-4 mr-2" />
          Download All as PDF
        </Button>
      </div>

      {/* Results Sections */}
      <div className="space-y-4">
        {sections.map(({ key, title, icon }) => {
          const data = content[key];
          const isEmpty = !data || (Array.isArray(data) && data.length === 0);
          const isExpanded = expandedSections.includes(key);

          if (isEmpty) return null;

          return (
            <Card key={key} className="overflow-hidden bg-card shadow-sm border-border">
              <button
                onClick={() => toggleSection(key)}
                className="w-full p-5 flex items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSectionPDF(key);
                    }}
                    className="hover:bg-background"
                    data-testid={`button-download-${key}-pdf`}
                  >
                    <FileDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      copySection(key);
                    }}
                    className="hover:bg-background"
                    data-testid={`button-copy-${key}`}
                  >
                    {copiedSection === key ? (
                      <Check className="w-4 h-4 text-secondary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-border animate-accordion-down">
                  {renderContent(key)}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
