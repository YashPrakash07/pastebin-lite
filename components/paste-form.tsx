"use client";

import { useState } from "react";
import { Loader2, Link as LinkIcon, AlertCircle, Check } from "lucide-react";


export default function PasteForm() {
    const [content, setContent] = useState("");
    const [ttl, setTtl] = useState("");
    const [maxViews, setMaxViews] = useState("");
    const [password, setPassword] = useState("");
    const [language, setLanguage] = useState("plaintext");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ id: string; url: string; delete_token?: string } | null>(null);
    const [urlCopied, setUrlCopied] = useState(false);
    const [tokenCopied, setTokenCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const body: { content: string; ttl_seconds?: number; max_views?: number; language?: string; password?: string } = { content };
            if (language && language !== "plaintext") {
                body.language = language;
            }
            if (ttl) {
                const ttlVal = parseInt(ttl);
                if (isNaN(ttlVal) || ttlVal < 1) throw new Error("Invalid TTL");
                body.ttl_seconds = ttlVal;
            }
            if (maxViews) {
                const viewsVal = parseInt(maxViews);
                if (isNaN(viewsVal) || viewsVal < 1) throw new Error("Invalid Max Views");
                body.max_views = viewsVal;
            }
            if (password) {
                body.password = password;
            }

            const res = await fetch("/api/pastes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create paste");
            }

            const data = await res.json();
            setResult(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-neutral-200 p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full text-green-600">
                        <Check className="w-8 h-8" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Paste Created!</h2>
                <p className="text-neutral-500 mb-6">Your paste is ready to share. Note availability constraints.</p>

                <div className="flex items-center gap-2 bg-neutral-100 p-3 rounded-md mb-6 border border-neutral-200">
                    <LinkIcon className="w-4 h-4 text-neutral-400 ml-2" />
                    <input
                        readOnly
                        value={result.url}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-neutral-800 font-mono"
                        onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(result.url);
                            setUrlCopied(true);
                            setTimeout(() => setUrlCopied(false), 2000);
                        }}
                        className="px-3 py-1.5 bg-white border border-neutral-300 rounded text-xs font-medium text-neutral-700 hover:bg-neutral-50 min-w-[60px] transition-all"
                    >
                        {urlCopied ? "Copied!" : "Copy"}
                    </button>
                </div>

                {result.delete_token && (
                    <div className="flex flex-col items-center gap-2 bg-red-50 p-3 rounded-md mb-6 border border-red-200">
                        <div className="flex items-center gap-2 w-full">
                            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Delete Token</span>
                            <input
                                readOnly
                                value={result.delete_token}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-red-800 font-mono"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(result.delete_token || "");
                                    setTokenCopied(true);
                                    setTimeout(() => setTokenCopied(false), 2000);
                                }}
                                className="px-2 py-1 bg-white border border-red-300 rounded text-[10px] font-medium text-red-700 hover:bg-red-50 min-w-[50px] transition-all"
                            >
                                {tokenCopied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                        <p className="text-[10px] text-red-400 w-full text-left">
                            Save this token! You need it to delete this paste manually.
                        </p>
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    <a href={result.url} target="_blank" className="text-blue-600 hover:underline text-sm font-medium">
                        View Paste
                    </a>
                    <button
                        onClick={() => {
                            setResult(null);
                            setContent("");
                            setTtl("");
                            setMaxViews("");
                            setPassword("");
                            setLanguage("plaintext");
                        }}
                        className="text-neutral-500 hover:text-neutral-900 text-sm font-medium"
                    >
                        Create Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
            <div className="bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
                <div className="p-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste your text here..."
                        className="w-full h-64 p-6 resize-y focus:outline-none text-neutral-900 font-mono text-sm placeholder-neutral-400"
                        required
                    />
                </div>

                <div className="bg-neutral-50 p-6 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                            Expiry (Seconds)
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder="Optional (e.g. 60)"
                            value={ttl}
                            onChange={(e) => setTtl(e.target.value)}
                            className="w-full p-2.5 rounded-md border border-neutral-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all text-neutral-900 placeholder-neutral-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                            Max Views
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder="Optional (e.g. 5)"
                            value={maxViews}
                            onChange={(e) => setMaxViews(e.target.value)}
                            className="w-full p-2.5 rounded-md border border-neutral-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all text-neutral-900 placeholder-neutral-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Optional"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2.5 rounded-md border border-neutral-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all text-neutral-900 placeholder-neutral-400"
                        />
                    </div>
                </div>

                <div className="bg-neutral-50 px-6 pb-6 border-neutral-100">
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                        Language (Syntax Highlighting)
                    </label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-2.5 rounded-md border border-neutral-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all bg-white text-neutral-900"
                    >
                        <option value="plaintext">Plain Text</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="csharp">C#</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="css">CSS</option>
                        <option value="html">HTML</option>
                        <option value="json">JSON</option>
                        <option value="sql">SQL</option>
                        <option value="bash">Bash</option>
                        <option value="yaml">YAML</option>
                    </select>
                </div>

                <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center">
                    {error && (
                        <div className="text-red-600 text-xs flex items-center gap-1.5 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {error}
                        </div>
                    )}
                    <div className="ml-auto">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Paste
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-center text-neutral-400 text-xs mt-6">
                Pastes are stored securely and removed automatically based on your constraints.
            </p>
        </form>
    );
}
