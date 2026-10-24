import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  // Parse simple markdown lines cleanly
  const lines = content.split('\n');

  const renderFormattedText = (text: string) => {
    // Replace bold **text**
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-teal-800 font-mono text-xs border border-slate-200"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Code block check
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${idx}`} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-4">
            <pre className="text-xs font-mono text-teal-300 overflow-x-auto whitespace-pre">
              {codeBuffer.join('\n')}
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-base font-bold text-slate-900 mt-4 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-teal-600 rounded-sm inline-block"></span>
          {renderFormattedText(trimmed.replace('### ', ''))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={idx} className="text-sm font-semibold text-slate-800 mt-3 mb-1">
          {renderFormattedText(trimmed.replace('#### ', ''))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-lg font-bold text-slate-900 mt-5 mb-2 pb-1 border-b border-slate-100">
          {renderFormattedText(trimmed.replace('## ', ''))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-xl font-bold text-slate-900 mt-5 mb-3">
          {renderFormattedText(trimmed.replace('# ', ''))}
        </h1>
      );
      return;
    }

    // Blockquote / Tip
    if (trimmed.startsWith('> ')) {
      elements.push(
        <div
          key={idx}
          className="my-2 p-3 border-l-4 border-teal-500 bg-teal-50/50 rounded-r-md text-slate-700 text-sm italic"
        >
          {renderFormattedText(trimmed.replace('> ', ''))}
        </div>
      );
      return;
    }

    // Unordered lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={idx} className="ml-4 list-disc text-sm text-slate-700 my-1 leading-relaxed">
          {renderFormattedText(trimmed.replace(/^[-*]\s+/, ''))}
        </li>
      );
      return;
    }

    // Ordered lists
    if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <li key={idx} className="ml-5 list-decimal text-sm text-slate-700 my-1 leading-relaxed">
          {renderFormattedText(trimmed.replace(/^\d+\.\s+/, ''))}
        </li>
      );
      return;
    }

    // Empty lines
    if (trimmed === '') {
      elements.push(<div key={idx} className="h-2" />);
      return;
    }

    // Standard paragraphs
    elements.push(
      <p key={idx} className="text-sm text-slate-700 leading-relaxed my-1.5">
        {renderFormattedText(line)}
      </p>
    );
  });

  return <div className={`academic-markdown ${className}`}>{elements}</div>;
};
