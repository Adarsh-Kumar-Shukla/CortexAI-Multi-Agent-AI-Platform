
import { Check, Copy, ExternalLink, X } from "lucide-react";
import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const MessageBubble = ({ role, content = "", images = [] }) => {
  const isUser = role === "user";
  const [lightBox, setLightBox] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`w-fit max-w-[92vw] md:max-w-[72%] px-4 py-2.5 rounded-2xl break-words overflow-hidden leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-red-500 to-violet-700 text-white rounded-tr-sm"
            : "text-slate-200 rounded-tl-sm"
        }`}
      >
        {/* Images */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {images.map((img, i) => (
              <img
                src={img}
                key={i}
                loading="lazy"
                alt={`Attachment ${i + 1}`}
                onClick={() => setLightBox(img)}
                onError={(e) => e.currentTarget.remove()}
                className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
              />
            ))}
          </div>
        )}

        {/* Markdown content */}
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-5 mb-3">
                {children}
              </h1>
            ),

            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mt-4 mb-2">
                {children}
              </h2>
            ),

            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mt-3 mb-2">
                {children}
              </h3>
            ),

            p: ({ children }) => (
              <p className="mb-3 whitespace-pre-wrap break-words">
                {children}
              </p>
            ),

            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1 my-2">
                {children}
              </ul>
            ),

            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1 my-2">
                {children}
              </ol>
            ),

            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-indigo-400/60 pl-4 my-3 text-slate-400">
                {children}
              </blockquote>
            ),

            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-white/10">
                  {children}
                </table>
              </div>
            ),

            th: ({ children }) => (
              <th className="border border-white/10 bg-white/5 px-3 py-2 text-left">
                {children}
              </th>
            ),

            td: ({ children }) => (
              <td className="border border-white/10 px-3 py-2">
                {children}
              </td>
            ),

            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 underline inline-flex items-center gap-1"
              >
                {children}
                <ExternalLink size={14} />
              </a>
            ),

            // Inline code and fenced code blocks
            code: ({ className, children, ...props }) => {
              const match = /language-([\w-]+)/.exec(className || "");
              const value = String(children).replace(/\n$/, "");

              // Inline code: `console.log("Hello")`
              if (!match) {
                return (
                  <code
                    {...props}
                    className="px-1.5 py-0.5 rounded bg-white/10 text-pink-400"
                  >
                    {children}
                  </code>
                );
              }

              const language = match[1];

              // Fenced code block with syntax highlighting
              return (
                <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
                  <div className="flex items-center justify-between bg-[#1b1d24] border-b border-white/10 px-4 py-2">
                    <span className="uppercase text-xs text-slate-400">
                      {language}
                    </span>

                    <button
                      type="button"
                      onClick={() => copyCode(value)}
                      className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition"
                    >
                      {copiedCode === value ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "16px",
                      background: "transparent",
                      overflowX: "auto",
                      fontSize: "14px",
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                      },
                    }}
                  >
                    {value}
                  </SyntaxHighlighter>
                </div>
              );
            },
            img:({src})=>{
              if(!src)return null
              return (
                <img
                  src={src}
                  loading="lazy"
                  onClick={() => setLightBox(src)}
                  onError={(e) => e.currentTarget.remove()}
                  className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
                />
              )
            }
          }}
        >
          {content}
        </Markdown>
      </div>

      {/* Image lightbox */}
      {lightBox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightBox(null)}
        >
          <button
            type="button"
            aria-label="Close image preview"
            className="absolute top-5 right-5 text-white/80 hover:text-white rounded-full p-2"
            onClick={() => setLightBox(null)}
          >
            <X size={24} />
          </button>

          <img
            src={lightBox}
            alt="Full-size preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] border border-white/10 shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
