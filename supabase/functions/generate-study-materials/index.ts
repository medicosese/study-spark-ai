import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, difficulty, options } = await req.json();
    
    console.log("Received request:", { textLength: text?.length, difficulty, options });

    if (!text || !difficulty || !options || options.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, difficulty, or options" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the system prompt based on requested options
    const systemPrompt = buildSystemPrompt(difficulty, options);
    
    console.log("Calling Lovable AI with model: google/gemini-2.5-flash");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_study_materials",
              description: "Generate comprehensive study materials from the provided text",
              parameters: buildParametersSchema(options),
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_study_materials" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Received AI response");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      console.error("Invalid AI response format:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generatedContent = JSON.parse(toolCall.function.arguments);
    console.log("Successfully generated study materials");

    return new Response(
      JSON.stringify(generatedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-study-materials:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildSystemPrompt(difficulty: string, options: string[]): string {
  const difficultyMap: Record<string, string> = {
    kids: "Use simple words and short sentences suitable for children aged 8-12.",
    highschool: "Use clear language appropriate for high school students.",
    university: "Use academic language suitable for university-level students.",
    professional: "Use sophisticated, professional terminology for advanced learners.",
  };

  const difficultyText = difficultyMap[difficulty] || difficultyMap.university;

  return `You are an expert educational content generator. Your task is to analyze the provided text and generate high-quality study materials.

Difficulty level: ${difficulty.toUpperCase()}
${difficultyText}

Generate ONLY the requested content types from this list: ${options.join(", ")}

Guidelines:
- Be accurate and comprehensive
- Extract key concepts and important information
- Make content engaging and easy to understand
- For MCQs: provide 4 options with exactly one correct answer
- For flashcards: create clear questions with concise answers
- For definitions: identify the most important terms
- Adapt language complexity to the difficulty level`;
}

function buildParametersSchema(options: string[]) {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  const schemas: Record<string, any> = {
    summary: {
      type: "string",
      description: "A concise summary (150-200 words) capturing the main ideas",
    },
    flashcards: {
      type: "array",
      description: "10-15 flashcards for active recall",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
    },
    mcqs: {
      type: "array",
      description: "10-15 multiple choice questions with 4 options each",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: {
            type: "array",
            items: { type: "string" },
            minItems: 4,
            maxItems: 4,
          },
          correctAnswer: {
            type: "number",
            description: "Index of the correct answer (0-3)",
            minimum: 0,
            maximum: 3,
          },
        },
        required: ["question", "options", "correctAnswer"],
      },
    },
    trueFalse: {
      type: "array",
      description: "10 true/false statements",
      items: {
        type: "object",
        properties: {
          statement: { type: "string" },
          answer: { type: "boolean" },
        },
        required: ["statement", "answer"],
      },
    },
    definitions: {
      type: "array",
      description: "10 important terms with definitions",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          definition: { type: "string" },
        },
        required: ["term", "definition"],
      },
    },
    kidsExplanation: {
      type: "string",
      description: "A simple, child-friendly explanation (100-150 words)",
    },
    professionalExplanation: {
      type: "string",
      description: "A detailed, professional explanation (150-200 words)",
    },
  };

  for (const option of options) {
    if (schemas[option]) {
      properties[option] = schemas[option];
      required.push(option);
    }
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}
