import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { verifyPromptArtifactToken } from "../../../../lib/prompt-artifact-token";
import { runGeminiImageGeneration } from "../../../../lib/gemini-image";

interface RunGenerationRequest {
  prompt?: string;
  promptArtifactToken?: string;
  productRequirements?: string;
  researchReport?: string;
  imageDataUrl?: string;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as RunGenerationRequest;
  const prompt = body.prompt?.trim();
  const promptArtifactToken = body.promptArtifactToken?.trim();
  const productRequirements = body.productRequirements?.trim();
  const researchReport = body.researchReport?.trim();

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  if (!promptArtifactToken) {
    return NextResponse.json({ error: "promptArtifactToken is required" }, { status: 400 });
  }

  if (prompt.length > 20_000) {
    return NextResponse.json({ error: "prompt is too long" }, { status: 400 });
  }

  if (productRequirements && productRequirements.length > 30_000) {
    return NextResponse.json({ error: "productRequirements is too long" }, { status: 400 });
  }

  if (researchReport && researchReport.length > 30_000) {
    return NextResponse.json({ error: "researchReport is too long" }, { status: 400 });
  }

  if (body.imageDataUrl && body.imageDataUrl.length > 12_000_000) {
    return NextResponse.json({ error: "imageDataUrl is too large" }, { status: 400 });
  }

  if (!body.imageDataUrl) {
    return NextResponse.json({ error: "imageDataUrl is required" }, { status: 400 });
  }

  try {
    const verification = verifyPromptArtifactToken({
      token: promptArtifactToken,
      userId,
      prompt,
      productRequirements: productRequirements || null,
      researchReport: researchReport || null,
    });
    if (!verification.ok) {
      return NextResponse.json({ error: "Invalid prompt artifact token" }, { status: 400 });
    }

    const result = await runGeminiImageGeneration({
      prompt,
      productRequirements,
      researchReport,
      imageDataUrl: body.imageDataUrl,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
