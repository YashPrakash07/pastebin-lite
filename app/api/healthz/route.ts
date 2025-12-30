import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/storage";

export async function GET() {
  const isHealthy = await checkHealth();
  // Note: "Should reflect whether the application can access its persistence layer"
  // If not healthy, maybe still return 200 with ok:false or 503?
  // Requirements: "Must return HTTP 200".
  // So we return 200, but maybe payload indicates status?
  // Example response: { "ok": true }.
  // If KV is down, we probably return { "ok": false }.
  
  return NextResponse.json({ ok: isHealthy }, { status: 200 });
}
