import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { terms, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const termsList = terms.map((t: any) => 
      `FR: ${t.fr} | EN: ${t.en} | Def FR: ${t.definition_fr || ''} | Def EN: ${t.definition_en || ''} | Ex FR: ${t.example_fr || ''} | Ex EN: ${t.example_en || ''}`
    ).join("\n");

    const systemPrompt = `You are a quiz generator for a government terminology learning platform. Generate quizzes using ONLY the provided terminology terms. You must return valid JSON using the tool provided.`;

    const userPrompt = `Generate a quiz with exactly 10 questions using these terminology terms:

${termsList}

Create a mix of 3 types:
- "multiple_choice": Give a term (FR or EN) and 4 options for its translation. Only 1 is correct.
- "fill_blank": Give a sentence with a blank (___) where the user must type the correct term.
- "match_definition": Give a definition and 4 term options. Only 1 matches the definition.

Make it varied and educational. Use ${lang === 'fr' ? 'French' : 'English'} for instructions/questions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_quiz",
            description: "Create a terminology quiz with questions",
            parameters: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["multiple_choice", "fill_blank", "match_definition"] },
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      correct_answer: { type: "string" },
                    },
                    required: ["type", "question", "correct_answer"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["questions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_quiz" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const quiz = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(quiz), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
