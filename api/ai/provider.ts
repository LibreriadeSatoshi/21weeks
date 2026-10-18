import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { listModels } from "./ai-client";

let cachedModelId: string | null = null;

export function kimiGw() {
  const baseURL = process.env.AI_BASE_URL ?? process.env.KIMI_AGENTGW_BASE_URL;
  const apiKey = process.env.AI_API_KEY ?? process.env.KIMI_AGENTGW_API_KEY;
  if (!baseURL || !apiKey) {
    throw new Error("AI_BASE_URL / AI_API_KEY (or KIMI_AGENTGW_*) not set");
  }
  return createOpenAICompatible({
    name: "kimi-gw",
    baseURL,
    apiKey,
    includeUsage: true,
    supportsStructuredOutputs: true,
  });
}

export async function defaultModelId(): Promise<string> {
  // On a self-hosted server the model is set by config and there is no need
  // to query /models (whose format is specific to the Kimi gateway).
  const forced = process.env.AI_MODEL_ID;
  if (forced) return forced;
  if (cachedModelId) return cachedModelId;
  const { defaultModelId } = await listModels();
  cachedModelId = defaultModelId;
  return defaultModelId;
}
