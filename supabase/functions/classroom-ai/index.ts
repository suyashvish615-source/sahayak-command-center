import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { type, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "blueprint") {
      const { grade, subject, topic, duration, classType } = payload;
      systemPrompt = `You are an expert Indian government school teaching strategist. You generate structured classroom blueprints (lesson plans) for teachers. Be practical, specific, and context-aware for Indian classrooms with limited resources. Always respond in valid JSON format only — no markdown, no extra text.`;
      userPrompt = `Generate a classroom blueprint for:
- Grade: ${grade}
- Subject: ${subject}
- Topic: ${topic}
- Duration: ${duration} minutes
- Class Type: ${classType}

Respond ONLY with JSON in this exact format:
{
  "objective": "One clear learning objective",
  "steps": [
    { "phase": "Hook", "duration": "X min", "activity": "Specific activity description" },
    { "phase": "Instruction", "duration": "X min", "activity": "Specific activity description" },
    { "phase": "Practice", "duration": "X min", "activity": "Specific activity description" },
    { "phase": "Closure", "duration": "X min", "activity": "Specific activity description" }
  ],
  "materials": ["item1", "item2"],
  "difficultyAdaptations": { "struggling": "tip for struggling students", "advanced": "tip for advanced students" }
}`;
    } else if (type === "intervention") {
      const { interventionType, grade, subject, topic } = payload;
      systemPrompt = `You are an expert classroom management advisor for Indian government schools. Provide immediate, practical, actionable strategies. Always respond in valid JSON format only.`;
      const interventionDescriptions: Record<string, string> = {
        confusion: "Students are confused and struggling to understand the current concept",
        noise: "There is noise and disruption in the classroom, students are not paying attention",
        idle: "Some students have finished tasks early and are sitting idle while others are still working",
      };
      userPrompt = `Situation: ${interventionDescriptions[interventionType] || interventionType}
Context: Grade ${grade || "Unknown"}, Subject: ${subject || "Unknown"}, Topic: ${topic || "Unknown"}

Provide 4-5 immediate, practical strategies the teacher can use RIGHT NOW.
Respond ONLY with JSON:
{
  "title": "Brief title of the recommendation",
  "urgency": "low" | "medium" | "high",
  "strategies": [
    "Strategy 1 — specific and actionable",
    "Strategy 2 — specific and actionable",
    "Strategy 3 — specific and actionable",
    "Strategy 4 — specific and actionable"
  ],
  "followUp": "What to do after the immediate situation is handled"
}`;
    } else if (type === "reflection") {
      const { tags, note, sessionSummary } = payload;
      systemPrompt = `You are an expert teaching coach for Indian government school teachers. Provide insightful, encouraging, and constructive feedback. Always respond in valid JSON format only.`;
      userPrompt = `A teacher just completed a class session and submitted this reflection:
Tags: ${tags.join(", ")}
Notes: ${note}
Session info: ${JSON.stringify(sessionSummary)}

Analyze this reflection and provide actionable feedback.
Respond ONLY with JSON:
{
  "summary": "Brief summary of the session",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area for improvement 1", "area for improvement 2"],
  "nextSessionTip": "One specific tip for the next class",
  "encouragement": "A brief encouraging message"
}`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown request type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from AI response (handle markdown code blocks)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classroom-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
