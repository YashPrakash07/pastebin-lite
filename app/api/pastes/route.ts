import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { savePaste, Paste } from "@/lib/storage";
import { getCurrentTime } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, ttl_seconds, max_views, language } = body;

    // Validation
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required and must be a non-empty string." }, { status: 400 });
    }

    if (ttl_seconds !== undefined && (typeof ttl_seconds !== "number" || ttl_seconds < 1)) {
        return NextResponse.json({ error: "ttl_seconds must be a number >= 1." }, { status: 400 });
    }

    if (max_views !== undefined && (typeof max_views !== "number" || max_views < 1)) {
        return NextResponse.json({ error: "max_views must be a number >= 1." }, { status: 400 });
    }
    
    // Optional language validation (basic string check)
    if (language !== undefined && typeof language !== "string") {
        return NextResponse.json({ error: "Language must be a string." }, { status: 400 });
    }

    const id = nanoid(10); // Short ID
    const delete_token = nanoid(24); // Secret delete token
    const now = getCurrentTime(req.headers);
    const expires_at = ttl_seconds ? now + (ttl_seconds * 1000) : null;

    const newPaste: Paste = {
      id,
      content,
      created_at: now,
      expires_at,
      max_views: max_views || undefined,
      language: language || null,
      delete_token
    };

    await savePaste(newPaste);

    // Construct URL
    const url = new URL(`/p/${id}`, req.url).toString();

    return NextResponse.json({ id, url, delete_token }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
