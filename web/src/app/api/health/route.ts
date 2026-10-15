import { NextResponse } from "next/server";

/** Liveness/readiness probe for the web app (proxied API has its own /health). */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "greenvolt-web",
    time: new Date().toISOString(),
  });
}
