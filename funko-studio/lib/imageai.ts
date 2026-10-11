import { editImage as editOpenAI } from "./openai";
import { editImageGemini } from "./gemini";

/** IMAGE_PROVIDER=gemini|openai. Sem ele: usa Gemini se houver GEMINI_API_KEY, senão OpenAI. */
export function provider(): "gemini" | "openai" | null {
  const want = process.env.IMAGE_PROVIDER?.toLowerCase();
  if (want === "gemini" && process.env.GEMINI_API_KEY) return "gemini";
  if (want === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

export const isDemo = () => provider() === null;

export function editImage(files: File[], prompt: string): Promise<string> {
  return provider() === "gemini" ? editImageGemini(files, prompt) : editOpenAI(files, prompt);
}
