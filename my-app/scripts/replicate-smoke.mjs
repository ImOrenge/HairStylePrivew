import dotenv from "dotenv";
import Replicate from "replicate";

dotenv.config({ path: ".env.local" });
dotenv.config();

const token = process.env.REPLICATE_API_TOKEN;
if (!token || token.includes("YOUR_")) {
  throw new Error("REPLICATE_API_TOKEN is required. Set it in my-app/.env.local");
}

const model =
  process.env.REPLICATE_MODEL ||
  "google/imagen-4:d6b65a34e9ad921e239c88699d266083aedbc48bd4432acf505a617621e44e83";

const input = {
  prompt:
    process.env.REPLICATE_TEST_PROMPT ||
    "Create a cinematic, photorealistic portrait of a person with stylish modern haircut, soft natural lighting, high detail.",
  aspect_ratio: process.env.REPLICATE_TEST_ASPECT_RATIO || "1:1",
  safety_filter_level: process.env.REPLICATE_TEST_SAFETY_FILTER || "block_medium_and_above",
};

const replicate = new Replicate({
  auth: token,
  userAgent: "hairfit-ai/replicate-smoke",
});

console.log("Using model:", model);
console.log("Input:", input);

const output = await replicate.run(model, { input });
console.log("Output:", output);
