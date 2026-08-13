import zod from "zod";

const envSchema = zod.object({
  PORT: zod.coerce.number().int().default(3000),
});

export const env = envSchema.parse(process.env);
export type Env = zod.infer<typeof envSchema>;
