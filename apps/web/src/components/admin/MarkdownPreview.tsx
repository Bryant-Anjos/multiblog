"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "160px",
        padding: "0.5rem",
        border: "1px solid #d9d5ce",
        borderRadius: "4px",
        fontSize: "0.9rem",
        overflowY: "auto",
        maxHeight: "400px",
      }}
    >
      <div className="markdown-preview">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*Nothing to preview yet.*"}</ReactMarkdown>
      </div>
      <style jsx global>{`
        .markdown-preview h1, .markdown-preview h2, .markdown-preview h3 {
          font-family: 'Lora', Georgia, serif;
          color: #37352f;
          line-height: 1.3;
          margin: 1em 0 0.4em;
        }
        .markdown-preview p { margin: 0.5em 0; }
        .markdown-preview ul, .markdown-preview ol { margin: 0.5em 0; padding-left: 1.4em; }
        .markdown-preview a { color: #d4a373; }
        .markdown-preview pre {
          background: #f4f0ea;
          padding: 0.75rem;
          border-radius: 6px;
          overflow-x: auto;
        }
        .markdown-preview code {
          font-family: monospace; font-size: 0.85em;
        }
        .markdown-preview blockquote {
          border-left: 3px solid #d4a373;
          margin: 0.75em 0;
          padding-left: 1em;
          color: #7c6f64;
        }
      `}</style>
    </div>
  );
}
