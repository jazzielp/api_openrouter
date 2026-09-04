import OpenAI from "openai";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const MODEL_NAME = "meta-llama/Llama-3.2-3B-Instruct";

const deepinfra = new OpenAI({
  apiKey: env.DEEPINFRA_API_KEY,
  baseURL: "https://api.deepinfra.com/v1/openai",
});

export const deepinfraService = {
  name: "deepinfra",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const chatCompletion = await deepinfra.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: JOB_OFFER_SYSTEM_PROMPT },
        { role: "user", content: offerText },
      ],
      temperature: 0,
      max_tokens: 4096,
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
