import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../lib/supabase";

interface SyncProfileRequest {
  email?: string;
  displayName?: string | null;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SyncProfileRequest;
  const email = body.email?.trim();
  const displayName = body.displayName?.trim() ?? null;

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const rpcParams = {
      p_user_id: userId,
      p_email: email,
      p_display_name: displayName,
    };
    const { data, error } = await (supabase as never as {
      rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
    }).rpc("ensure_user_profile", rpcParams);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
