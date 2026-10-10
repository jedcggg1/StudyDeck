import React, { useMemo } from 'react';
import katex from 'katex';
import DOMPurify from 'dompurify';

interface MathMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Safely renders LaTeX math ($...$ and $$...$$) and standard Markdown
 * with DOMPurify HTML sanitization.
 */
export const MathMarkdown: React.FC<MathMarkdownProps> = ({ content, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    let text = content;

    // 1. Render Block Math ($$...$$)
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return `<div class="katex-block-wrapper my-3 overflow-x-auto">${katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false
        })}</div>`;
      } catch (err) {
        console.error('KaTeX block rendering error:', err);
        return `<div class="katex-error brutal-badge bg-red-100 text-red-700 p-2 border-2 border-black font-mono text-sm">${escapeHtml(math)}</div>`;
      }
    });

    // 2. Render Inline Math ($...$) - ensuring not escaped or parts of currency
    text = text.replace(/(?<!\\)\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return `<span class="katex-inline-wrapper">${katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false
        })}</span>`;
      } catch (err) {
        console.error('KaTeX inline rendering error:', err);
        return `<code class="bg-red-50 text-red-600 px-1 border border-black">${escapeHtml(math)}</code>`;
      }
    });

    // 3. Process Markdown structures
    // Code blocks
    text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="brutal-code-block my-3 p-3 bg-zinc-900 text-green-400 font-mono text-sm border-2 border-black rounded shadow-[2px_2px_0px_#111] overflow-x-auto"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-zinc-100 border border-black font-mono text-xs rounded text-zinc-900">$1</code>');

    // Headers
    text = text.replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold text-zinc-900 mt-3 mb-1">$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-zinc-900 mt-4 mb-2 tracking-tight">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="text-xl font-extrabold text-zinc-900 mt-4 mb-2 tracking-tight">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-zinc-900 mt-5 mb-3 tracking-tight">$1</h1>');

    // Bold & Italics
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-zinc-900">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Blockquotes
    text = text.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-black pl-3 py-1 my-2 bg-amber-50 font-medium text-zinc-700 italic">$1</blockquote>');

    // Unordered lists
    text = text.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-zinc-800 my-0.5">$1</li>');

    // Wrap sequences of <li> in <ul>
    text = text.replace(/(<li class="ml-4 list-disc text-zinc-800 my-0.5">.*<\/li>\s*)+/g, '<ul class="my-2 space-y-0.5">$&</ul>');

    // Line breaks for remaining non-block newlines
    text = text.replace(/\n\n/g, '<div class="h-3"></div>');

    // 4. Sanitize with DOMPurify
    return DOMPurify.sanitize(text, {
      ADD_TAGS: ['math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mover', 'munder', 'msqrt', 'annotation'],
      ADD_ATTR: ['display', 'xmlns', 'viewBox', 'aria-hidden', 'encoding']
    });
  }, [content]);

  return (
    <div
      className={`prose-neo-brutalist leading-relaxed text-zinc-900 font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
