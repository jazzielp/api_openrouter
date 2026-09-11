import OpenAI from "openai";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const MODEL_NAME = "orcarouter/free";
const BASE_URL = "https://api.orcarouter.ai/v1";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: BASE_URL,
      apiKey: env.ORCAROUTER_API_KEY,
    });
  }
  return client;
}

export const orcarouterService = {
  name: "orcarouter",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const chatCompletion = await getClient().chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: JOB_OFFER_SYSTEM_PROMPT },
        { role: "user", content: offerText },
      ],
      temperature: 0,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI service returned an empty response");
    }

    return jobOfferSchema.parse(JSON.parse(content));
  },
};
