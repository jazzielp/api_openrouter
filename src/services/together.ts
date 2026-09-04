import Together from "together-ai";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const MODEL_NAME = "meta-llama/Llama-4-Scout-17B-16E-Instruct";

const together = new Together({
  apiKey: env.TOGETHER_API_KEY,
});

export const togetherService = {
  name: "together",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const chatCompletion = await together.chat.completions.create({
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
