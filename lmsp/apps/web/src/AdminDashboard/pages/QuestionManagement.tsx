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
  useAiragUploadStatusQuery,
  useQuestionPaperScraperMutation,
  useQuestionAnalyzerMutation,
  useGetAdminExamsQuery,
  useGetAdminExamVersionsQuery,
  useGetAdminSubjectsQuery,
  type AdminExamVersion,
  type AdminSubject,
  type RagJobStatus,
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

// ─── RAG Job Status Helpers ──────────────────────────────────
const RAG_SUCCESS_STATUSES = ['completed', 'success', 'done', 'finished'];
const RAG_FAILURE_STATUSES = ['failed', 'error', 'errored'];

const isRagTerminal = (status?: string) => {
  if (!status) return false;
  const s = status.toLowerCase();
  return RAG_SUCCESS_STATUSES.includes(s) || RAG_FAILURE_STATUSES.includes(s);
};

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
          ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
          : 'bg-red-950/90 border-red-500/30 text-red-300'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
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
          ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
          : selectedFile
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : 'border-[#2A2A2A] bg-[#0F0F0F]/50 hover:border-[#3A3A3A] hover:bg-[#121212]'
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
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
            <FileText size={28} className="text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-[#E8F5EC] text-sm">{selectedFile.name}</p>
            <p className="text-xs text-[#9BA8A0] mt-0.5">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
            <Upload size={26} className="text-[#7A8A80]" />
          </div>
          <div>
            <p className="font-bold text-[#C9DCCE] text-sm">
              Drop your {label} here or <span className="text-emerald-400">browse</span>
            </p>
            <p className="text-xs text-[#7A8A80] mt-0.5">Accepted format: {accept}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RAG Indexing Progress Card ──────────────────────────────
function RagIndexingCard({
  jobId,
  status,
  onDismiss,
}: {
  jobId: string;
  status: RagJobStatus | null;
  onDismiss: () => void;
}) {
  const s = (status?.status || '').toLowerCase();
  const isDone = RAG_SUCCESS_STATUSES.includes(s);
  const isFailed = RAG_FAILURE_STATUSES.includes(s);
  const total = status?.total || 0;
  const progress = status?.progress || 0;
  const percent = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;

  const label = isDone
    ? 'Indexing Complete'
    : isFailed
      ? 'Indexing Failed'
      : s === 'processing'
        ? 'Processing Document'
        : s === 'queued'
          ? 'Queued — Waiting to Start'
          : 'Indexing Document';

  const subtext = isDone
    ? 'Document indexed into the RAG knowledge base. The AI assistant can now reference this content.'
    : isFailed
      ? status?.error || 'An error occurred during indexing. Please try uploading again.'
      : status?.message || 'Upload accepted. Indexing runs in the background…';

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${
        isFailed
          ? 'border-red-500/30 bg-red-500/10'
          : 'border-emerald-500/25 bg-emerald-500/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {isFailed ? (
            <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
          ) : isDone ? (
            <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          ) : (
            <Loader2 size={20} className="text-emerald-400 mt-0.5 flex-shrink-0 animate-spin" />
          )}
          <div>
            <p
              className={`text-sm font-extrabold ${isFailed ? 'text-red-300' : 'text-emerald-300'}`}
            >
              {label}
            </p>
            <p className="text-xs text-[#9BA8A0] mt-1 leading-relaxed max-w-md">{subtext}</p>
            <p className="text-[10px] font-mono text-[#5F6B64] mt-1.5">Job ID: {jobId}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[#9BA8A0] hover:text-[#E8F5EC] flex-shrink-0"
          aria-label="Dismiss job status"
        >
          <X size={16} />
        </button>
      </div>

      {!isFailed && total > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-[#9BA8A0]">
              {isDone ? 'Progress' : 'Indexing progress'}
            </span>
            <span className="font-bold text-emerald-300">
              {percent}%{' '}
              <span className="text-[#5F6B64] font-medium">
                ({progress}/{total})
              </span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#1A1A1A] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
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
    emerald: 'from-emerald-500 to-emerald-700 shadow-emerald-950/60',
    blue: 'from-emerald-400 to-emerald-600 shadow-emerald-950/60',
    violet: 'from-teal-400 to-emerald-600 shadow-emerald-950/60',
  };

  return (
    <div className="bg-[#0B0B0B] rounded-2xl shadow-sm border border-[#1F2B22] overflow-hidden hover:shadow-emerald-950/40 hover:border-emerald-500/30 transition-all duration-200">
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-3.5 mb-6">
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${accentMap[accentColor] || accentMap.emerald} shadow-md`}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#E8F5EC] tracking-tight">{title}</h3>
            <p className="text-sm text-[#7A8A80] mt-0.5">{subtitle}</p>
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
const { data: exams } = useGetAdminExamsQuery();
  const { data: examVersions } = useGetAdminExamVersionsQuery();
  const { data: subjects } = useGetAdminSubjectsQuery();
  const [questionAnalyzer, { isLoading: isAnalyzing }] = useQuestionAnalyzerMutation();
  
  // ── Toast State ────────────────────────────────────────────
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ── RAG Upload Job Status (polled) ─────────────────────────
  const [ragJobId, setRagJobId] = useState<string | null>(null);
  const [ragFinal, setRagFinal] = useState<RagJobStatus | null>(null);

  // Poll the background indexing job every 3s while it's active.
  // Polling stops once the job reaches a terminal state (ragFinal set → skip).
  const { data: ragStatus, isError: ragStatusError } = useAiragUploadStatusQuery(
    ragJobId || '',
    {
      pollingInterval: 3000,
      skip: !ragJobId || !!ragFinal,
    }
  );
  const ragStatusData = ragStatus ?? null;

  // Once the polled status is terminal, freeze the result and stop polling.
  // Adjusting state during render (guarded) is React's sanctioned pattern for
  // this, so no effect is needed and no extra renders are committed.
  if (!ragFinal) {
    if (ragStatusData && isRagTerminal(ragStatusData.status)) {
      setRagFinal(ragStatusData);
    } else if (ragStatusError) {
      // The status endpoint failed — stop polling and surface the failure.
      setRagFinal({
        status: 'failed',
        progress: 0,
        total: 0,
        message: null,
        error:
          'Could not reach the indexing service. Check the AI backend and try again.',
        result: null,
      });
    }
  }

  const ragDisplay = ragFinal ?? ragStatusData;
  const ragJobActive = !!ragJobId && !ragFinal;

  // ── Handle Document Upload ─────────────────────────────────
  const handleUploadDocuments = async () => {
    if (!docFile) {
      showToast('error', 'Please select a file to upload.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', docFile);
      const res = await uploadDocuments(formData).unwrap();
      setRagFinal(null);
      if (res?.job_id) {
        // Upload accepted — start polling the background indexing job.
        setRagJobId(res.job_id);
        showToast('success', res.message || 'Upload accepted. Indexing runs in the background…');
      } else {
        showToast('success', 'Document uploaded successfully for RAG ingestion!');
      }
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

              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3">
                <Sparkles size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-300">
                    RAG Knowledge Base
                  </p>
                  <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">
                    Uploaded documents will be processed, chunked, and indexed into the vector
                    database. The AI assistant can then reference this content when answering
                    student queries.
                  </p>
                </div>
              </div>

              {/* RAG indexing job status (polled every 3s) */}
              {ragJobId && (
                <RagIndexingCard
                  jobId={ragJobId}
                  status={ragDisplay}
                  onDismiss={() => {
                    setRagJobId(null);
                    setRagFinal(null);
                  }}
                />
              )}

              <button
                onClick={handleUploadDocuments}
                disabled={isUploading || !docFile || ragJobActive}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#04150B] py-3 rounded-xl font-bold text-sm hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 active:scale-[0.98] shadow-sm shadow-emerald-950/60 hover:shadow-md hover:shadow-emerald-950/70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : ragJobActive ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Indexing in Progress...
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
  <label className="block text-xs font-bold text-[#9BA8A0] uppercase tracking-wider mb-1.5">
    Exam
  </label>
  <select 
    value={selectOptions}
    onChange={(e) => {
      setSelectOptions(e.target.value);
      setSelectVersion(''); // Reset version when exam changes
      setSelectSubject(''); // Reset subject when exam changes
    }}
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
    onChange={(e) => setSelectVersion(e.target.value)}
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
    onChange={(e) => setSelectSubject(e.target.value)}
    disabled={!selectOptions}
    className="w-full px-4 py-3 rounded-xl border border-[#2A2A2A] bg-[#0F0F0F] text-sm text-[#E8F5EC] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-[#5F6B64] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 flex items-start gap-3">
                <BookOpen size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-300">
                    PDF Question Extraction
                  </p>
                  <p className="text-xs text-emerald-200/70 mt-1 leading-relaxed">
                    The system will parse the uploaded question paper PDF, extract individual
                    questions with their options, and store them in the question bank for
                    quiz and exam generation.
                  </p>
                </div>
              </div>

              <button
                onClick={handleScrapeQuestions}
                // disabled={isScraping || isAnalyzing || !scraperFile || !scraperSubject.trim() || !selectOptions || !selectVersion}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#04150B] py-3 rounded-xl font-bold text-sm hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 active:scale-[0.98] shadow-sm shadow-emerald-950/60 hover:shadow-md hover:shadow-emerald-950/70 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          Analyzed and ready for review
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setScrapedQuestions(null)}
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
  };

  return (
    <div className="w-full font-sans text-[#E8F5EC] p-4 md:p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <StatusToast type={toast.type} message={toast.message} onClose={clearToast} />
      )}

      <main className="space-y-6">
        {/* ────── HEADER ────── */}
        <div className="flex items-center gap-3 pb-2">
          <div className="w-10 h-10 rounded-xl bg-[#0F1A12] border border-emerald-500/25 flex items-center justify-center">
            <Zap size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#E8F5EC] tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-[#9BA8A0] mt-0.5">
              Manage RAG documents, scrape question papers, and analyze questions
            </p>
          </div>
        </div>

        {/* ────── TYPE BADGE ────── */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0F1A12] border border-emerald-500/25 rounded-xl text-xs font-bold text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px #22C55E' }} />
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
                  ? 'bg-emerald-600 text-[#04150B] shadow-md shadow-emerald-950/50'
                  : 'bg-[#0F0F0F] border border-[#2A2A2A] text-[#9BA8A0] hover:bg-[#1A1A1A] hover:border-[#3A3A3A] hover:text-[#E8F5EC]'
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
