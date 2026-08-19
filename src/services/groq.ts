import { Groq } from "groq-sdk";
import zod from "zod";

import { env } from "../config/env";
import { JobOffer } from "../types/types";

const MODEL_NAME = "openai/gpt-oss-20b";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert job posting analyzer. The user will send you the raw text of a job offer (copied as-is from sites like LinkedIn, so it may contain noise like buttons, ads or unrelated UI text). Extract the structured data from it.

Respond ONLY with a valid JSON object matching exactly this shape:
{
  "jobTitle": string | null,
  "company": string | null,
  "mainResponsibilities": string[],
  "requiredTechnologies": string[],
  "optionalTechnologies": string[],
  "languages": string[],
  "workMode": string | null,
  "salary": string | null,
  "benefits": string[]
}

Rules:
- Use null when a scalar field is not mentioned in the text, and an empty array when a list field has no items.
- Ignore any noise that is not part of the offer itself (buttons like "Solicitar"/"Guardar", premium ads, click counters, etc.).
- requiredTechnologies: technologies, frameworks, tools and practices listed as mandatory requirements.
- optionalTechnologies: technologies marked as desirable, nice-to-have or a plus ("deseable", "valorable", "plus", "nice to have").
- languages: programming languages and/or spoken languages explicitly mentioned (e.g. "TypeScript", "Inglés B2").
- workMode: the work modality as stated (e.g. "Remoto", "Híbrido", "Presencial").
- salary: the salary or salary range exactly as stated (e.g. "$30,000 - $40,000 MXN mensuales").
- benefits: the listed benefits (e.g. "Seguro de gastos médicos mayores", "Vales de despensa").
- Do not invent data. Extract only what the text states.
- Return raw JSON only: no markdown fences, no explanation, no extra text.`;

const jobOfferSchema = zod.object({
  jobTitle: zod.string().nullable(),
  company: zod.string().nullable(),
  mainResponsibilities: zod.array(zod.string()),
  requiredTechnologies: zod.array(zod.string()),
  optionalTechnologies: zod.array(zod.string()),
  languages: zod.array(zod.string()),
  workMode: zod.string().nullable(),
  salary: zod.string().nullable(),
  benefits: zod.array(zod.string()),
});

export const groqService = {
  name: "groq",
  async analyzeJobOffer(offerText: string): Promise<JobOffer> {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
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
