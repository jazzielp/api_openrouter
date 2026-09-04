import Cerebras from "@cerebras/cerebras_cloud_sdk";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const MODEL_NAME = "qwen-3.8-27b";

const cerebras = new Cerebras({
  apiKey: env.CEREBRAS_API_KEY,
});

function isErrorChunkResponse(
  completion: unknown,
): completion is { error: { message?: string | null }; status_code: number } {
  return (
    typeof completion === "object" &&
    completion !== null &&
    "error" in completion &&
    "status_code" in completion
  );
}

function getMessageContent(completion: {
  choices?: Array<unknown> | null;
}): string | null | undefined {
  const firstChoice = completion.choices?.[0];
  if (
    typeof firstChoice === "object" &&
    firstChoice !== null &&
    "message" in firstChoice &&
    typeof firstChoice.message === "object" &&
    firstChoice.message !== null &&
    "content" in firstChoice.message
  ) {
    return (firstChoice.message as { content?: string | null }).content;
  }
  return undefined;
}

export const cerebrasService = {
  name: "cerebras",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const completion = await cerebras.chat.completions.create({
      messages: [
        { role: "system", content: JOB_OFFER_SYSTEM_PROMPT },
        { role: "user", content: offerText },
      ],
      model: MODEL_NAME,
      temperature: 0,
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
    });

    if (isErrorChunkResponse(completion)) {
      throw new Error(
        `Cerebras returned an error: ${completion.error.message ?? "unknown error"}`,
      );
    }

    const content = getMessageContent(completion);
    if (typeof content !== "string" || !content) {
      throw new Error("AI service returned an empty response");
    }

    return jobOfferSchema.parse(JSON.parse(content));
  },
};
