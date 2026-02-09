import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { runReplicatePrediction } from "../../../../lib/replicate";

interface RunGenerationRequest {
  prompt?: string;
  negativePrompt?: string;
  imageDataUrl?: string;
  inputOverrides?: Record<string, unknown>;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as RunGenerationRequest;
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  if (prompt.length > 2000) {
    return NextResponse.json({ error: "prompt is too long" }, { status: 400 });
  }

  if (body.imageDataUrl && body.imageDataUrl.length > 12_000_000) {
    return NextResponse.json({ error: "imageDataUrl is too large" }, { status: 400 });
  }

  try {
    const result = await runReplicatePrediction({
      prompt,
      negativePrompt: body.negativePrompt?.trim(),
      imageDataUrl: body.imageDataUrl,
      inputOverrides: body.inputOverrides,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
