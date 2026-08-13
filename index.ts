import express, { type Express, type Request, type Response } from "express";
import { env } from "./src/config/env";

const app: Express = express();

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT} 🚀`);
});
