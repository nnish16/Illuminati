import { GoogleGenAI, Type } from "@google/genai";
import { COUNCIL_MEMBERS } from "../constants";
import { ImageGenerationSettings } from "../types";

// --- OPENROUTER CONFIGURATION ---
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = "https://council-of-intelligence.vercel.app"; // Update with your Vercel URL
const SITE_NAME = "The Council of Intelligence";

// Initialize Google AI
// API Key must be obtained exclusively from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper for OpenRouter Calls (Strictly for non-Google Council Members)
const callOpenRouter = async (modelId: string, messages: any[]) => {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY; 
  
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing");

  const body: any = {
    model: modelId,
    messages: messages,
    temperature: 0.7,
  };

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
  // Use gemini-2.5-flash for basic text tasks (Guard)
  const modelId = "gemini-2.5-flash";

  const systemInstruction = `
    You are the Ruthless Gatekeeper of the High Council of Intelligence.
    Your sole purpose is to BLOCK queries that are too simple, factual, trivial, or nonsensical.
    
    Rules:
    1. If the query is petty (math, simple facts, coding snippets, hello), REJECT IT.
    2. REJECTION format: Rude, arrogant, dismissive. Mock the specific query.
    3. ALLOWED: Only complex, philosophical, ethical, or multi-faceted problems.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            allowed: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["allowed", "reason"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Guard returned empty response");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Guard Check Error:", error);
    // Fail safe: Block if error
    return { allowed: false, reason: "The Gatekeeper is currently dormant, but the door remains shut." };
  }
};

// --- MULTI-MODEL COUNCIL DEBATE ---
export const generateCouncilDebate = async (userQuery: string): Promise<any[]> => {
  try {
    console.log("Gathering the Council...");

    // PHASE 1: PARALLEL COUNCIL GATHERING (OpenRouter for diverse models)
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
    // The Chairman (Gemini 3 Pro) receives all perspectives and scripts the interaction.
    const chairmanPrompt = `
      User Query: "${userQuery}"
      
      I have gathered the initial thoughts from the Council Members:
      ${stancesText}
      
      YOUR TASK:
      Based on these real stances, script the full Council Meeting discussion.
      1. Start with 'logic' (The Architect).
      2. Ensure EVERY member speaks, utilizing the perspectives provided above.
      3. Encourage conflict/debate where stances differ.
      4. Conclude with a "Decree" (a synthesis/final answer).
    `;

    // Use gemini-3-pro-preview for complex text tasks (Chairman)
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: chairmanPrompt,
      config: {
        systemInstruction: "You are the Chairman of the Council (Gemini 3 Pro). Script the debate.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speakerId: { type: Type.STRING },
              content: { type: Type.STRING },
              type: { type: Type.STRING }, // 'debate' | 'decree'
            },
            required: ["speakerId", "content", "type"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Chairman returned empty response");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Council Debate Error:", error);
    throw error;
  }
};

// --- IMAGE GENERATION ---
export const generateCouncilChamberImage = async (prompt: string, settings: ImageGenerationSettings): Promise<string> => {
  // Use gemini-3-pro-image-preview for High-Quality Image Generation (1K, 2K, 4K)
  const modelId = "gemini-3-pro-image-preview";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio, // "16:9", "1:1", "9:16"
          imageSize: settings.size, // "1K", "2K", "4K"
        },
      },
    });
    
    // Find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Council Visualization Error:", error);
    // Fallback if visualization fails
    return "https://placehold.co/1024x576/1c1917/fbbf24?text=Vision+Summoned";
  }
};