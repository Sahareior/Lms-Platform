import React, { useMemo } from 'react';

export interface ParsedQuestion {
  intro: string;
  statements: string[];
  conclusion: string;
}

export function parseQuestionText(rawText: string): ParsedQuestion | null {
  if (!rawText || typeof rawText !== 'string') return null;

  // Regex for Roman numerals / Bengali numbers / standard numbering markers:
  // e.g.: "i.", "ii.", "iii.", "iv.", "(i)", "(ii)", "i)", "ii)", "I.", "II.", "১.", "২.", "৩.", "১)", "২)", "(১)"
  const markerRegex = /(?:^|\s)(?:(\(?\s*(?:i{1,3}|iv|v|vi{0,3}|ix|x)\s*[\.\)])|(\((?:i{1,3}|iv|v|vi{0,3}|ix|x)\))|(\(?\s*[১-৯]\s*[\.\)])|(\([১-৯]\)))(?=\s|\b|$)/gi;

  const matches = [...rawText.matchAll(markerRegex)];

  // We consider it a multi-statement question if at least 2 markers (e.g. i. and ii.) are present
  if (matches.length >= 2) {
    const firstMatch = matches[0];
    const intro = rawText.slice(0, firstMatch.index).trim();
    const afterIntro = rawText.slice(firstMatch.index).trim();

    // Look for concluding prompt at the end
    // e.g. "নিচের কোনটি সঠিক?", "নিচের কোনটি সঠিক", "কোনটি সঠিক?", "উপরের কোনটি সঠিক?", "Which of the following is correct?", etc.
    const conclusionRegex = /\s*(?:(?:নিচের|উপরের|কোনটি|কোনগুলো)\s+(?:কোনটি|কোনগুলো|সঠিক).*|which\s+(?:one\s+)?of\s+the\s+following\s+is\s+correct\??.*)$/i;

    const conclusionMatch = afterIntro.match(conclusionRegex);

    let statementsSection = afterIntro;
    let conclusion = '';

    if (conclusionMatch && conclusionMatch.index !== undefined) {
      conclusion = conclusionMatch[0].trim();
      statementsSection = afterIntro.slice(0, conclusionMatch.index).trim();
    }

    // Now re-find marker positions inside statementsSection
    const statementMatches = [...statementsSection.matchAll(markerRegex)];
    const statements: string[] = [];

    for (let i = 0; i < statementMatches.length; i++) {
      const current = statementMatches[i];
      const startIdx = current.index!;
      const endIdx =
        i < statementMatches.length - 1
          ? statementMatches[i + 1].index!
          : statementsSection.length;
      const stmt = statementsSection.slice(startIdx, endIdx).trim();
      if (stmt) {
        statements.push(stmt);
      }
    }

    if (statements.length >= 2) {
      return {
        intro,
        statements,
        conclusion,
      };
    }
  }

  return null;
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

  if (!parsed) {
    return <span className={`whitespace-pre-line ${className}`}>{text}</span>;
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
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
