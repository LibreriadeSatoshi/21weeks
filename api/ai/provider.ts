import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { listModels } from "./ai-client";

let cachedModelId: string | null = null;

export function kimiGw() {
  const baseURL = process.env.AI_BASE_URL ?? process.env.KIMI_AGENTGW_BASE_URL;
  const apiKey = process.env.AI_API_KEY ?? process.env.KIMI_AGENTGW_API_KEY;
  if (!baseURL || !apiKey) {
    throw new Error("AI_BASE_URL / AI_API_KEY (o KIMI_AGENTGW_*) no configuradas");
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
  // En servidor propio el modelo se fija por config y no hace falta
  // consultar /models (cuyo formato es específico del gateway Kimi).
  const forced = process.env.AI_MODEL_ID;
  if (forced) return forced;
  if (cachedModelId) return cachedModelId;
  const { defaultModelId } = await listModels();
  cachedModelId = defaultModelId;
  return defaultModelId;
}
