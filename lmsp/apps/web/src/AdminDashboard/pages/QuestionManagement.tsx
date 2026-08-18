import React, { useState } from 'react';
import {
  Upload,
  FileSearch,
  Zap,
} from 'lucide-react';
import {
  useUploadDocumentsMutation,
  useAiragUploadStatusQuery,
  useQuestionPaperScraperMutation,
  useGetAdminExamsQuery,
  useGetAdminExamVersionsQuery,
  useGetAdminSubjectsQuery,
  type RagJobStatus,
} from '@my-monorepo/store';
import { usePostScrapQuestionsMutation } from '@my-monorepo/store/src/redux/api/examApi';
import StatusToast from './LessonManagement/_components/StatusToast';
import DocumentUploadPanel from './LessonManagement/_components/DocumentUploadPanel';
import QuestionScraperPanel from './LessonManagement/_components/QuestionScraperPanel';
import { isRagTerminal } from './LessonManagement/_components/RagIndexingCard';

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

// ─── Main Admin Dashboard ────────────────────────────────────
export default function QuestionManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>('documents');

  // ── Document Upload State ──────────────────────────────────
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadDocuments, { isLoading: isUploading }] = useUploadDocumentsMutation();
  const [selectOptions, setSelectOptions] = useState('');

  // ── Question Scraper State ─────────────────────────────────
  const [scraperFile, setScraperFile] = useState<File | null>(null);
  const [scraperSubject, setScraperSubject] = useState('');
  const [scraperExam, setScraperExam] = useState('');
  const [selectVersion, setSelectVersion] = useState('');
  const [selectSubject, setSelectSubject] = useState('');
  const [scrapedQuestions, setScrapedQuestions] = useState<any[] | null>(null);
  const [questionPaperScraper, { isLoading: isScraping }] = useQuestionPaperScraperMutation();
  const [postScrapQuestions] = usePostScrapQuestionsMutation();
  const { data: exams } = useGetAdminExamsQuery();
  const { data: examVersions } = useGetAdminExamVersionsQuery();
  const { data: subjects } = useGetAdminSubjectsQuery();

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
  // Only scrapes the PDF and stores the questions in the DB. The AI pattern
  // analysis now lives in the Question Bank (Analyze & Save per question set),
  // so a failed analysis can be retried from the stored set — no re-upload.
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
      const extracted = response?.data;
      if (!extracted || extracted.length === 0) {
        showToast('error', 'No questions were extracted from the paper.');
        return;
      }

      const payloadData: any = {
        exam: selectOptions,
        data: extracted,
      };
      // Include exam version if selected
      if (selectVersion) {
        payloadData.examVersion = selectVersion;
      }
      // Include subject if selected
      if (selectSubject) {
        payloadData.subject = selectSubject;
      }
      await postScrapQuestions(payloadData).unwrap();

      setScrapedQuestions(extracted);
      showToast('success', `${extracted.length} questions scraped and stored successfully!`);
      setScraperFile(null);
      setScraperSubject('');
      setScraperExam('');
      setSelectOptions('');
      setSelectVersion('');
      setSelectSubject('');
    } catch (err: any) {
      if (err?.status === 409) {
        showToast('error', err?.data?.message || 'Questions already exist for this exam/version/subject. Open the Question Bank to analyze them.');
      } else {
        showToast('error', 'Failed to scrape questions. Please try again.');
      }
    }
  };

  // ── Helper to clear toast ──────────────────────────────────
  const clearToast = () => setToast(null);

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
              Manage RAG documents and scrape question papers into the question bank
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === tab.key
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
        <div className="pt-2">
          {activeTab === 'documents' ? (
            <DocumentUploadPanel
              docFile={docFile}
              isUploading={isUploading}
              ragJobId={ragJobId}
              ragDisplay={ragDisplay}
              ragJobActive={ragJobActive}
              onFileSelect={setDocFile}
              onClearFile={() => setDocFile(null)}
              onUpload={handleUploadDocuments}
              onDismissJob={() => {
                setRagJobId(null);
                setRagFinal(null);
              }}
            />
          ) : (
            <QuestionScraperPanel
              scraperFile={scraperFile}
              isScraping={isScraping}
              selectOptions={selectOptions}
              selectVersion={selectVersion}
              selectSubject={selectSubject}
              scrapedQuestions={scrapedQuestions}
              exams={exams || []}
              examVersions={examVersions || []}
              subjects={subjects || []}
              onFileSelect={setScraperFile}
              onClearFile={() => setScraperFile(null)}
              onExamChange={(examId) => {
                setSelectOptions(examId);
                setSelectVersion('');
                setSelectSubject('');
              }}
              onVersionChange={setSelectVersion}
              onSubjectChange={setSelectSubject}
              onScrape={handleScrapeQuestions}
              onClearScraped={() => setScrapedQuestions(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
