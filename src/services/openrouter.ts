import { OpenRouter } from "@openrouter/sdk";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const openrouter = new OpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
  httpReferer: "http://localhost:3000",
  appTitle: "Job Offer Analyzer",
});

const JOB_OFFER_MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "openai/gpt-oss-20b:free",
];

export const openrouterService = {
  name: "openrouter",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const completion = await openrouter.chat.send({
      chatRequest: {
        model: JOB_OFFER_MODELS[0],
        models: JOB_OFFER_MODELS,
        messages: [
          { role: "system", content: JOB_OFFER_SYSTEM_PROMPT },
          { role: "user", content: offerText },
        ],
        temperature: 0.1,
        maxTokens: 2048,
        stream: false,
        responseFormat: {
          type: "json_schema",
          jsonSchema: {
            name: "job_offer",
            strict: true,
            schema: jobOfferSchema,
          },
        },
        provider: {
          requireParameters: true,
        },
      },
    });

    if (!("choices" in completion)) {
      throw new Error("OpenRouter returned an unexpected streaming response");
    }

    const content = completion.choices[0]?.message?.content;
    if (typeof content !== "string" || !content) {
      throw new Error("AI service returned an empty response");
    }

    return jobOfferSchema.parse(JSON.parse(content));
  },
};
