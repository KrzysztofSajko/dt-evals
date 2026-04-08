import Anthropic from "@anthropic-ai/sdk";
import { EvalResponseError } from "../../errors";
import { BaseProvider } from "./base";
import type { LLMJudgeResponse, ProviderConfig } from "./types";
import { validateLLMResponse } from "./validate";

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required: readonly string[];
  };
}

const EVAL_TOOL = {
  name: "submit_evaluation",
  description: "Submit the evaluation result with score, summary, and reasoning",
  input_schema: {
    type: "object",
    properties: {
      scoreValue: { type: "number", description: "The evaluation score" },
      summary: { type: "string", description: "Brief summary of the evaluation" },
      reasoning: { type: "string", description: "Detailed reasoning for the score" },
    },
    required: ["scoreValue", "summary", "reasoning"],
  },
} as const satisfies ToolDefinition;

export class AnthropicProvider extends BaseProvider {
  private client: Anthropic;

  constructor(config: ProviderConfig) {
    super(config);
    this.client = new Anthropic({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
      timeout: this.timeout,
      maxRetries: 0,
    });
  }

  async call(prompt: string): Promise<LLMJudgeResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system:
        "You are an expert LLM evaluation judge. Use the submit_evaluation tool to return your evaluation.",
      messages: [{ role: "user", content: prompt }],
      tools: [EVAL_TOOL],
      tool_choice: { type: "tool", name: "submit_evaluation" },
    });

    const toolBlock = response.content.find(
      (block): block is Anthropic.Messages.ToolUseBlock =>
        block.type === "tool_use" && block.name === "submit_evaluation",
    );
    if (!toolBlock) {
      throw new EvalResponseError("Anthropic did not return the expected tool use response");
    }

    return validateLLMResponse(toolBlock.input);
  }
}
