import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, sourceLang, targetLang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langNames: Record<string, string> = {
      fr: "French",
      en: "English",
      ar: "Arabic",
      es: "Spanish",
      de: "German",
    };

    const isAuto = sourceLang === "auto";
    const from = isAuto ? "the source language (auto-detect)" : (langNames[sourceLang] || sourceLang);
    const to = langNames[targetLang] || targetLang;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: isAuto
              ? `You are a professional translator specializing in government and official documents. Auto-detect the language of the following text and translate it to ${to}. IMPORTANT: If the text contains HTML tags, preserve ALL HTML formatting exactly (bold, italic, underline, alignment styles, font sizes, paragraph tags, etc.). Only translate the text content inside the tags, never modify the HTML structure or attributes. Only return the translated text, nothing else.`
              : `You are a professional translator specializing in government and official documents. Translate the following text from ${from} to ${to}. IMPORTANT: If the text contains HTML tags, preserve ALL HTML formatting exactly (bold, italic, underline, alignment styles, font sizes, paragraph tags, etc.). Only translate the text content inside the tags, never modify the HTML structure or attributes. Only return the translated text, nothing else.`,
          },
          { role: "user", content: text },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ translated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
