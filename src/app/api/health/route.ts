import { NextResponse } from "next/server";
export function GET() {
  return NextResponse.json(
    { status: "ok", phase: 2 },
    { headers: { "Cache-Control": "no-store" } },
  );
}
