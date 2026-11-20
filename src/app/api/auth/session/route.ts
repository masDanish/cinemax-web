import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import type { SessionResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/** Backend tidak punya /me, jadi sesi dibaca dari cookie frontend. */
export async function GET() {
  const session = await getSession();
  return NextResponse.json<SessionResponse>(
    { user: session?.user ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
