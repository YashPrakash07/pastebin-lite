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
            <div className="w-full max-w-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/50 dark:border-neutral-800 p-6 sm:p-10 text-center animate-in fade-in zoom-in duration-500 hover:shadow-indigo-500/20 transition-all mx-4">
                <div className="flex justify-center mb-8">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 p-4 rounded-full text-green-600 dark:text-green-400 shadow-inner ring-4 ring-green-50 dark:ring-green-900/10">
                        <Check className="w-10 h-10" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 tracking-tight">Paste Created!</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-lg">Your paste is ready to share.</p>

                <div className="flex items-center gap-3 bg-neutral-50/80 dark:bg-neutral-800/50 p-4 rounded-2xl mb-6 border border-neutral-200/60 dark:border-neutral-700 shadow-sm group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                    <LinkIcon className="w-5 h-5 text-neutral-400 ml-1 group-hover:text-indigo-500 transition-colors shrink-0" />
                    <input
                        readOnly
                        value={result.url}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-base text-neutral-800 dark:text-neutral-200 font-mono min-w-0"
                        onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(result.url);
                            setUrlCopied(true);
                            setTimeout(() => setUrlCopied(false), 2000);
                        }}
                        className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 min-w-[80px] transition-all shadow-sm active:scale-95 shrink-0"
                    >
                        {urlCopied ? "Copied!" : "Copy"}
                    </button>
                </div>

                {result.delete_token && (
                    <div className="flex flex-col items-center gap-3 bg-red-50/50 dark:bg-red-900/10 p-4 rounded-2xl mb-8 border border-red-100/60 dark:border-red-900/30">
                        <div className="flex items-center gap-3 w-full">
                            <span className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-md shrink-0">Delete Token</span>
                            <input
                                readOnly
                                value={result.delete_token}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-red-800 dark:text-red-300 font-mono min-w-0"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(result.delete_token || "");
                                    setTokenCopied(true);
                                    setTimeout(() => setTokenCopied(false), 2000);
                                }}
                                className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[60px] transition-all shadow-sm active:scale-95 shrink-0"
                            >
                                {tokenCopied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                        <p className="text-xs text-red-400 dark:text-red-500/80 w-full text-left pl-1">
                            Save this token! You need it to delete this paste manually.
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <a
                        href={result.url}
                        target="_blank"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
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
                        className="inline-flex items-center justify-center px-6 py-3 border border-neutral-200 dark:border-neutral-700 text-base font-medium rounded-xl text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors shadow-sm"
                    >
                        Create Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl relative z-10">
            <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/60 dark:border-neutral-800 overflow-hidden ring-1 ring-black/5 dark:ring-white/5 hover:shadow-indigo-500/20 transition-all duration-500">
                <div className="p-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste your text here..."
                        className="w-full h-64 sm:h-96 p-4 sm:p-6 resize-y bg-neutral-50/50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none text-neutral-800 dark:text-neutral-200 font-mono text-base placeholder-neutral-400 leading-relaxed transition-all"
                        required
                        spellCheck={false}
                    />
                </div>

                <div className="bg-gradient-to-b from-white/50 to-white/80 dark:from-neutral-900/50 dark:to-neutral-900/80 p-6 sm:p-8 border-t border-neutral-100 dark:border-neutral-800 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">
                                Language
                            </label>
                            <div className="relative group">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all text-neutral-700 dark:text-neutral-300 appearance-none font-medium hover:border-indigo-300 dark:hover:border-indigo-700"
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
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">
                                Expiry (Seconds)
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Optional (e.g. 60)"
                                value={ttl}
                                onChange={(e) => setTtl(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 hover:border-indigo-300 dark:hover:border-indigo-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">
                                Max Views
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Optional (e.g. 5)"
                                value={maxViews}
                                onChange={(e) => setMaxViews(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 hover:border-indigo-300 dark:hover:border-indigo-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Optional"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 hover:border-indigo-300 dark:hover:border-indigo-700"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="h-6">
                            {error && (
                                <div className="text-red-500 text-xs font-medium flex items-center gap-1.5 animate-in slide-in-from-left-2 fade-in duration-300 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 bg-neutral-900 dark:bg-neutral-800 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 dark:focus:ring-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 overflow-hidden w-full sm:w-auto"
                        >
                            <span className="relative flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Create Paste
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-center text-neutral-400 text-sm mt-8 font-medium">
                Pastes are <span className="text-indigo-500/80">encrypted</span> and removed automatically.
            </p>
        </form>
    );
}
