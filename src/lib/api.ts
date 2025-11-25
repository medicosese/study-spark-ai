import { supabase } from "@/integrations/supabase/client";
import type { GeneratedContent } from "@/types/studyMaterials";

export interface GenerateOptions {
  text: string;
  difficulty: string;
  options: string[];
}

export const generateStudyMaterials = async ({
  text,
  difficulty,
  options,
}: GenerateOptions): Promise<GeneratedContent> => {
  const { data, error } = await supabase.functions.invoke("generate-study-materials", {
    body: { text, difficulty, options },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "Failed to generate study materials");
  }

  if (!data) {
    throw new Error("No data returned from generation");
  }

  return data as GeneratedContent;
};
