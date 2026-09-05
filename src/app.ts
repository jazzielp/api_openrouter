import express, { Request, Response } from "express";
import zod from "zod";

import { groqService } from "./services/groq";
import { ollamaService } from "./services/ollama";
import { openaiService } from "./services/openai";
import { sambanovaService } from "./services/sambanova";
import { AIService } from "./types/types";

const services: AIService[] = [
  groqService,
  openaiService,
  ollamaService,
  sambanovaService,
];

let currentServiceIndex = 0;

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
      let lastError: unknown = null;
      const startIndex = currentServiceIndex;

      for (let i = 0; i < services.length; i++) {
        const serviceIndex = (startIndex + i) % services.length;
        const service = services[serviceIndex];

        try {
          console.log("Trying service:", service.name);
          const jobOffer = await service.analyzeJobOffer(body.data.offer);
          console.log("Service succeeded:", service.name);
          currentServiceIndex = (serviceIndex + 1) % services.length;
          res.json(jobOffer);
          return;
        } catch (error) {
          console.error(`Service ${service.name} failed:`, error);
          lastError = error;
        }
      }

      console.error("All services failed. Last error:", lastError);
      res.status(502).json({ error: "Failed to analyze job offer" });
    } catch (error) {
      console.error("Failed to analyze job offer:", error);
      res.status(502).json({ error: "Failed to analyze job offer" });
    }
  });

  return app;
}
