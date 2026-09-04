import express, { Request, Response } from "express";
import zod from "zod";

import { cerebrasService } from "./services/cerebras";
import { groqService } from "./services/groq";
import { ollamaService } from "./services/ollama";
import { openaiService } from "./services/openai";
import { openrouterService } from "./services/openrouter";
import { AIService } from "./types/types";

// const services: AIService[] = [groqService, openaiService, ollamaService];
const services: AIService[] = [cerebrasService];

let currentServiceIndex = 0;

function nextService() {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
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
      const service = nextService();
      console.log("service", service.name);
      const jobOffer = await service.analyzeJobOffer(body.data.offer);
      res.json(jobOffer);
    } catch (error) {
      console.error("Failed to analyze job offer:", error);
      res.status(502).json({ error: "Failed to analyze job offer" });
    }
  });

  return app;
}
