import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  HelpCircle,
  Target,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────
interface QuestionReviewItem {
  question: string;
  options: string[];
  selectedIndex?: number;
  correctIndex?: number;
  isCorrect?: boolean;
}

interface ResultData {
  examName: string;
  versionName: string;
  title: string;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  percentage: number;
  score: number;
  timeTaken: number;
  durationSeconds: number;
  questions?: QuestionReviewItem[];
}

const getBengaliLetter = (index: number) => {
  const letters = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"];
  return letters[index] || String.fromCharCode(65 + index);
};

const formatDuration = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
};

const getVerdict = (percentage: number) => {
  if (percentage >= 80)
    return { label: "Excellent", color: "#00E5B3", message: "Outstanding work — keep this momentum going!" };
  if (percentage >= 60)
    return { label: "Good", color: "#2F80ED", message: "Nice job — a little more practice and you're there." };
  if (percentage >= 40)
    return { label: "Needs Improvement", color: "#F2C94C", message: "You're on the right track — review the mistakes below." };
  return { label: "Keep Practicing", color: "#EB5757", message: "Don't give up — review the answers and try again." };
};

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const state = location.state as ResultData | null;

  console.log(state,'this is state')
  const fromState = (v: number | null, fallback: number) =>
    v !== null && v !== undefined && !Number.isNaN(v) ? v : fallback;
  const paramInt = (key: string) => {
    const raw = searchParams.get(key);
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isNaN(n) ? null : n;
  };

  const result: ResultData = {
    examName: state?.examName || searchParams.get("examName") || "Mock Exam",
    versionName: state?.versionName || searchParams.get("versionName") || "",
    title: state?.title || searchParams.get("title") || "Mock Exam",
    correctCount: fromState(state?.correctCount ?? paramInt("correct"), 0),
    incorrectCount: fromState(state?.incorrectCount ?? paramInt("incorrect"), 0),
    unansweredCount: fromState(state?.unansweredCount ?? paramInt("unanswered"), 0),
    totalQuestions: fromState(state?.totalQuestions ?? paramInt("total"), 0),
    percentage: fromState(state?.percentage ?? paramInt("percentage"), 0),
    score: fromState(state?.score ?? paramInt("score"), 0),
    timeTaken: fromState(state?.timeTaken ?? paramInt("timeTaken"), 0),
    durationSeconds: fromState(state?.durationSeconds ?? paramInt("duration"), 0),
    questions: state?.questions,
  };

  const {
    examName,
    versionName,
    title,
    correctCount,
    incorrectCount,
    unansweredCount,
    totalQuestions,
    percentage,
    score,
    timeTaken,
    durationSeconds,
    questions,
  } = result;

  const verdict = getVerdict(percentage);
  const attemptedCount = correctCount + incorrectCount;

  // ─── Circular progress ring ───
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const dash = (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      {/* ────── HEADER ────── */}
      <header className="sticky top-0 z-40 bg-[#111318]/95 backdrop-blur-sm border-b border-[#23262D] px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/mock-exam")}
            className="p-2 hover:bg-[#161920] rounded-lg transition text-[#A1A8B3] hover:text-[#F5F7FA]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-[#00E5B3]/10 border border-[#00E5B3]/30 text-[#00E5B3] p-1.5 rounded-lg">
              <Award size={20} />
            </div>
            <div>
              <p className="font-bold text-lg tracking-tight leading-none">{title}</p>
              <p className="text-[11px] text-[#6B7280] mt-1">
                {examName}
                {versionName ? ` • ${versionName}` : ""}
              </p>
            </div>
          </div>
        </div>
        <span
          className="text-[11px] font-bold px-3 py-1.5 rounded-full border"
          style={{
            color: verdict.color,
            backgroundColor: `${verdict.color}14`,
            borderColor: `${verdict.color}40`,
          }}
        >
          <Target size={11} className="inline mr-1" />
          {verdict.label}
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* ────── SCORE HERO ────── */}
        <div className="relative overflow-hidden rounded-2xl border border-[#23262D] bg-gradient-to-br from-[#161920] via-[#111318] to-[#0B0D12] p-6 md:p-8">
          <div
            className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl"
            style={{ backgroundColor: `${verdict.color}20` }}
          />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Ring */}
            <div className="relative flex-shrink-0">
              <svg viewBox="0 0 200 200" className="w-44 h-44 md:w-52 md:h-52">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="#1C1F26"
                  strokeWidth="14"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={verdict.color}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference}`}
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000"
                />
                <text
                  x="100"
                  y="98"
                  textAnchor="middle"
                  style={{ fill: "#F5F7FA", fontSize: 38, fontWeight: 800 }}
                >
                  {percentage}%
                </text>
                <text
                  x="100"
                  y="124"
                  textAnchor="middle"
                  style={{ fill: "#A1A8B3", fontSize: 13 }}
                >
                  {score} / {totalQuestions} correct
                </text>
              </svg>
            </div>

            {/* Summary */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: verdict.color }}>
                Overall Quiz Performance
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 mb-2">
                {verdict.label}
              </h1>
              <p className="text-sm text-[#A1A8B3] max-w-lg leading-relaxed mx-auto md:mx-0">
                {verdict.message}
              </p>

              {/* Mini stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                <div className="flex items-center gap-2 bg-[#111318]/80 border border-[#23262D] rounded-xl px-4 py-2.5">
                  <Clock size={15} className="text-[#F2C94C]" />
                  <div>
                    <p className="text-sm font-extrabold leading-none">{formatDuration(timeTaken)}</p>
                    <p className="text-[10px] text-[#6B7280] mt-1">
                      Time taken{durationSeconds > 0 ? ` / ${formatDuration(durationSeconds)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#111318]/80 border border-[#23262D] rounded-xl px-4 py-2.5">
                  <BookOpen size={15} className="text-[#2F80ED]" />
                  <div>
                    <p className="text-sm font-extrabold leading-none">{attemptedCount}/{totalQuestions}</p>
                    <p className="text-[10px] text-[#6B7280] mt-1">Questions attempted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ────── STAT CARDS ────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#111318] rounded-2xl border border-[#00E5B3]/30 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#A1A8B3]">Correct</span>
              <div className="p-1.5 rounded-lg bg-[#00E5B3]/10 text-[#00E5B3]">
                <CheckCircle size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#00E5B3]">{correctCount}</div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}% of the exam
            </div>
          </div>

          <div className="bg-[#111318] rounded-2xl border border-[#EB5757]/30 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#A1A8B3]">Incorrect</span>
              <div className="p-1.5 rounded-lg bg-[#EB5757]/10 text-[#EB5757]">
                <XCircle size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#EB5757]">{incorrectCount}</div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              Review these below to improve
            </div>
          </div>

          <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#A1A8B3]">Unanswered</span>
              <div className="p-1.5 rounded-lg bg-[#161920] text-[#A1A8B3]">
                <HelpCircle size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#A1A8B3]">{unansweredCount}</div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              Skipped or left blank
            </div>
          </div>
        </div>

        {/* ────── QUESTION REVIEW ────── */}
        {questions && questions.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold">Question Review</h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#161920] text-[#A1A8B3] border border-[#23262D] px-2.5 py-1 rounded-full">
                {questions.length} questions
              </span>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => {
                const answered = q.selectedIndex !== undefined;
                const isCorrect = q.isCorrect === true;

                return (
                  <div
                    key={index}
                    className={`bg-[#111318] border rounded-2xl p-5 ${
                      isCorrect
                        ? "border-[#00E5B3]/40"
                        : answered
                        ? "border-[#EB5757]/40"
                        : "border-[#23262D]"
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border ${
                          isCorrect
                            ? "bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30"
                            : answered
                            ? "bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/30"
                            : "bg-[#161920] text-[#A1A8B3] border-[#23262D]"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider bg-[#161920] px-2 py-0.5 rounded border border-[#23262D]">
                        MCQ
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ml-auto ${
                          isCorrect
                            ? "text-[#00E5B3] bg-[#00E5B3]/10 border-[#00E5B3]/30"
                            : answered
                            ? "text-[#EB5757] bg-[#EB5757]/10 border-[#EB5757]/30"
                            : "text-[#A1A8B3] bg-[#161920] border-[#23262D]"
                        }`}
                      >
                        {isCorrect ? "✓ Correct" : answered ? "✗ Incorrect" : "— Unanswered"}
                      </span>
                    </div>

                    <h3 className="text-sm font-medium leading-relaxed text-[#F5F7FA] mb-4">
                      {q.question}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIndex) => {
                        const isRight = q.correctIndex === optIndex;
                        const isSelected = q.selectedIndex === optIndex;
                        let style = "border-[#23262D] bg-[#161920]";
                        if (isRight) style = "border-[#00E5B3] bg-[#00E5B3]/10";
                        else if (isSelected) style = "border-[#EB5757] bg-[#EB5757]/10";
                        else style = "border-[#23262D] bg-[#161920] opacity-60";

                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${style}`}
                          >
                            <span
                              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                                isRight
                                  ? "bg-[#00E5B3] text-black border-[#00E5B3]"
                                  : isSelected
                                  ? "bg-[#EB5757] text-white border-[#EB5757]"
                                  : "bg-[#1C1F26] text-[#A1A8B3] border-[#23262D]"
                              }`}
                            >
                              {getBengaliLetter(optIndex)}
                            </span>
                            <span
                              className={`text-[13px] ${
                                isRight
                                  ? "text-[#00E5B3] font-medium"
                                  : isSelected
                                  ? "text-[#EB5757] font-medium"
                                  : "text-[#A1A8B3]"
                              }`}
                            >
                              {opt}
                            </span>
                            {isRight && (
                              <CheckCircle className="ml-auto text-[#00E5B3] flex-shrink-0" size={16} />
                            )}
                            {isSelected && !isRight && (
                              <XCircle className="ml-auto text-[#EB5757] flex-shrink-0" size={16} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ────── ACTIONS ────── */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 pb-10">
          <button
            onClick={() => navigate("/mock-exam")}
            className="inline-flex items-center justify-center gap-2 bg-[#9B51E0] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#7E3CC4] transition active:scale-95 shadow-[0_0_20px_-5px_rgba(155,81,224,0.5)]"
          >
            <ArrowLeft size={16} /> Back to Exams
          </button>
          <button
            onClick={() => navigate("/performance")}
            className="inline-flex items-center justify-center gap-2 border border-[#23262D] bg-[#111318] text-[#F5F7FA] px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#161920] transition active:scale-95"
          >
            <Target size={16} className="text-[#2F80ED]" /> View Full Performance
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
