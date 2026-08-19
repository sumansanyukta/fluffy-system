import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export const geminiFlash = gemini("gemini-2.5-flash");
export const geminiVision = gemini("gemini-2.5-flash");
