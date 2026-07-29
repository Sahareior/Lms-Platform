import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileSearch,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Trash2,
  Sparkles,
  Zap,
  BookOpen,
} from 'lucide-react';
import {
  useUploadDocumentsMutation,
  useQuestionPaperScraperMutation,
  useQuestionAnalyzerMutation,
  useGetAdminExamsQuery,
  useGetAdminExamVersionsQuery,
  useGetAdminSubjectsQuery,
  type AdminExamVersion,
  type AdminSubject,
} from '@my-monorepo/store';
import { usePostQuestionPatternMutation, usePostScrapQuestionsMutation } from '@my-monorepo/store/src/redux/api/examApi';


// ─── Types ──────────────────────────────────────────────────
type TabKey = 'documents' | 'scraper';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// ─── Tabs ────────────────────────────────────────────────────
const TABS: TabConfig[] = [
  {
    key: 'documents',
    label: 'Document Upload',
    icon: <Upload size={18} />,
    description: 'Upload documents (PDF, DOC, TXT) for RAG ingestion',
  },
  {
    key: 'scraper',
    label: 'Question Scraper',
    icon: <FileSearch size={18} />,
    description: 'Upload question papers (PDF) to extract questions',
  },
];

// ─── Status Toast ────────────────────────────────────────────
function StatusToast({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border backdrop-blur-sm transition-all animate-in slide-in-from-right ${
        type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-lg hover:bg-black/5 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Draggable File Input ────────────────────────────────────
function FileDropzone({
  accept,
  label,
  selectedFile,
  onFileSelect,
  onClear,
}: {
  accept: string;
  label: string;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
 

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-emerald-400 bg-emerald-50/50 scale-[1.01]'
          : selectedFile
            ? 'border-emerald-300 bg-emerald-50/30'
            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <FileText size={28} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Upload size={26} className="text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-slate-700 text-sm">
              Drop your {label} here or <span className="text-emerald-600">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Accepted format: {accept}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────
function SectionCard({
  icon,
  title,
  subtitle,
  children,
  accentColor = 'emerald',
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  const accentMap: Record<string, string> = {
    emerald: 'from-emerald-400 to-emerald-600 shadow-emerald-200/40',
    blue: 'from-blue-400 to-blue-600 shadow-blue-200/40',
    violet: 'from-violet-400 to-violet-600 shadow-violet-200/40',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-3.5 mb-6">
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${accentMap[accentColor] || accentMap.emerald} shadow-md`}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Transform scraper response → analyzer format ──────────
const transformScrapedToAnalyzer = (data: any[], year: number) => ({
  questions: data.map((item: any) => {
    const optionKeys = Object.keys(item.options || {});
    const optionValues = optionKeys.map((k) => item.options[k]);
    const correctAnswer = item.options[item.correct_answer] || item.correct_answer || '';
    return {
      year,
      question: item.question_text || '',
      options: optionValues,
      answer: correctAnswer,
    };
  }),
});

// ─── Main Admin Dashboard ────────────────────────────────────
export default function QuestionManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>('documents');

  // ── Document Upload State ──────────────────────────────────
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadDocuments, { isLoading: isUploading }] = useUploadDocumentsMutation();
   const [selectOptions,setSelectOptions] = useState('')
  // ── Question Scraper State ─────────────────────────────────
  const [scraperFile, setScraperFile] = useState<File | null>(null);
  const [scraperSubject, setScraperSubject] = useState('');
  const [scraperExam, setScraperExam] = useState('');
  const [selectVersion, setSelectVersion] = useState('');
  const [selectSubject, setSelectSubject] = useState('');
  const [scrapedQuestions, setScrapedQuestions] = useState<any[] | null>(null);
  const [questionPaperScraper, { isLoading: isScraping }] = useQuestionPaperScraperMutation();
  const [postScrapQuestions] = usePostScrapQuestionsMutation()
  const [postQuestionPattern] = usePostQuestionPatternMutation()
const { data: exams, isLoading, error, refetch } = useGetAdminExamsQuery();
  const { data: examVersions } = useGetAdminExamVersionsQuery();
  const { data: subjects } = useGetAdminSubjectsQuery();
  const [questionAnalyzer, { isLoading: isAnalyzing }] = useQuestionAnalyzerMutation();
  
  // ── Toast State ────────────────────────────────────────────
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Handle Document Upload ─────────────────────────────────
  const handleUploadDocuments = async () => {
    if (!docFile) {
      showToast('error', 'Please select a file to upload.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', docFile);
      await uploadDocuments(formData).unwrap();
      showToast('success', 'Document uploaded successfully for RAG ingestion!');
      setDocFile(null);
    } catch {
      showToast('error', 'Failed to upload document. Please try again.');
    }
  };

  // ── Handle Question Scraper ────────────────────────────────
  const handleScrapeQuestions = async () => {
    if (!scraperFile) {
      showToast('error', 'Please select a question paper PDF to upload.');
      return;
    }
    if (!selectOptions) {
      showToast('error', 'Please select an exam.');
      return;
    }
    if (!selectVersion) {
      showToast('error', 'Please select an exam version.');
      return;
    }
        
    try {
      const formData = new FormData();
      formData.append('file', scraperFile);
      formData.append('subject', scraperSubject.trim());
      if (scraperExam.trim()) formData.append('exam', scraperExam.trim());
      const response = await questionPaperScraper(formData).unwrap();
      if(response){
        try{
            const payloadData: any = {
          exam: selectOptions,
          data: response.data
        }
        // Include exam version if selected
        if (selectVersion) {
          payloadData.examVersion = selectVersion;
        }
        // Include subject if selected
        if (selectSubject) {
          payloadData.subject = selectSubject;
        }
        await postScrapQuestions(payloadData)
        }
        catch(err){
          console.log(err)
        }
      }

      const extracted = response?.data;
      setScrapedQuestions(extracted);
      const analyzerPayload = transformScrapedToAnalyzer(extracted, Number(scraperExam) || new Date().getFullYear());        try {
          const res = await questionAnalyzer(analyzerPayload).unwrap();
          if(res){
            const patternPayload: any = {
              exam: selectOptions,
              res,
            };
            // Include exam version if selected
            if (selectVersion) {
              patternPayload.examVersion = selectVersion;
            }
            // Include subject if selected
            if (selectSubject) {
              patternPayload.subject = selectSubject;
            }
            await postQuestionPattern(patternPayload);
          }
        

      } catch {
        showToast('error', 'Questions were scraped, but analysis failed. Please try again.');
        return;
      }
      showToast('success', `${extracted.length} questions scraped and analyzed successfully!`);
      setScraperFile(null);
      setScraperSubject('');
      setScraperExam('');
      setSelectOptions('');
      setSelectVersion('');
      setSelectSubject('');
    } catch {
      showToast('error', 'Failed to scrape questions. Please try again.');
    }
  };

  console.log(selectOptions,'tjs')

  // ── Helper to clear toast ──────────────────────────────────
  const clearToast = () => setToast(null);

  // ── Render Tab Content ─────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      // ════════════════════════════════════════════════════════
      //  DOCUMENT UPLOAD
      // ════════════════════════════════════════════════════════
      case 'documents':
        return (
          <SectionCard
            icon={<Upload size={18} className="text-white" />}
            title="Document Upload"
            subtitle="Upload PDF, DOC, or TXT files for RAG-based knowledge ingestion"
            accentColor="emerald"
          >
            <div className="space-y-5">
              <FileDropzone
                accept=".pdf,.doc,.docx,.txt,.md"
                label="document"
                selectedFile={docFile}
                onFileSelect={setDocFile}
                onClear={() => setDocFile(null)}
              />

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Sparkles size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">
                    RAG Knowledge Base
                  </p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Uploaded documents will be processed, chunked, and indexed into the vector
                    database. The AI assistant can then reference this content when answering
                    student queries.
                  </p>
                </div>
              </div>

              <button
                onClick={handleUploadDocuments}
                disabled={isUploading || !docFile}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 active:scale-[0.98] shadow-sm shadow-emerald-200/50 hover:shadow-md hover:shadow-emerald-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading & Indexing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload to RAG
                  </>
                )}
              </button>
            </div>
          </SectionCard>
        );

      // ════════════════════════════════════════════════════════
      //  QUESTION PAPER SCRAPER
      // ════════════════════════════════════════════════════════
      case 'scraper':
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
                onFileSelect={setScraperFile}
                onClear={() => setScraperFile(null)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             
             <div>
  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
    Exam
  </label>
  <select 
    value={selectOptions}
    onChange={(e) => {
      setSelectOptions(e.target.value);
      setSelectVersion(''); // Reset version when exam changes
      setSelectSubject(''); // Reset subject when exam changes
    }}
    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400 font-medium"
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
  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
    Exam Version
  </label>
  <select
    value={selectVersion}
    onChange={(e) => setSelectVersion(e.target.value)}
    disabled={!selectOptions}
    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
    Subject <span className="text-slate-300 font-normal normal-case">(optional)</span>
  </label>
  <select
    value={selectSubject}
    onChange={(e) => setSelectSubject(e.target.value)}
    disabled={!selectOptions}
    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <option value="">
      {selectOptions
        ? subjects?.filter((s: AdminSubject) => {
            const examId = typeof s.exam === 'string' ? s.exam : s.exam?._id;
            return examId === selectOptions;
          }).length
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

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <BookOpen size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-800">
                    PDF Question Extraction
                  </p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    The system will parse the uploaded question paper PDF, extract individual
                    questions with their options, and store them in the question bank for
                    quiz and exam generation.
                  </p>
                </div>
              </div>

              <button
                onClick={handleScrapeQuestions}
                // disabled={isScraping || isAnalyzing || !scraperFile || !scraperSubject.trim() || !selectOptions || !selectVersion}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 active:scale-[0.98] shadow-sm shadow-blue-200/50 hover:shadow-md hover:shadow-blue-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScraping || isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isScraping ? 'Scraping Questions...' : 'Analyzing Questions...'}
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
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-emerald-800">
                          {scrapedQuestions.length} Questions Extracted
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          Analyzed and ready for review
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setScrapedQuestions(null)}
                      className="p-1.5 rounded-lg hover:bg-emerald-100/50 transition-colors text-emerald-500"
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
  };

  return (
    <div className="w-full font-sans text-slate-800 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <StatusToast type={toast.type} message={toast.message} onClose={clearToast} />
      )}

      <main className="space-y-6">
        {/* ────── HEADER ────── */}
        <div className="flex items-center gap-3 pb-2">
          <div className="w-10 h-10 rounded-xl bg-[#0e1625] flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage RAG documents, scrape question papers, and analyze questions
            </p>
          </div>
        </div>

        {/* ────── TYPE BADGE ────── */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          Admin Tools &bull; AI-Powered
        </div>

        {/* ────── TAB NAVIGATION ────── */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-[#0e1625] text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ────── TAB CONTENT ────── */}
        <div className="pt-2">{renderTabContent()}</div>
      </main>
    </div>
  );
}
