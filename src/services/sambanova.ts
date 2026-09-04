import SambaNova from "sambanova";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const MODEL_NAME = "Meta-Llama-3.3-70B-Instruct";

const sambanova = new SambaNova({
  apiKey: env.SAMBANOVA_API_KEY,
});

export const sambanovaService = {
  name: "sambanova",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const chatCompletion = await sambanova.chat.completions.create({
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
    });

    if (chatCompletion.object !== "chat.completion") {
      throw new Error("SambaNova returned an unexpected streaming response");
    }

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI service returned an empty response");
    }

    return jobOfferSchema.parse(JSON.parse(content));
  },
};
