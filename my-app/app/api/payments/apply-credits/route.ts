import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../lib/supabase";

interface ApplyCreditsRequest {
  paymentTransactionId?: string;
  reason?: string;
}

const uuidV4LikeRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isInternalRequest(request: Request) {
  const expected = process.env.INTERNAL_API_SECRET;
  if (!expected) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${expected}`;
}

export async function POST(request: Request) {
  if (!isInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ApplyCreditsRequest;
  const paymentTransactionId = body.paymentTransactionId?.trim();
  const reason = body.reason?.trim() || "payment_confirmed";

  if (!paymentTransactionId || !uuidV4LikeRegex.test(paymentTransactionId)) {
    return NextResponse.json(
      { error: "paymentTransactionId must be a valid UUID" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdminClient();
    const rpcParams = {
      p_payment_transaction_id: paymentTransactionId,
      p_reason: reason,
    };
    const { data, error } = await (supabase as never as {
      rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
    }).rpc("apply_payment_credits", rpcParams);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ledgerId: data }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
