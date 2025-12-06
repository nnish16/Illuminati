import { GoogleGenAI } from "@google/genai";
import { COUNCIL_MEMBERS, CHAIRMAN_MODEL } from "../constants";
import { ImageGenerationSettings } from "../types";

// --- OPENROUTER CONFIGURATION ---
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = "https://council-of-intelligence.vercel.app"; // Update with your Vercel URL
const SITE_NAME = "The Council of Intelligence";

// Helper for OpenRouter Calls
const callOpenRouter = async (modelId: string, messages: any[], responseSchema?: any) => {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY; // Fallback for dev
  
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing");

  const body: any = {
    model: modelId,
    messages: messages,
    temperature: 0.7,
  };

  if (responseSchema) {
    body.response_format = responseSchema;
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`OpenRouter Error (${modelId}):`, err);
    throw new Error(`Model ${modelId} failed to respond.`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
};

// --- GUARD SERVICE ---
export const checkQueryWithGuard = async (userQuery: string): Promise<{ allowed: boolean; reason: string }> => {
  // Use a fast, efficient model for the Guard
  const modelId = "google/gemini-2.0-flash-001";

  const systemInstruction = `
    You are the Ruthless Gatekeeper of the High Council of Intelligence.
    Your sole purpose is to BLOCK queries that are too simple, factual, trivial, or nonsensical.
    
    Rules:
    1. If the query is petty (math, simple facts, coding snippets, hello), REJECT IT.
    2. REJECTION format: Rude, arrogant, dismissive. Mock the specific query.
    3. ALLOWED: Only complex, philosophical, ethical, or multi-faceted problems.

    Return JSON: { "allowed": boolean, "reason": string }
  `;

  try {
    const result = await callOpenRouter(modelId, [
      { role: "system", content: systemInstruction },
      { role: "user", content: userQuery }
    ], { type: "json_object" });

    return JSON.parse(result);
  } catch (error) {
    console.error("Guard Check Error:", error);
    // Fail safe: Block if error, or Allow. Let's block with generic message.
    return { allowed: false, reason: "The Gatekeeper is currently dormant, but the door remains shut." };
  }
};

// --- MULTI-MODEL COUNCIL DEBATE ---
export const generateCouncilDebate = async (userQuery: string): Promise<any[]> => {
  try {
    console.log("Gathering the Council...");

    // PHASE 1: PARALLEL COUNCIL GATHERING
    // We send the query to ALL council models simultaneously to get their unique perspectives.
    const memberPromises = COUNCIL_MEMBERS.map(async (member) => {
      const prompt = `
        You are ${member.name} (${member.title}).
        Your Personality: ${member.description}
        
        The User asks: "${userQuery}"
        
        Provide your initial, concise stance on this matter (1-2 sentences max). 
        Stay strictly in character.
      `;
      
      try {
        const content = await callOpenRouter(member.modelId, [
          { role: "user", content: prompt }
        ]);
        return { id: member.id, name: member.name, content: content };
      } catch (e) {
        console.error(`${member.name} failed to speak:`, e);
        return { id: member.id, name: member.name, content: "..." };
      }
    });

    const stances = await Promise.all(memberPromises);
    const stancesText = stances.map(s => `${s.name}: "${s.content}"`).join("\n");

    console.log("Council Stances Gathered:", stancesText);

    // PHASE 2: CHAIRMAN SYNTHESIS & SCRIPTING
    // The Chairman (Gemini 3 Pro / 2.0 Pro) receives all perspectives and scripts the interaction.
    const chairmanPrompt = `
      You are the Chairman of the Council (Gemini 3 Pro).
      
      User Query: "${userQuery}"
      
      I have gathered the initial thoughts from the Council Members (Actual separate AI models):
      ${stancesText}
      
      YOUR TASK:
      Based on these real stances, script the full Council Meeting discussion.
      1. Start with 'logic' (The Architect).
      2. Ensure EVERY member speaks, utilizing the perspectives provided above.
      3. Encourage conflict/debate where stances differ.
      4. Conclude with a "Decree" (a synthesis/final answer).
      
      Return strictly a JSON Array of objects:
      [
        { "speakerId": "logic", "content": "...", "type": "debate" },
        ...
        { "speakerId": "decree", "content": "The final verdict...", "type": "decree" }
      ]
    `;

    const rawScript = await callOpenRouter(CHAIRMAN_MODEL, [
      { role: "system", content: "You are the Grand Scribe and Chairman. Output strictly JSON." },
      { role: "user", content: chairmanPrompt }
    ], { type: "json_object" });

    // Clean up potential markdown formatting in response
    const jsonStr = rawScript.replace(/```json/g, '').replace(/```/g, '').trim();
    const script = JSON.parse(jsonStr);
    
    // Ensure it's an array
    return Array.isArray(script) ? script : (script.items || []);

  } catch (error) {
    console.error("Council Debate Error:", error);
    throw error;
  }
};

// --- IMAGE GENERATION (Keeping Google SDK for this specialized task if needed) ---
export const generateCouncilChamberImage = async (prompt: string, settings: ImageGenerationSettings): Promise<string> => {
  // Requires Google API Key specifically
  const apiKey = process.env.GOOGLE_API_KEY || process.env.API_KEY; 
  if (!apiKey) throw new Error("Google API Key required for images");
  
  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-2.0-pro-exp-02-05"; // Or specific image model

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }] },
      config: {
        // Mocking image config support for standard generative models if specific image model not available in this context
      }
    });
    
    // Fallback/Mock for text-only models if image generation isn't directly supported in this SDK version without specific image model
    return "https://placehold.co/1024x576/1c1917/fbbf24?text=Vision+Summoned";
  } catch (error) {
    console.error("Council Visualization Error:", error);
    throw error;
  }
};
