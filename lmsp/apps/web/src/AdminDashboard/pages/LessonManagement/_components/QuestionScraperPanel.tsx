import { BookOpen, CheckCircle, FileSearch, GraduationCap, Loader2, Plus, X, Zap } from 'lucide-react';
import { useState } from 'react';
import type { AdminExamVersion, AdminSubject } from '@my-monorepo/store';
import { BANGLADESH_BOARDS, type BangladeshBoard } from '@my-monorepo/store';
import { QUESTION_TYPES } from '@my-monorepo/store';
import {
  useCreateCollegeMutation,
} from '@my-monorepo/store';
import FileDropzone from './FileDropzone';
import SectionCard from './SectionCard';

interface QuestionScraperPanelProps {
  scraperFile: File | null;
  isScraping: boolean;
  selectOptions: string;
  selectVersion: string;
  selectSubject: string;
  selectBoard: string;
  selectQuestionType: string;
  selectCollege: string;
  yearInput: string;
  scrapedQuestions: any[] | null;
  exams: Array<{ _id: string; name: string; category?: string }>;
  examVersions: AdminExamVersion[];
  subjects: AdminSubject[];
  colleges: Array<{ _id: string; name: string }>;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  onExamChange: (examId: string) => void;
  onVersionChange: (versionId: string) => void;
  onSubjectChange: (subjectId: string) => void;
  onBoardChange: (board: string) => void;
  onQuestionTypeChange: (questionType: string) => void;
  onCollegeChange: (collegeId: string) => void;
  onYearChange: (year: string) => void;
  onScrape: () => void;
  onClearScraped: () => void;
}

const inputClasses = "w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] text-sm text-[#E8F5EC] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-[#5F6B64] font-medium";
const disabledClasses = " disabled:opacity-50 disabled:cursor-not-allowed";
const labelClasses = "block text-xs font-bold text-[#9BA8A0] uppercase tracking-wider mb-1.5";

// ─── Question Paper Scraper tab ─────────────────────────────
// The form adapts to the selected question type:
//   board     → Exam, Board, Exam Version, Subject
//   testpaper → Exam, College (+ inline add), Year, Subject
//   mockexam  → Exam, Subject                (no board / college / year / version)
// Exam Version is only relevant to board sets (e.g. HSC year papers).
export default function QuestionScraperPanel({
  scraperFile,
  isScraping,
  selectOptions,
  selectVersion,
  selectSubject,
  selectBoard,
  selectQuestionType,
  selectCollege,
  yearInput,
  scrapedQuestions,
  exams,
  examVersions,
  subjects,
  colleges,
  onFileSelect,
  onClearFile,
  onExamChange,
  onVersionChange,
  onSubjectChange,
  onBoardChange,
  onQuestionTypeChange,
  onCollegeChange,
  onYearChange,
  onScrape,
  onClearScraped,
}: QuestionScraperPanelProps) {
  const subjectCountForExam = subjects?.filter((s: AdminSubject) => {
    const examId = typeof s.exam === 'string' ? s.exam : s.exam?._id;
    return examId === selectOptions;
  }).length;

  // Check if the selected exam is academic (HSC)
  const selectedExam = exams?.find((e) => e._id === selectOptions);
  const isAcademicExam = selectedExam?.category === 'academic';

  // Inline "add college" form (visible for testpaper type)
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [createCollege, { isLoading: isCreatingCollege }] = useCreateCollegeMutation();

  const handleAddCollege = async () => {
    const name = newCollegeName.trim();
    if (!name) return;
    try {
      const created = await createCollege({ name }).unwrap();
      onCollegeChange(created._id);
      setNewCollegeName('');
      setShowCollegeForm(false);
      // Surface success via the section hint
      setCollegeAdded(true);
      setTimeout(() => setCollegeAdded(false), 3000);
    } catch {
      // Duplicate name etc. — the select keeps its previous value; the admin
      // can rename and retry. (Parent shows a toast for scrape errors.)
      setCollegeError('Could not add college — it may already exist.');
      setTimeout(() => setCollegeError(''), 4000);
    }
  };

  const [collegeAdded, setCollegeAdded] = useState(false);
  const [collegeError, setCollegeError] = useState('');

  // Field visibility per question type
  const isBoardType = selectQuestionType === 'board';
  const isTestpaperType = selectQuestionType === 'testpaper';
  const showBoard = isBoardType && isAcademicExam;
  const showCollege = isTestpaperType;
  const showYear = isTestpaperType;
  const showVersion = isBoardType;

  return (
    <SectionCard
      icon={<FileSearch size={18} className="text-white" />}
      title="Question Paper Scraper"
      subtitle="Upload question paper PDFs to extract & store questions in the database"
      accentColor="blue"
    >
      <div className="space-y-5">
        <FileDropzone
          accept=".pdf"
          label="question paper"
          selectedFile={scraperFile}
          onFileSelect={onFileSelect}
          onClear={onClearFile}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Question Type — drives which other fields appear */}
          <div>
            <label className={labelClasses}>
              Question Type
            </label>
            <select
              value={selectQuestionType}
              onChange={(e) => onQuestionTypeChange(e.target.value)}
              className={inputClasses}
            >
              <option value="">Select a type</option>
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>
              Exam
            </label>
            <select
              value={selectOptions}
              onChange={(e) => onExamChange(e.target.value)}
              className={inputClasses}
            >
              <option value="">Select an exam</option>
              {exams?.map(item => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Board dropdown — only for board-type academic (HSC) papers */}
          {showBoard && (
            <div>
              <label className={labelClasses}>
                Board
              </label>
              <select
                value={selectBoard}
                onChange={(e) => onBoardChange(e.target.value)}
                disabled={!selectOptions}
                className={inputClasses + disabledClasses}
              >
                <option value="">
                  {selectOptions ? 'Select a board' : 'Select an exam first'}
                </option>
                {BANGLADESH_BOARDS.map((board: BangladeshBoard) => (
                  <option key={board} value={board}>
                    {board}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* College dropdown + inline add — only for testpaper papers */}
          {showCollege && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#9BA8A0] uppercase tracking-wider">
                  College
                </label>
                <button
                  type="button"
                  onClick={() => setShowCollegeForm((v) => !v)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>
              <select
                value={selectCollege}
                onChange={(e) => onCollegeChange(e.target.value)}
                className={inputClasses}
              >
                <option value="">
                  {colleges.length ? 'Select a college' : 'No colleges yet — use Add'}
                </option>
                {colleges.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {showCollegeForm && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newCollegeName}
                    onChange={(e) => setNewCollegeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCollege();
                      }
                    }}
                    placeholder="College name (e.g. Dhaka College)"
                    className="flex-1 px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] text-sm text-[#E8F5EC] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-[#5F6B64]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCollege}
                    disabled={isCreatingCollege || !newCollegeName.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-[#04150B] text-xs font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingCollege ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <GraduationCap size={14} />
                    )}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCollegeForm(false);
                      setNewCollegeName('');
                    }}
                    className="p-2 rounded-lg text-[#9BA8A0] hover:text-[#E8F5EC] hover:bg-[#1A1A1A] transition-colors"
                    title="Cancel"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {collegeAdded && (
                <p className="mt-1.5 text-xs font-semibold text-emerald-400">
                  College added and selected ✓
                </p>
              )}
              {collegeError && (
                <p className="mt-1.5 text-xs font-semibold text-red-400">{collegeError}</p>
              )}
            </div>
          )}

          {/* Year input — only for testpaper papers */}
          {showYear && (
            <div>
              <label className={labelClasses}>
                Year
              </label>
              <input
                type="number"
                min={1990}
                max={2100}
                value={yearInput}
                onChange={(e) => onYearChange(e.target.value)}
                placeholder="e.g. 2024"
                className={inputClasses}
              />
            </div>
          )}

          {/* Exam Version — board sets only (e.g. HSC year papers) */}
          {showVersion && (
            <div>
              <label className={labelClasses}>
                Exam Version
              </label>
              <select
                value={selectVersion}
                onChange={(e) => onVersionChange(e.target.value)}
                disabled={!selectOptions}
                className={inputClasses + disabledClasses}
              >
                <option value="">
                  {selectOptions ? 'Select a version' : 'Select an exam first'}
                </option>
                {examVersions
                  ?.filter((v: AdminExamVersion) => v.exam === selectOptions)
                  .map((v: AdminExamVersion) => (
                    <option key={v._id} value={v._id}>
                      {v.examVersion}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClasses}>
              Subject <span className="text-[#5F6B64] font-normal normal-case">(optional)</span>
            </label>
            <select
              value={selectSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              disabled={!selectOptions}
              className={inputClasses + disabledClasses}
            >
              <option value="">
                {selectOptions
                  ? subjectCountForExam
                    ? 'Select a subject (optional)'
                    : 'No subjects for this exam'
                  : 'Select an exam first'}
              </option>
              {subjects
                ?.filter((s: AdminSubject) => {
                  const examId = typeof s.exam === 'string' ? s.exam : s.exam?._id;
                  return examId === selectOptions;
                })
                .map((s: AdminSubject) => (
                  <option key={s._id} value={s._id}>
                    {s.name}{s.code ? ` (${s.code})` : ''}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-start gap-3">
          <BookOpen size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-300">
              PDF Question Extraction
            </p>
            <p className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
              The system will parse the uploaded question paper PDF, extract individual
              questions with their options, and store them in the question bank. Run the
              AI pattern analysis from the Question Bank (Analyze &amp; Save) on each set.
              {isBoardType && (
                <span className="block mt-1 text-emerald-300/80 font-medium">
                  📋 Board questions — select the board and exam version for this HSC paper.
                </span>
              )}
              {isTestpaperType && (
                <span className="block mt-1 text-emerald-300/80 font-medium">
                  🎓 Testpaper questions — pick (or add) the college and set the year.
                </span>
              )}
              {selectQuestionType === 'mockexam' && (
                <span className="block mt-1 text-emerald-300/80 font-medium">
                  🧪 Mockexam questions — just exam and subject.
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onScrape}
          disabled={isScraping}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#04150B] py-3 rounded-xl font-bold text-sm hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 active:scale-[0.98] shadow-sm shadow-emerald-950/60 hover:shadow-md hover:shadow-emerald-950/70 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScraping ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Scraping Questions...
            </>
          ) : (
            <>
              <Zap size={16} />
              Scrape & Store Questions
            </>
          )}
        </button>

        {/* Scraper result preview */}
        {scrapedQuestions && scrapedQuestions.length > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-emerald-300">
                    {scrapedQuestions.length} Questions Extracted
                  </p>
                  <p className="text-xs text-emerald-400/80 mt-0.5">
                    Stored in the question bank — analyze the pattern from Question Bank
                  </p>
                </div>
              </div>
              <button
                onClick={onClearScraped}
                className="p-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors text-emerald-400"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
