"use client";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
// Import languages individually to keep bundle size smaller if desired, 
// or use normal import if bundling is handled well.
// Using defaults for simplicity in "lite" app but typically you import specific ones.

export default function PasteViewer({ content, language }: { content: string, language: string | null }) {
    if (!language || language === "plaintext") {
        return (
            <pre className="font-mono text-sm text-neutral-800 whitespace-pre-wrap break-all">
                {content}
            </pre>
        );
    }

    return (
        <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{ background: 'transparent', padding: 0 }}
            wrapLongLines={true}
        >
            {content}
        </SyntaxHighlighter>
    );
}
