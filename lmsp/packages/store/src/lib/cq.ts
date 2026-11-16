/**
 * Platform-agnostic helpers for Creative Question (CQ / সৃজনশীল প্রশ্ন) sets.
 * Mirrors the web reading page so both apps classify and label sources the
 * same way.
 */

import type { CQQuestion } from '../redux/api/creativeQuestionApi';

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '';
  return String(num).replace(/[0-9]/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

export type CQSourceCategory = 'board' | 'cadet' | 'college';

export function getSourceCategory(q: CQQuestion): CQSourceCategory {
  const board = (q.source?.board || '').toLowerCase();
  const raw = (q.source?.raw || '').toLowerCase();

  if (board.includes('ক্যাডেট') || raw.includes('ক্যাডেট')) return 'cadet';

  const isBoardExam =
    q.source?.kind === 'board' ||
    board.includes('বোর্ড') ||
    raw.includes('বোর্ড') ||
    /ঢাকা|ময়মনসিংহ|ময়মনসিংহ|রাজশাহী|কুমিল্লা|চট্টগ্রাম|সিলেট|যশোর|বরিশাল|দিনাজপুর|মাদরাসা/.test(
      board
    );

  const isCollegeName = /কলেজ|স্কুল|মহাবিদ্যালয়|একাডেমি|মডেল/.test(board);
  if (isCollegeName && !board.includes('বোর্ড')) return 'college';

  return isBoardExam ? 'board' : 'college';
}

export function getCleanBoardName(q: CQQuestion): string {
  const raw = q.source?.raw;
  if (raw && raw.trim().length > 0) return raw.split('।')[0].trim();

  const board = q.source?.board || 'বোর্ড পরীক্ষা';
  const year = q.source?.year ? ` ${q.source.year}` : '';
  return `${board}${year}`.trim();
}

export const EDUCATION_BOARDS = [
  'সকল বোর্ড',
  'ঢাকা',
  'রাজশাহী',
  'চট্টগ্রাম',
  'কুমিল্লা',
  'ময়মনসিংহ',
  'যশোর',
  'বরিশাল',
  'সিলেট',
  'দিনাজপুর',
  'মাদরাসা',
] as const;

export const CQ_YEARS = [
  'সকল সাল',
  '২০২৫',
  '২০২৪',
  '২০২৩',
  '২০২২',
  '২০২১',
  '২০২০',
  '২০১৯',
  '২০১৮',
  '২০১৭',
  '২০১৬',
] as const;

export interface CQChapterInfo {
  id: string;
  number: number;
  name: string;
  count: number;
}

export function getCQChapters(questions: CQQuestion[]): CQChapterInfo[] {
  const map = new Map<string, CQChapterInfo>();

  for (const question of questions) {
    const id = question.chapterId || String(question.chapterNumber ?? '');
    if (!id) continue;

    const existing = map.get(id);
    if (existing) {
      existing.count += 1;
      continue;
    }

    map.set(id, {
      id,
      number: question.chapterNumber ?? 0,
      name: question.chapter || '',
      count: 1,
    });
  }

  return [...map.values()].sort((a, b) => a.number - b.number);
}

/** Marks a CQ question as read in local reader state. */
export function getCQPartDefaults(q: CQQuestion) {
  return (q.parts || []).map((part) => ({
    ...part,
    cognitiveType:
      part.cognitiveType ||
      (part.label === 'ক'
        ? 'জ্ঞানমূলক'
        : part.label === 'খ'
          ? 'অনুধাবন'
          : part.label === 'গ'
            ? 'প্রয়োগ'
            : 'উচ্চতর দক্ষতা'),
    marks:
      part.marks ??
      (part.label === 'ক' ? 1 : part.label === 'খ' ? 2 : part.label === 'গ' ? 3 : 4),
  }));
}
