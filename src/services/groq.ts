import { Groq } from "groq-sdk";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const MODEL_NAME = "openai/gpt-oss-20b";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export const groqService = {
  name: "groq",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: JOB_OFFER_SYSTEM_PROMPT },
        { role: "user", content: offerText },
      ],
      model: MODEL_NAME,
      temperature: 0,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
      stop: null,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI service returned an empty response");
    }

    return jobOfferSchema.parse(JSON.parse(content));
  },
};
