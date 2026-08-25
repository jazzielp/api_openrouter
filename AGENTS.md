# Repository Guide

## Commands

- Use pnpm; `package.json` declares pnpm `^11.1.3` and the lockfile is `pnpm-lock.yaml`.
- Start development with `pnpm dev`. It runs `tsx watch --env-file=.env.development src/index.ts`; it does not load `.env`.
- Run the available static verification with `pnpm exec tsc --noEmit`.
- There is no lint, build, or automated test setup. Do not use `pnpm test`: the script intentionally exits with an error.
- Smoke-test `POST /job-offer` using `TESTING.md`. Its examples target port `3005`; use the actual `PORT` value (the schema default is `3000`).

## Runtime Flow

- `src/index.ts` is the process entrypoint; `src/app.ts` owns Express setup and routes so it can be instantiated without listening.
- `POST /job-offer` validates `{ offer: non-empty string }`, chooses a service, and maps all provider/parsing failures to HTTP 502.
- Provider selection is the `services` array in `src/app.ts`. Only `openaiService` is currently enabled; Groq and Ollama implementations are present but inactive.
- Keep the extraction prompt and output validation aligned in `src/services/job-offer.ts`. Every provider must return the shared `JobOffer` shape.

## Environment Gotchas

- Environment validation runs at import time in `src/config/env.ts`. `GROQ_API_KEY` is required even while Groq is inactive; `OPENAI_API_KEY` is optional in the schema but required when the active OpenAI client makes a request.
- Ollama uses `OLLAMA_BASE_URL` (default `http://localhost:11434`) and requires the model named in `src/services/ollama.ts` to exist locally before that provider can be enabled.
- `oferta.txt` is the manual smoke-test input. `response/*.json` and `result.json` are captured examples, not automated fixtures.
