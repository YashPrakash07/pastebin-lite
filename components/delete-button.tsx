"use client";

import { useState } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeletePasteButton({ id }: { id: string }) {
    const [showInput, setShowInput] = useState(false);
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/pastes/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ delete_token: token }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete");
            }

            // Redirect home
            router.push("/");
            router.refresh();

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Unknown error");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!showInput) {
        return (
            <button
                onClick={() => setShowInput(true)}
                className="text-neutral-400 hover:text-red-600 transition-colors"
                title="Delete Paste"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        );
    }

    return (
        <div className="absolute top-16 right-6 bg-white shadow-xl border border-neutral-200 p-4 rounded-lg z-10 w-64 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xs font-bold text-neutral-900 mb-2 uppercase tracking-wide">Delete Paste</h3>
            <input
                type="text"
                placeholder="Enter Delete Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full text-xs p-2 border border-neutral-300 rounded mb-2 focus:border-red-500 outline-none"
            />
            {error && <p className="text-[10px] text-red-600 mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setShowInput(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-800 px-2 py-1"
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    disabled={loading || !token}
                    className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? "..." : "Delete"}
                </button>
            </div>
        </div>
    );
}
