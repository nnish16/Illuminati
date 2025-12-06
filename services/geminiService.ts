import { GoogleGenAI, Type } from "@google/genai";
import { COUNCIL_MEMBERS } from "../constants";
import { ImageGenerationSettings } from "../types";

// Helper to get client with current key
const getClient = () => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found. Please add API_KEY to your environment variables.");
  return new GoogleGenAI({ apiKey });
};

export const checkQueryWithGuard = async (userQuery: string): Promise<{ allowed: boolean; reason: string }> => {
  const ai = getClient();
  // Using gemini-2.5-flash for maximum speed
  const modelId = "gemini-2.5-flash";

  const systemInstruction = `
    You are the Ruthless Gatekeeper of the High Council of Intelligence.
    Your sole purpose is to BLOCK queries that are too simple, factual, trivial, or nonsensical for the Council.
    The Council ONLY discusses deep, complex, philosophical, ethical, or multi-faceted problems that require debate.

    If the user's query is petty (math, simple facts, coding snippets, greetings, jokes), you MUST REJECT IT.

    When rejecting, your 'reason' MUST:
    1. Be rude, arrogant, and dismissive.
    2. Explicitly reference or mock the specific thing the user asked about (e.g., "You come to us for a cookie recipe?").
    3. Scold them for wasting the Council's time with such a mundane request.
    4. Use a dark, medieval, authoritative tone.

    Examples of Responses:
    - User: "What is 2+2?" -> Reason: "You dare disturb the Ancients with basic arithmetic? Count on your fingers, peasant, and leave us be."
    - User: "Write code for a button" -> Reason: "We debate the nature of consciousness, yet you beg for a mere button script? Do not insult our intellect."
    - User: "Hi" -> Reason: "Silence! We are not here to exchange pleasantries with mortals. State a worthy query or vanish."
    - User: "Who won the superbowl?" -> Reason: "The Council cares not for your petty sports and spectacles. Bring us questions of substance."

    Return a JSON object:
    {
      "allowed": boolean,
      "reason": string // The rude, personalized refusal message if rejected. Empty if allowed.
    }
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
            reason: { type: Type.STRING }
          },
          required: ["allowed", "reason"]
        }
      }
    });

    const text = response.text;
    if (!text) return { allowed: false, reason: "The Gatekeeper glares at you in silence." };
    return JSON.parse(text);

  } catch (error) {
    console.error("Guard Check Error:", error);
    // Fallback: If Guard fails, we let it through to the council to be safe, or reject. 
    // Let's reject to be safe.
    return { allowed: false, reason: "The mists of the void prevent your message from reaching the gate." };
  }
};

export const generateCouncilDebate = async (userQuery: string): Promise<any[]> => {
  const ai = getClient();
  
  // Using gemini-3-pro-preview with High Thinking Budget for deep simulation
  const modelId = "gemini-3-pro-preview";
  
  const memberDescriptions = COUNCIL_MEMBERS.map(m => 
    `${m.name} (${m.title}): ${m.description}`
  ).join('\n');

  const systemInstruction = `
    You are the Grand Scribe of the Council of Intelligence. 
    The Council members are:
    ${memberDescriptions}

    Your task is to simulate a "Council Meeting" regarding the user's query.
    
    Rules for the meeting:
    1. The debate MUST start with 'logic' (The Architect) giving an immediate, concise analysis.
    2. EVERY single Council member must speak at least once to ensure all perspectives are heard.
    3. The members should discuss, debate, and even disagree based on their personas.
    4. Finally, they must reach a consensus or a "Final Decree".
    
    Return the result strictly as a JSON array of objects.
    Each object must have:
    - "speakerId": The ID of the council member (e.g., 'logic', 'creative') or 'decree' for the final summary.
    - "content": The spoken text.
    - "type": 'debate' for discussion, 'decree' for the final answer.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: {
            thinkingBudget: 32768, // Max budget for deep reasoning
        }, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speakerId: { type: Type.STRING },
              content: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["debate", "decree"] }
            },
            required: ["speakerId", "content", "type"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);

  } catch (error) {
    console.error("Council Debate Error:", error);
    throw error;
  }
};

export const generateCouncilChamberImage = async (prompt: string, settings: ImageGenerationSettings): Promise<string> => {
  const ai = getClient();
  // Using gemini-3-pro-image-preview for high quality (1K, 2K, 4K) images
  const modelId = "gemini-3-pro-image-preview";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
          imageSize: settings.size
        }
      }
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    throw new Error("No image generated by the council.");
  } catch (error) {
    console.error("Council Visualization Error:", error);
    throw error;
  }
};