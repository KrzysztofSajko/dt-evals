import { EvalResponseError } from "../../errors";
import type { LLMJudgeResponse } from "./types";

export function validateLLMResponse(parsed: unknown): LLMJudgeResponse {
  const response = parsed as Record<string, unknown>;
  if (
    typeof response?.scoreValue !== "number" ||
    !Number.isFinite(response.scoreValue) ||
    typeof response?.summary !== "string" ||
    typeof response?.reasoning !== "string"
  ) {
    const preview = JSON.stringify(parsed).slice(0, 200);
    throw new EvalResponseError(
      `Malformed LLM response: expected { scoreValue: number, summary: string, reasoning: string }, got ${preview}`,
    );
  }
  return {
    scoreValue: response.scoreValue as number,
    summary: response.summary as string,
    reasoning: response.reasoning as string,
  };
}
