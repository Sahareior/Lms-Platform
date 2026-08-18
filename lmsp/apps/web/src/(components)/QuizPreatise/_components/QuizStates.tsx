import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";

export function QuizLoading({ loadingQuestions }: { loadingQuestions: boolean }) {
  return (
    <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-3xl text-[#9B51E0] mx-auto mb-4" />
        <p className="text-[#A1A8B3] font-medium">
          {loadingQuestions ? "Loading questions..." : "Starting quiz..."}
        </p>
      </div>
    </div>
  );
}

export function NoExamSelected({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <BookOpen className="mx-auto text-5xl text-[#6B7280] mb-4" />
        <h2 className="text-xl font-bold text-[#F5F7FA] mb-2">No Exam Selected</h2>
        <p className="text-[#A1A8B3] mb-4">
          Please select an exam and version to start practicing.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-[#9B51E0] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#7E3CC4] transition active:scale-95"
        >
          <ArrowLeft size={16} /> Back to Exams
        </button>
      </div>
    </div>
  );
}

export function NoQuestionsAvailable({
  examName,
  versionName,
  onBack,
}: {
  examName: string;
  versionName: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <BookOpen className="mx-auto text-5xl text-[#6B7280] mb-4" />
        <h2 className="text-xl font-bold text-[#F5F7FA] mb-2">No Questions Available</h2>
        <p className="text-[#A1A8B3] mb-4">
          Questions for {examName || "this exam"} – {versionName || "this version"} haven't been
          added yet.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-[#9B51E0] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#7E3CC4] transition active:scale-95"
        >
          <ArrowLeft size={16} /> Back to Exams
        </button>
      </div>
    </div>
  );
}
