import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getPaste } from "@/lib/storage";
import { getCurrentTime } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PasswordGate from "@/components/password-gate";
import DeletePasteButton from "@/components/delete-button";

export default async function PastePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const headerRequest = await headers();
    const now = getCurrentTime(headerRequest);

    const result = await getPaste(id, now);

    if (result.status === "NOT_FOUND") {
        notFound();
    }

    if (result.status === "EXPIRED") {
        return (
            <div className="w-full max-w-lg mx-auto mt-20 text-center px-4">
                <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
                    <span className="text-4xl">⌛</span>
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Paste Expired</h1>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
                    This paste stored at <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm mx-1">{id}</span> has reached its expiration time and is no longer available.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                    Create New Paste
                </Link>
            </div>
        );
    }

    if (result.status === "LIMIT_REACHED") {
        return (
            <div className="w-full max-w-lg mx-auto mt-20 text-center px-4">
                <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
                    <span className="text-4xl">👁️</span>
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">View Limit Reached</h1>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
                    This paste stored at <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm mx-1">{id}</span> has exceeded its maximum allowed views and is no longer available.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                    Create New Paste
                </Link>
            </div>
        );
    }

    // At this point status is OK, so result.paste exists
    const paste = result.paste!;

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="mb-6 flex items-center">
                <Link href="/" className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Create new paste
                </Link>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">

                <div className="bg-neutral-50 dark:bg-neutral-950 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center relative">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">Paste ID</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{paste.id}</span>
                            {paste.language && (
                                <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 rounded-full font-medium">
                                    {paste.language}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-500 uppercase tracking-wider block">Created</span>
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                {new Date(paste.created_at).toLocaleString()}
                            </span>
                        </div>
                        <DeletePasteButton id={paste.id} />
                    </div>
                </div>

                <div className="p-6 overflow-x-auto">
                    <PasswordGate
                        id={paste.id}
                        initialContent={!!paste.password_hash ? null : paste.content}
                        initialLanguage={paste.language || "plaintext"}
                    />
                </div>

                {(paste.expires_at || paste.max_views) && (
                    <div className="bg-neutral-50 dark:bg-neutral-950 px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 dark:text-neutral-500 flex gap-4">
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
    );
}
