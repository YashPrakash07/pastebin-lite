"use client";

import { useState } from "react";
import PasteViewer from "./paste-viewer";
import { Lock, Loader2, AlertCircle } from "lucide-react";

interface PasswordGateProps {
    id: string;
    initialContent: string | null;
    initialLanguage: string | null;
}

export default function PasswordGate({ id, initialContent, initialLanguage }: PasswordGateProps) {
    const [content, setContent] = useState<string | null>(initialContent);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`/api/pastes/${id}`, {
                headers: {
                    "x-paste-password": password
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to unlock");
            }

            const data = await res.json();
            setContent(data.content);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Invalid password");
            }
        } finally {
            setLoading(false);
        }
    };

    if (content !== null) {
        return <PasteViewer content={content} language={initialLanguage} />;
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg border border-neutral-200">
            <div className="bg-neutral-100 p-4 rounded-full mb-4">
                <Lock className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Password Protected</h3>
            <p className="text-neutral-500 text-sm mb-6 max-w-xs">
                This paste is password protected. Please enter the password to view it.
            </p>

            <form onSubmit={handleUnlock} className="w-full max-w-sm px-4">
                <div className="flex flex-col gap-3">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full p-2.5 rounded-md border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none text-sm font-mono"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white p-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                        Unlock Paste
                    </button>
                    {error && (
                        <div className="text-red-500 text-xs flex items-center justify-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            {error}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
