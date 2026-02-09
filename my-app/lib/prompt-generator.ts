import { GoogleGenerativeAI } from "@google/generative-ai";

export const PROMPT_VERSION = "v1";

export interface PromptStyleOptions {
  gender?: "male" | "female" | "unisex";
  length?: "short" | "medium" | "long";
  style?: string;
  color?: string;
}

export interface GeneratePromptInput {
  userInput: string;
  styleOptions?: PromptStyleOptions;
  imageContext?: {
    originalImagePath?: string | null;
  };
}

export interface GeneratePromptResult {
  prompt: string;
  negativePrompt: string;
  normalizedOptions: PromptStyleOptions;
  promptVersion: string;
  model: string;
}

const DEFAULT_NEGATIVE_PROMPT =
  "low quality, blurry, deformed face, extra limbs, bad anatomy, watermark, text, oversaturated";

const QUALITY_PREFIX =
  "(masterpiece, best quality, photorealistic:1.3), professional portrait, natural studio lighting";

const STYLE_MAP: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /단발|bob/i, value: "short bob cut" },
  { pattern: /숏컷|short/i, value: "short haircut" },
  { pattern: /레이어|layer/i, value: "layered cut with texture" },
  { pattern: /허쉬|hush/i, value: "hush cut style" },
  { pattern: /시스루.?뱅|see.?through.?bang/i, value: "soft see-through bangs" },
  { pattern: /앞머리|bang/i, value: "natural bangs" },
  { pattern: /펌|perm|웨이브|wave/i, value: "soft wavy perm" },
  { pattern: /직모|straight/i, value: "straight smooth hair texture" },
];

const COLOR_MAP: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /애쉬.?브라운|ash.?brown/i, value: "ash brown hair color" },
  { pattern: /블랙|검정|black/i, value: "natural black hair color" },
  { pattern: /브라운|갈색|brown/i, value: "natural brown hair color" },
  { pattern: /금발|블론드|blonde/i, value: "blonde hair color" },
  { pattern: /레드|와인|red/i, value: "deep red hair color" },
];

const LENGTH_MAP: Record<NonNullable<PromptStyleOptions["length"]>, string> = {
  short: "short length",
  medium: "medium length",
  long: "long length",
};

const GENDER_MAP: Record<NonNullable<PromptStyleOptions["gender"]>, string> = {
  female: "female",
  male: "male",
  unisex: "androgynous style",
};

function cleanText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function normalizeOptions(options?: PromptStyleOptions): PromptStyleOptions {
  if (!options) {
    return {};
  }

  const normalized: PromptStyleOptions = {};

  if (options.gender === "female" || options.gender === "male" || options.gender === "unisex") {
    normalized.gender = options.gender;
  }

  if (options.length === "short" || options.length === "medium" || options.length === "long") {
    normalized.length = options.length;
  }

  if (typeof options.style === "string" && options.style.trim()) {
    normalized.style = cleanText(options.style.toLowerCase());
  }

  if (typeof options.color === "string" && options.color.trim()) {
    normalized.color = cleanText(options.color.toLowerCase());
  }

  return normalized;
}

function findMappedValues(input: string, mappings: Array<{ pattern: RegExp; value: string }>): string[] {
  return mappings.filter((item) => item.pattern.test(input)).map((item) => item.value);
}

function buildHeuristicPrompt(input: GeneratePromptInput): GeneratePromptResult {
  const normalizedInput = cleanText(input.userInput);
  const normalizedOptions = normalizeOptions(input.styleOptions);
  const lowerInput = normalizedInput.toLowerCase();

  const parts: string[] = [QUALITY_PREFIX];

  if (normalizedOptions.gender) {
    parts.push(GENDER_MAP[normalizedOptions.gender]);
  }

  if (normalizedOptions.length) {
    parts.push(LENGTH_MAP[normalizedOptions.length]);
  }

  if (normalizedOptions.style) {
    parts.push(`${normalizedOptions.style} hairstyle`);
  }

  if (normalizedOptions.color) {
    parts.push(`${normalizedOptions.color} hair color`);
  }

  parts.push(...findMappedValues(lowerInput, STYLE_MAP));
  parts.push(...findMappedValues(lowerInput, COLOR_MAP));

  if (input.imageContext?.originalImagePath) {
    parts.push("preserve original facial identity and face shape");
  }

  parts.push("sharp focus on hairstyle details");

  const uniqueParts = Array.from(new Set(parts.map((value) => cleanText(value)).filter(Boolean)));

  return {
    prompt: uniqueParts.join(", "),
    negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    normalizedOptions,
    promptVersion: PROMPT_VERSION,
    model: "heuristic-v1",
  };
}

function parseJsonFromLLM(text: string): { prompt: string; negativePrompt?: string } | null {
  const trimmed = text.trim();
  const withoutCodeFence = trimmed
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(withoutCodeFence) as { prompt?: unknown; negativePrompt?: unknown };
    if (typeof parsed.prompt !== "string" || !parsed.prompt.trim()) {
      return null;
    }

    return {
      prompt: cleanText(parsed.prompt),
      negativePrompt: typeof parsed.negativePrompt === "string" ? cleanText(parsed.negativePrompt) : undefined,
    };
  } catch {
    return null;
  }
}

async function tryGenerateWithGemini(input: GeneratePromptInput): Promise<GeneratePromptResult | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.includes("YOUR_")) {
    return null;
  }

  const modelName = process.env.PROMPT_LLM_MODEL || "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const normalizedOptions = normalizeOptions(input.styleOptions);
  const systemInstruction = [
    "You are a prompt engineer for hairstyle image generation.",
    "Return ONLY valid JSON with keys: prompt, negativePrompt.",
    "Prompt must be English and concise, photorealistic, hair-focused.",
    "Keep face identity unchanged and alter only hairstyle context.",
    "Do not include markdown or extra commentary.",
  ].join(" ");

  const payload = {
    userInput: cleanText(input.userInput),
    styleOptions: normalizedOptions,
    imageContext: input.imageContext ?? {},
    qualityPrefix: QUALITY_PREFIX,
    defaultNegativePrompt: DEFAULT_NEGATIVE_PROMPT,
  };

  const result = await model.generateContent(
    `${systemInstruction}\n\nInput JSON:\n${JSON.stringify(payload, null, 2)}`,
  );
  const text = result.response.text();
  const parsed = parseJsonFromLLM(text);
  if (!parsed) {
    return null;
  }

  return {
    prompt: parsed.prompt,
    negativePrompt: parsed.negativePrompt || DEFAULT_NEGATIVE_PROMPT,
    normalizedOptions,
    promptVersion: PROMPT_VERSION,
    model: modelName,
  };
}

export async function generatePrompt(input: GeneratePromptInput): Promise<GeneratePromptResult> {
  const normalizedInput = cleanText(input.userInput);
  if (normalizedInput.length < 2) {
    throw new Error("userInput must be at least 2 characters");
  }

  if (normalizedInput.length > 500) {
    throw new Error("userInput must be 500 characters or less");
  }

  const withGemini = await tryGenerateWithGemini({
    ...input,
    userInput: normalizedInput,
  }).catch(() => null);

  if (withGemini) {
    return withGemini;
  }

  return buildHeuristicPrompt({
    ...input,
    userInput: normalizedInput,
  });
}
