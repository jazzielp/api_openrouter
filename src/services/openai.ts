import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const MODEL_NAME = "gpt-5.6-luna";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

export const openaiService = {
  name: "openai",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const response = await getClient().responses.parse({
      model: MODEL_NAME,
      input: [
        { role: "system", content: JOB_OFFER_SYSTEM_PROMPT },
        { role: "user", content: offerText },
      ],
      text: {
        format: zodTextFormat(jobOfferSchema, "job_offer"),
      },
    });

    if (!response.output_parsed) {
      throw new Error("AI service returned no parsed output");
    }

    return response.output_parsed;
  },
};
