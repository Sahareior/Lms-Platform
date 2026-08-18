import { BookOpen, CheckCircle, FileSearch, Loader2, X, Zap } from 'lucide-react';
import type { AdminExamVersion, AdminSubject } from '@my-monorepo/store';
import FileDropzone from './FileDropzone';
import SectionCard from './SectionCard';

interface QuestionScraperPanelProps {
  scraperFile: File | null;
  isScraping: boolean;
  selectOptions: string;
  selectVersion: string;
  selectSubject: string;
  scrapedQuestions: any[] | null;
  exams: Array<{ _id: string; name: string }>;
  examVersions: AdminExamVersion[];
  subjects: AdminSubject[];
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  onExamChange: (examId: string) => void;
  onVersionChange: (versionId: string) => void;
  onSubjectChange: (subjectId: string) => void;
  onScrape: () => void;
  onClearScraped: () => void;
}

// ─── Question Paper Scraper tab ─────────────────────────────
export default function QuestionScraperPanel({
  scraperFile,
  isScraping,
  selectOptions,
  selectVersion,
  selectSubject,
  scrapedQuestions,
  exams,
  examVersions,
  subjects,
  onFileSelect,
  onClearFile,
  onExamChange,
  onVersionChange,
  onSubjectChange,
  onScrape,
  onClearScraped,
}: QuestionScraperPanelProps) {
  const subjectCountForExam = subjects?.filter((s: AdminSubject) => {
    const examId = typeof s.exam === 'string' ? s.exam : s.exam?._id;
    return examId === selectOptions;
  }).length;

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
          <div>
            <label className="block text-xs font-bold text-[#9BA8A0] uppercase tracking-wider mb-1.5">
              Exam
            </label>
            <select
              value={selectOptions}
              onChange={(e) => onExamChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] text-sm text-[#E8F5EC] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-[#5F6B64] font-medium"
            >
              <option value="">Select an exam</option>
              {exams?.map(item => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9BA8A0] uppercase tracking-wider mb-1.5">
              Exam Version
            </label>
            <select
              value={selectVersion}
              onChange={(e) => onVersionChange(e.target.value)}
              disabled={!selectOptions}
              className="w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] text-sm text-[#E8F5EC] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-[#5F6B64] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div>
            <label className="block text-xs font-bold text-[#9BA8A0] uppercase tracking-wider mb-1.5">
              Subject <span className="text-[#5F6B64] font-normal normal-case">(optional)</span>
            </label>
            <select
              value={selectSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              disabled={!selectOptions}
              className="w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] text-sm text-[#E8F5EC] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-[#5F6B64] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
