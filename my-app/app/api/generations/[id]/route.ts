import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../lib/supabase";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "prediction id is required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient() as unknown as {
      from: (table: string) => {
        select: (columns: string) => {
          eq: (column: string, value: string) => {
            maybeSingle: () => Promise<{
              data: Record<string, unknown> | null;
              error: { message: string } | null;
            }>;
          };
        };
      };
    };

    const { data, error } = await supabase
      .from("generations")
      .select("id,user_id,status,error_message,generated_image_path,options")
      .eq("id", id.trim())
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    const ownerId = typeof data.user_id === "string" ? data.user_id : "";
    if (ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        id: typeof data.id === "string" ? data.id : id,
        status: typeof data.status === "string" ? data.status : "failed",
        error: typeof data.error_message === "string" ? data.error_message : null,
        generatedImagePath:
          typeof data.generated_image_path === "string" ? data.generated_image_path : null,
        options:
          typeof data.options === "object" && data.options !== null ? data.options : null,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
