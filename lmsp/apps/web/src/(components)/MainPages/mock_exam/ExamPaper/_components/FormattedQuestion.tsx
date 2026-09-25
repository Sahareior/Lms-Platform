import React, { useMemo } from 'react';
import { useTheme } from '../../../../../theme/ThemeContext';


export interface ParsedQuestion {
  intro: string;
  statements: string[];
  conclusion: string;
  codeBlock?: string;
}

export function parseQuestionText(rawText: string): ParsedQuestion | null {
  if (!rawText || typeof rawText !== 'string') return null;

  // Markers may be attached to the previous text, e.g. `R=0ii.`.
  const markerRegex = /\(?\s*(?:i{1,3}|iv|v|vi{0,3}|ix|x)\s*[.)]|\(?\s*[১-৯]\s*[.)]|\([১-৯]\)/gi;
  const conclusionRegex = /(নিচের\s+কোনটি\s+সঠিক\??|উপরের\s+কোনটি\s+সঠিক\??|প্রোগ্রামটির\s+আউটপুট\s+কোনটি\??|which\s+(?:one\s+)?of\s+the\s+following\s+is\s+correct\??)/i;
  const conclusionMatch = rawText.match(conclusionRegex);
  const content = conclusionMatch?.index !== undefined
    ? rawText.slice(0, conclusionMatch.index).trim()
    : rawText.trim();
  const conclusion = conclusionMatch?.[0].trim() || '';
  const matches = [...content.matchAll(markerRegex)];

  if (matches.length >= 2) {
    const firstMatch = matches[0];
    const intro = content.slice(0, firstMatch.index).trim();
    const statements: string[] = [];

    for (let i = 0; i < matches.length; i++) {
      const startIdx = matches[i].index!;
      const endIdx = i < matches.length - 1 ? matches[i + 1].index! : content.length;
      const statement = content.slice(startIdx, endIdx).trim();
      if (statement) statements.push(statement);
    }

    return { intro, statements, conclusion };
  }

  // Keep compact C/C++/Java-style snippets readable instead of joining them
  // to the question's final prompt.
  if (conclusion && /#include|\bmain\s*\(/i.test(content)) {
    return { intro: '', statements: [], conclusion, codeBlock: formatCodeBlock(content) };
  }

  return null;
}

function formatCodeBlock(code: string): string {
  let parentheses = 0;
  let formatted = '';

  for (const character of code.trim()) {
    if (character === '(') parentheses += 1;
    if (character === ')') parentheses = Math.max(0, parentheses - 1);

    if (character === '{') {
      formatted = `${formatted.trimEnd()} {\n`;
    } else if (character === '}') {
      formatted = `${formatted.trimEnd()}\n}\n`;
    } else if (character === ';' && parentheses === 0) {
      formatted = `${formatted.trimEnd()};\n`;
    } else {
      formatted += character;
    }
  }

  return formatted
    .replace(/\)\s*(?=[A-Za-z#])/g, ')\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

export interface FormattedQuestionProps {
  text: string;
  className?: string;
  statementClassName?: string;
  conclusionClassName?: string;
}

export const FormattedQuestion: React.FC<FormattedQuestionProps> = ({
  text,
  className = '',
  statementClassName = '',
  conclusionClassName = '',
}) => {
  const parsed = useMemo(() => parseQuestionText(text), [text]);
  const { isDark } = useTheme();

  if (!parsed) {
    return (
      <span className={`whitespace-pre-line ${isDark ? className : `font-serif ${className}`}`}>
        {text}
      </span>
    );
  }

  // ─── LIGHT MODE (Vintage Paper Style) ───────────────────────
  if (!isDark) {
    return (
      <div className={`space-y-2.5 font-serif ${className}`}>
        {parsed.codeBlock && (
          <pre className="overflow-x-auto rounded-md border border-[#d8d4cb] bg-[#e0dcd5] p-3 text-sm leading-relaxed text-[#1a1a1a] whitespace-pre-wrap font-mono shadow-[2px_2px_0px_0px_#1a1a1a]">
            <code>{parsed.codeBlock}</code>
          </pre>
        )}
        {parsed.intro && (
          <div className="leading-relaxed text-[#1a1a1a]">{parsed.intro}</div>
        )}
        {parsed.statements.length > 0 && (
          <div className="space-y-1.5 pl-3 border-l-2 border-[#b91c1c] my-2">
            {parsed.statements.map((stmt, idx) => (
              <div
                key={idx}
                className={`leading-relaxed text-[#1a1a1a] font-normal ${statementClassName}`}
              >
                {stmt}
              </div>
            ))}
          </div>
        )}
        {parsed.conclusion && (
          <div
            className={`leading-relaxed font-bold text-[#1a1a1a] pt-1 ${conclusionClassName}`}
          >
            {parsed.conclusion}
          </div>
        )}
      </div>
    );
  }

  // ─── DARK MODE (Original Code - Unchanged) ─────────────────
  return (
    <div className={`space-y-2.5 ${className}`}>
      {parsed.codeBlock && (
        <pre className="overflow-x-auto rounded-lg border border-[#2D3440] bg-[#0B0D12] p-3 text-sm leading-relaxed text-[#C9D0DA] whitespace-pre-wrap">
          <code>{parsed.codeBlock}</code>
        </pre>
      )}
      {parsed.intro && (
        <div className="leading-relaxed">{parsed.intro}</div>
      )}
      {parsed.statements.length > 0 && (
        <div className="space-y-1.5 pl-3 border-l-2 border-[#9B51E0]/50 my-2">
          {parsed.statements.map((stmt, idx) => (
            <div
              key={idx}
              className={`leading-relaxed text-[#E2E8F0] font-normal ${statementClassName}`}
            >
              {stmt}
            </div>
          ))}
        </div>
      )}
      {parsed.conclusion && (
        <div
          className={`leading-relaxed font-medium text-[#F5F7FA] pt-1 ${conclusionClassName}`}
        >
          {parsed.conclusion}
        </div>
      )}
    </div>
  );
};

export default FormattedQuestion;