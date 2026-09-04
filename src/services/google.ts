import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env";
import { JobOffer } from "../types/types";
import { JOB_OFFER_SYSTEM_PROMPT, jobOfferSchema } from "./job-offer";

const MODEL_NAME = "gemini-3.6-flash";

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

export const googleService = {
  name: "google",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: offerText,
      config: {
        systemInstruction: JOB_OFFER_SYSTEM_PROMPT,
        temperature: 0,
        maxOutputTokens: 4096,
        topP: 1,
      },
    });

    const content = response.text;
    if (!content) {
      throw new Error("AI service returned an empty response");
    }

    return jobOfferSchema.parse(JSON.parse(content));
  },
};
