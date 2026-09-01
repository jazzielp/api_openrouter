import express, { Request, Response } from "express";
import zod from "zod";

import { groqService } from "./services/groq";
import { ollamaService } from "./services/ollama";
import { openaiService } from "./services/openai";
import { AIService, JobOffer } from "./types/types";

const services: AIService[] = [groqService, openaiService, ollamaService];

let currentServiceIndex = 0;

async function analyzeWithFallback(
  offerText: string,
): Promise<{ jobOffer: JobOffer; provider: string }> {
  const startIndex = currentServiceIndex;
  currentServiceIndex = (currentServiceIndex + 1) % services.length;

  const failures: string[] = [];

  for (let attempt = 0; attempt < services.length; attempt++) {
    const service = services[(startIndex + attempt) % services.length];

    try {
      const jobOffer = await service.analyzeJobOffer(offerText);
      return { jobOffer, provider: service.name };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Provider ${service.name} failed:`, error);
      failures.push(`${service.name}: ${message}`);
    }
  }

  throw new Error(`All providers failed: ${failures.join("; ")}`);
}

const analyzeJobOfferBodySchema = zod.object({
  offer: zod.string().min(1),
});

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/", (_req: Request, res: Response) => {
    res.send("Hello World");
  });

  app.post("/job-offer", async (req: Request, res: Response) => {
    const body = analyzeJobOfferBodySchema.safeParse(req.body);

    if (!body.success) {
      res.status(400).json({
        error: "Request body must include a non-empty 'offer' string",
      });
      return;
    }

    try {
      const { jobOffer, provider } = await analyzeWithFallback(body.data.offer);
      res.json({ provider, ...jobOffer });
    } catch (error) {
      console.error("Failed to analyze job offer:", error);
      res.status(502).json({ error: "Failed to analyze job offer" });
    }
  });

  return app;
}
