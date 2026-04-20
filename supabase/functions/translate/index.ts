const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

const languageMap: { [key: string]: string } = {
  "en": "English",
  "hi": "Hindi",
  "es": "Spanish",
  "fr": "French",
  "ar": "Arabic",
  "pt": "Portuguese",
  "de": "German",
  "ja": "Japanese",
  "zh": "Chinese",
  "ta": "Tamil",
  "te": "Telugu",
  "bn": "Bengali",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text, targetLanguage, sourceLanguage = "en" }: TranslateRequest = await req.json();

    if (!text || !targetLanguage) {
      throw new Error("Missing required fields: text, targetLanguage");
    }

    if (sourceLanguage === targetLanguage) {
      return new Response(
        JSON.stringify({ translatedText: text, language: targetLanguage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const translateUrl = "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-hi";

    const response = await fetch(translateUrl, {
      headers: { Authorization: `Bearer ${Deno.env.get("HUGGINGFACE_API_KEY") || ""}` },
      method: "POST",
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      const targetLangName = languageMap[targetLanguage] || targetLanguage;
      console.warn(`Translation API failed for ${targetLangName}, using placeholder`);

      return new Response(
        JSON.stringify({
          translatedText: text,
          language: targetLanguage,
          note: "Translation service unavailable, returning original text",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();

    const translatedText = Array.isArray(result) && result.length > 0
      ? result[0].translation_text
      : text;

    return new Response(
      JSON.stringify({ translatedText, language: targetLanguage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Translation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
