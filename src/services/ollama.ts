import zod from "zod";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const MODEL_NAME = "deepseek-r1:1.5b";

const JOB_OFFER_JSON_SCHEMA = zod.toJSONSchema(jobOfferSchema);

interface OllamaChatResponse {
  message?: { content?: string };
}

export const ollamaService = {
  name: "ollama",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const response = await fetch(`${env.OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        stream: false,
        format: JOB_OFFER_JSON_SCHEMA,
        options: { temperature: 0, num_predict: 4096 },
        messages: [
          { role: "system", content: JOB_OFFER_SYSTEM_PROMPT },
          { role: "user", content: offerText },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    const content = data.message?.content;
    if (!content) {
      throw new Error("AI service returned an empty response");
    }

    return jobOfferSchema.parse(JSON.parse(content));
  },
};
