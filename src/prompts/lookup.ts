import { EvalMetricError } from "../errors";
import { catalog } from "./catalog-data";
import type { PromptDefinition } from "./types";

export function getPrompt(id: string): PromptDefinition {
  const prompt = catalog.find((p) => p.id === id);
  if (!prompt) {
    throw new EvalMetricError(
      `Unknown metric "${id}". Available: ${catalog.map((p) => p.id).join(", ")}`,
    );
  }
  return prompt;
}

export function listPrompts(): PromptDefinition[] {
  return [...catalog];
}
