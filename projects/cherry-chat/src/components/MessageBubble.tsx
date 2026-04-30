import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Message } from '../types';

interface Props {
  message: Message;
}

function renderMarkdown(text: string): string {
  // Minimal markdown renderer
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(
    /```(\w*)\n?([\s\S]*?)```/g,
    (_m, _lang, code) =>
      `<pre><code>${code.trim()}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Blockquote
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered list
  html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);

  // Ordered list
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Paragraphs (double newline)
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      if (
        block.startsWith('<h') ||
        block.startsWith('<ul') ||
        block.startsWith('<ol') ||
        block.startsWith('<pre') ||
        block.startsWith('<blockquote') ||
        block.startsWith('<hr')
      ) {
        return block;
      }
      const inner = block.replace(/\n/g, '<br>');
      return `<p>${inner}</p>`;
    })
    .join('\n');

  return html;
}

export default function MessageBubble({ message }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`group flex items-start gap-3 py-2 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-7 h-7 rounded-full bg-[#e5e7eb] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[#374151] text-[10px] font-bold">You</span>
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white text-[10px] font-bold">AI</span>
        </div>
      )}

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {message.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`attachment-${i}`}
                className="max-w-[200px] max-h-[200px] rounded-lg border border-[#e5e7eb] object-cover"
              />
            ))}
          </div>
        )}

        {message.content && (
          <div
            className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              isUser
                ? 'text-white rounded-tr-sm'
                : 'bg-[#f9fafb] border border-[#e5e7eb] text-[#111827] rounded-tl-sm'
            }`}
            style={
              isUser
                ? {
                    background:
                      'linear-gradient(135deg, #4f46e5, #6366f1)',
                  }
                : undefined
            }
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div
                className="prose"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(message.content),
                }}
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] rounded transition-colors"
          >
            {copied ? (
              <Check size={11} className="text-[#10b981]" />
            ) : (
              <Copy size={11} />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {!isUser && (
            <span className="text-[10px] text-[#9ca3af]">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
