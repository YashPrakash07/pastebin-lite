import { NextRequest, NextResponse } from "next/server";
import { getPaste } from "@/lib/storage";
import { getCurrentTime } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const now = getCurrentTime(req.headers);

  const paste = await getPaste(id, now);

  if (!paste) {
    return NextResponse.json({ error: "Paste not found or unavailable" }, { status: 404 });
  }

  return NextResponse.json({
    content: paste.content,
    remaining_views: paste.remaining_views ?? null, // if undefined or null, return null
    expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
  });
}
