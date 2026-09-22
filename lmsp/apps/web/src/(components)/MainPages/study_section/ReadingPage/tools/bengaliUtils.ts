import type { CreativeQuestion } from './types';

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || num === '') return '';
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

export function getSourceCategory(q: CreativeQuestion): 'board' | 'cadet' | 'college' {
  const board = (q.source?.board || '').toLowerCase();
  const raw = (q.source?.raw || '').toLowerCase();

  if (board.includes('ক্যাডেট') || raw.includes('ক্যাডেট')) {
    return 'cadet';
  }

  const isBoardExam =
    q.source?.kind === 'board' ||
    board.includes('বোর্ড') ||
    raw.includes('বোর্ড') ||
    /ঢাকা|ময়মনসিংহ|ময়মনসিংহ|রাজশাহী|কুমিল্লা|চট্টগ্রাম|সিলেট|যশোর|বরিশাল|দিনাজপুর|মাদরাসা/.test(board);

  // If it's explicitly a college or school name despite kind="board"
  const isCollegeName = /কলেজ|স্কুল|মহাবিদ্যালয়|একাডেমি|মডেল/.test(board);
  if (isCollegeName && !board.includes('বোর্ড')) {
    return 'college';
  }

  if (isBoardExam) {
    return 'board';
  }

  return 'college';
}

export function getCleanBoardName(q: CreativeQuestion): string {
  const raw = q.source?.raw;
  if (raw && raw.trim().length > 0) {
    // Remove "প্রশ্ন নং..." suffix if present to keep it clean
    return raw.split('।')[0].trim();
  }
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
  'ময়মনসিংহ',
  'যশোর',
  'বরিশাল',
  'সিলেট',
  'দিনাজপুর',
  'মাদরাসা',
];

export const YEARS = ['সকল সাল', '২০২৫', '২০২৪', '২০২৩', '২০২০', '২০১৯', '২০১৮', '২০১৭', '২০১৬'];

/** A distinct chapter derived from the question bank. */
export interface ChapterInfo {
  id: string;
  number: number;
  name: string;
  count: number;
}

/**
 * Derives the list of unique chapters (ordered by chapter number) from the
 * question bank, with per-chapter question counts. Falls back to the
 * chapterNumber as id when chapterId is missing.
 */
export function getChapters(questions: CreativeQuestion[]): ChapterInfo[] {
  const map = new Map<string, ChapterInfo>();
  for (const q of questions) {
    const id = q.chapterId || String(q.chapterNumber ?? '');
    if (!id) continue;
    const existing = map.get(id);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(id, {
        id,
        number: q.chapterNumber ?? 0,
        name: q.chapter || '',
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.number - b.number);
}
