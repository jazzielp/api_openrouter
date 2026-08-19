import { Groq } from "groq-sdk";

import { env } from "../config/env";
import { ChatMessage } from "../types/types";

const MODEL_NAME = "openai/gpt-oss-20b";

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export const groqService = {
  name: "groq",
  async chat(messages: ChatMessage[]) {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: MODEL_NAME,
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: true,
      stop: null,
    });

    return (async function* () {
      for await (const chunk of chatCompletion) {
        yield chunk.choices[0]?.delta?.content || "";
      }
    })();
  },
};
