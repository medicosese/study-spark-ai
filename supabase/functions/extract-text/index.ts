import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    let extractedText = '';

    // Handle different file types
    if (file.type === 'text/plain') {
      extractedText = await file.text();
    } else if (file.type.startsWith('image/')) {
      // Use Lovable AI Gateway for OCR
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const imageUrl = `data:${file.type};base64,${base64Image}`;
        
        console.log('Starting AI OCR for image...');
        
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Extract all text from this image. Return ONLY the extracted text, nothing else. If there is no readable text, return "No text found".'
                  },
                  {
                    type: 'image_url',
                    image_url: { url: imageUrl }
                  }
                ]
              }
            ],
          }),
        });

        if (!response.ok) {
          throw new Error('AI OCR request failed');
        }

        const data = await response.json();
        extractedText = data.choices[0].message.content;
        
        console.log('AI OCR completed, text length:', extractedText.length);
      } catch (ocrError) {
        console.error('OCR error:', ocrError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to extract text from image. Please ensure the image contains clear, readable text.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (file.type === 'application/pdf') {
      // For PDF files, use unpdf which works in Deno/edge environments
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Import unpdf which is designed for edge runtimes
        const { extractText } = await import('https://esm.sh/unpdf@0.11.0');
        const result = await extractText(new Uint8Array(arrayBuffer));
        
        // Handle both string and array returns from unpdf
        extractedText = Array.isArray(result.text) ? result.text.join('\n') : result.text;
        
        console.log('PDF parsed successfully, text length:', extractedText.length);
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        
        // If unpdf fails, provide helpful error message
        return new Response(
          JSON.stringify({ 
            error: 'Failed to extract text from PDF. For best results, please:\n1. Ensure the PDF contains selectable text (not scanned images)\n2. Try converting the PDF to TXT format\n3. Or copy and paste the text directly into the text area' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      // For Office documents, provide a helpful message
      return new Response(
        JSON.stringify({ 
          error: 'Word and Excel files are not yet supported. Please convert your document to PDF or TXT format and try again.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type. Please upload TXT, PDF, or image files (JPG, PNG, WEBP).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean up the extracted text - preserve paragraphs but clean up excessive whitespace
    extractedText = extractedText
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ');

    if (!extractedText || extractedText.length < 10) {
      return new Response(
        JSON.stringify({ error: 'No meaningful text could be extracted from the file. The PDF might contain only images. Please try a text-based PDF or convert it to TXT format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully extracted text, length:', extractedText.length);

    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in extract-text function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to process file' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
