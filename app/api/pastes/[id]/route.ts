import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
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
    remaining_views: paste.remaining_views ?? null, 
    expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null,
    language: paste.language || null
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { delete_token } = await req.json();

    if (!delete_token) {
        return NextResponse.json({ error: "Missing delete_token" }, { status: 400 });
    }

    const key = `paste:${id}`;
    
    // Check if paste exists and token matches
    // We can do this in one Lua script or two calls. 
    // Two calls is okay here since we aren't racing view counts.
    
    // We fetch the stored token field.
    const storedToken = await kv.hget(key, "delete_token");
    
    if (!storedToken) {
         // Paste doesn't exist OR it has no delete token (unlikely if created via new form)
         // or it's just wrong ID.
         return NextResponse.json({ error: "Paste not found or cannot be deleted" }, { status: 404 });
    }
    
    if (storedToken !== delete_token) {
        return NextResponse.json({ error: "Invalid delete_token" }, { status: 403 });
    }

    // Token matches, delete the key.
    await kv.del(key);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
