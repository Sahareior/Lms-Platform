export interface SourceInfo {
  kind: 'board' | 'school' | 'college' | string;
  board: string;
  year: string;
  questionNo: string;
  raw: string;
}

export interface QuestionPart {
  label: string; // 'ক' | 'খ' | 'গ' | 'ঘ'
  text: string;
  marks: number;
  cognitiveType: string; // 'জ্ঞানমূলক' | 'অনুধাবন' | 'প্রয়োগ' | 'উচ্চতর দক্ষতা'
  answer: string;
  modelAnswers?: string[];
}

export interface StimulusBlock {
  kind: string;
  value: string;
}

export interface CreativeQuestion {
  id: string;
  chapterId: string;
  chapterNumber: number;
  chapter: string;
  source: SourceInfo;
  type: 'cq';
  number: number;
  stimulus: string;
  stimulusBlocks?: StimulusBlock[];
  parts: QuestionPart[];
  answerNotes?: string;
  answerBlocks?: any[];
}

export type StudyMode = 'read' | 'practice' | 'k-special' | 'kh-special';

export type FontSize = 'sm' | 'base' | 'lg';

export type SourceCategory = 'all' | 'board' | 'college' | 'cadet';
