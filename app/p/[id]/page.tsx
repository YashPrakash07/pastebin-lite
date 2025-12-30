import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getPaste } from "@/lib/storage";
import { getCurrentTime } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PastePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const headerRequest = await headers();
    const now = getCurrentTime(headerRequest);

    const paste = await getPaste(id, now);

    if (!paste) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center">
                    <Link href="/" className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Create new paste
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">

                    <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Paste ID</span>
                            <span className="text-sm font-semibold text-neutral-900">{paste.id}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">Created</span>
                            <span className="text-sm text-neutral-700">
                                {new Date(paste.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 overflow-x-auto">
                        <pre className="font-mono text-sm text-neutral-800 whitespace-pre-wrap break-all">
                            {paste.content}
                        </pre>
                    </div>

                    {(paste.expires_at || paste.max_views) && (
                        <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-100 text-xs text-neutral-400 flex gap-4">
                            {paste.expires_at && (
                                <span>Expires: {new Date(paste.expires_at).toLocaleString()}</span>
                            )}
                            {paste.max_views && (
                                <span>Remaining Views: {paste.remaining_views !== null ? paste.remaining_views : 0} / {paste.max_views}</span>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
