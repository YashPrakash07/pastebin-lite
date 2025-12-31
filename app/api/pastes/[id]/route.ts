import { NextRequest, NextResponse } from "next/server";
import { getPaste, deletePaste, decrementViews } from "@/lib/storage";
import { compare } from "bcryptjs";
import { getCurrentTime } from "@/lib/utils";

export async function GET(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const password = req.headers.get("x-paste-password");

    if (!password) {
        return NextResponse.json({ error: "Password required" }, { status: 401 });
    }

    const now = getCurrentTime(req.headers);
    const result = await getPaste(id, now);

    if (result.status !== "OK") {
        if (result.status === "EXPIRED" || result.status === "LIMIT_REACHED") {
             return NextResponse.json({ error: "Paste no longer available" }, { status: 410 });
        }
        return NextResponse.json({ error: "Paste not found" }, { status: 404 });
    }

    const paste = result.paste;

    if (!paste.password_hash) {
        // Not password protected, just return content (this endpoint shouldn't really be used for this but ok)
        return NextResponse.json({ content: paste.content });
    }

    const match = await compare(password, paste.password_hash);
    if (!match) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Decrement views now that we successfully unlocked it
    if (paste.max_views) {
        const remaining = await decrementViews(id);
        if (!remaining) {
            return NextResponse.json({ error: "Paste no longer available" }, { status: 410 });
        }
    }

    return NextResponse.json({ content: paste.content });
}

export async function DELETE(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { delete_token } = body;

        if (!delete_token) {
            return NextResponse.json({ error: "Delete token required" }, { status: 400 });
        }

        const success = await deletePaste(id, delete_token);

        if (!success) {
            return NextResponse.json({ error: "Invalid token or paste not found" }, { status: 403 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
