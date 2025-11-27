import { useState } from "react";
import { Sparkles, Loader2, Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import type { GeneratedContent } from "@/types/studyMaterials";
import { generateStudyMaterials } from "@/lib/api";

interface GeneratorProps {
  onGenerate: (content: GeneratedContent, difficulty: string) => void;
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setIsExtractingText(true);

    try {
      // For TXT files, read directly
      if (file.type === 'text/plain') {
        const text = await file.text();
        setText(text);
        toast({
          title: "File Loaded",
          description: `Text extracted from ${file.name}`,
        });
      } else {
        // For other files (PDF, DOCX, etc.), send to backend for extraction
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-text`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to extract text from file');
        }

        const { text: extractedText } = await response.json();
        setText(extractedText);
        toast({
          title: "File Processed",
          description: `Text extracted from ${file.name}`,
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: "Failed to extract text from file. Please try a different file or paste text manually.",
        variant: "destructive",
      });
      setUploadedFile(null);
    } finally {
      setIsExtractingText(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isExtractingText || isGenerating,
  });

  const removeFile = () => {
    setUploadedFile(null);
    setText("");
  };

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

      onGenerate(content, difficulty);
      
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

        {/* File Upload */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-foreground">
            Upload Document or Paste Text
          </Label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            } ${isExtractingText || isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            {isExtractingText ? (
              <p className="text-sm text-foreground">Extracting text from file...</p>
            ) : uploadedFile ? (
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-foreground">{uploadedFile.name}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground mb-1">
                  Drop a file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF and TXT files
                </p>
              </>
            )}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="text-input" className="text-lg font-semibold text-foreground">
            Or Paste Your Text Here
          </Label>
          <Textarea
            id="text-input"
            placeholder="Paste your notes, article, chapter, or any text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] bg-background resize-none text-base"
            disabled={isExtractingText || isGenerating}
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
