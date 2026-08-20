import zod from "zod";

const envSchema = zod.object({
  PORT: zod.coerce.number().int().default(3000),
  GROQ_API_KEY: zod.string(),
  OPENAI_API_KEY: zod.string().optional(),
});

export const env = envSchema.parse(process.env);
export type Env = zod.infer<typeof envSchema>;
