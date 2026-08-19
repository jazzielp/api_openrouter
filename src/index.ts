import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server is running on port http://localhost:${env.PORT}`);
});
