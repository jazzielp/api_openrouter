import { Mistral } from "@mistralai/mistralai";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const MODEL_NAME = "mistral-medium-latest";

const mistral = new Mistral({
  apiKey: env.MISTRAL_API_KEY,
});

export const mistralService = {
  name: "mistral",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const response = await mistral.chat.complete({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: JOB_OFFER_SYSTEM_PROMPT },
        { role: "user", content: offerText },
      ],
      temperature: 0,
      maxTokens: 4096,
      topP: 1,
      responseFormat: { type: "json_object" },
    });

    const content = response.choices?.[0]?.message?.content;
    if (Array.isArray(content)) {
      throw new Error("AI service returned an unexpected content array");
    }
    if (!content) {
      throw new Error("AI service returned an empty response");
    }

    return jobOfferSchema.parse(JSON.parse(content));
  },
};
