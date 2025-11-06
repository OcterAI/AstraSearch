import React, { useMemo } from 'react';

// Declare katex as a global variable to satisfy TypeScript
declare const katex: any;

interface RenderWithLatexProps {
  text: string;
}

const RenderWithLatex: React.FC<RenderWithLatexProps> = ({ text }) => {
  const parts = useMemo(() => {
    // Return plain text if katex is not loaded yet
    if (typeof katex === 'undefined') {
      return [{ type: 'text', content: text }];
    }

    // Regex to find and capture LaTeX blocks
    const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
    return text.split(regex).map((part) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return {
          type: 'math',
          content: part.substring(2, part.length - 2),
          display: true, // Display mode for $$
        };
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        return {
          type: 'math',
          content: part.substring(1, part.length - 1),
          display: false, // Inline mode for $
        };
      }
      return { type: 'text', content: part };
    }).filter(p => p.content); // Remove empty parts
  }, [text]);

  return (
    <div className="text-lg leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, index) => {
        if (part.type === 'math') {
          try {
            const html = katex.renderToString(part.content, {
              throwOnError: false,
              displayMode: part.display,
            });
            // Use a span for both inline and display math to maintain flow
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (error) {
            console.error("KaTeX rendering error:", error);
            // Fallback to showing the raw content on error
            return <span key={index}>{part.content}</span>;
          }
        }
        return <span key={index}>{part.content}</span>;
      })}
    </div>
  );
};

export default RenderWithLatex;