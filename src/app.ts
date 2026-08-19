import express, { Request, Response } from "express";
import { groqService } from "./services/groq";
import { AIService } from "./types/types";

const services: AIService[] = [groqService];

let currentServiceIndex = 0;

function nextService() {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/", (_req: Request, res: Response) => {
    res.send("Hello World");
  });

  app.post("/chat", async (req: Request, res: Response) => {
    const { messages } = req.body;
    const service = nextService();
    const stream = await service.chat(messages);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    for await (const chunk of stream) {
      res.write(chunk);
    }
    res.end();
  });

  return app;
}
