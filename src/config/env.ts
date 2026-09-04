import zod from "zod";

const envSchema = zod.object({
  PORT: zod.coerce.number().int().default(3000),
  GROQ_API_KEY: zod.string(),
  OPENAI_API_KEY: zod.string().optional(),
  OPENROUTER_API_KEY: zod.string().optional(),
  CEREBRAS_API_KEY: zod.string().optional(),
  TOGETHER_API_KEY: zod.string().optional(),
  DEEPINFRA_API_KEY: zod.string().optional(),
  OLLAMA_BASE_URL: zod.string().default("http://localhost:11434"),
});

export const env = envSchema.parse(process.env);
export type Env = zod.infer<typeof envSchema>;
