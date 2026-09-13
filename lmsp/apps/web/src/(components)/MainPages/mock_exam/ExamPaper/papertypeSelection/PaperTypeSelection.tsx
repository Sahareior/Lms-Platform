import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Eye,
  Monitor,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  ChevronRight,
} from 'lucide-react';
import Omer from '../omr/Omr';
import QuizPreatise from '../ExamPaper';

interface PaperTypeSelectionProps {
  examId: string;
  board: string | null;
  versionId: string;
  scheduleId?: string;
}

// ─── Exam Rules Modal ─────────────────────────────────────────
function ExamRulesModal({ onAgree, onCancel }: { onAgree: () => void; onCancel: () => void }) {
  const [checked, setChecked] = useState(false);

  const violations = [
    {
      icon: <Eye size={18} />,
      color: 'text-[#EB5757] bg-[#EB5757]/10 border-[#EB5757]/20',
      title: 'ট্যাব পরিবর্তন',
      desc: 'পরীক্ষার ট্যাব থেকে অন্য ট্যাবে যাওয়া একটি লঙ্ঘন হিসেবে গণ্য হবে।',
    },
    {
      icon: <Monitor size={18} />,
      color: 'text-[#F2994A] bg-[#F2994A]/10 border-[#F2994A]/20',
      title: 'উইন্ডো ফোকাস হারানো',
      desc: 'পরীক্ষার উইন্ডোর বাইরে ক্লিক করলে একটি লঙ্ঘন হিসেবে গণ্য হবে।',
    },
    {
      icon: <Camera size={18} />,
      color: 'text-[#9B51E0] bg-[#9B51E0]/10 border-[#9B51E0]/20',
      title: 'স্ক্রিনশট প্রচেষ্টা',
      desc: 'PrintScreen বোতাম চাপলে তা শনাক্ত হবে এবং লঙ্ঘন হিসেবে গণ্য হবে।',
    },
  ];

  const rules = [
    'পরীক্ষা চলাকালীন পেজ রিফ্রেশ করবেন না — আপনার উত্তর স্বয়ংক্রিয়ভাবে সংরক্ষিত হচ্ছে।',
    'টাইমার শেষ হলে পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।',
    'পরীক্ষা চলাকালীন অন্য কোনো ট্যাব বা অ্যাপ্লিকেশন খুলবেন না।',
    'প্রতিটি পরীক্ষার প্রচেষ্টা ট্র্যাক করা হয় এবং আপনার অ্যাকাউন্টের সাথে যুক্ত থাকে।',
    'একবার জমা দেওয়ার পর উত্তর পরিবর্তন করা যাবে না।',
    'পরীক্ষা শুরুর আগে নিশ্চিত করুন যে আপনার ইন্টারনেট সংযোগ স্থিতিশীল।',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-[#13151C] border border-[#23262D] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#13151C] border-b border-[#23262D] px-6 pt-6 pb-4 rounded-t-2xl z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-[#EB5757]/10 border border-[#EB5757]/30 rounded-xl flex items-center justify-center">
              <ShieldAlert size={20} className="text-[#EB5757]" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#F5F7FA]">পরীক্ষার নিয়মাবলী ও নিরাপত্তা নীতি</h2>
              <p className="text-sm text-[#A1A8B3]">শুরু করার আগে মনোযোগ দিয়ে পড়ুন</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Violation Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-[#F2994A]" />
              <h3 className="text-base font-bold text-[#F5F7FA] uppercase tracking-wider">
                লঙ্ঘন নীতি
              </h3>
            </div>
            <div className="bg-[#1C1F28] border border-[#2A2D38] rounded-xl p-4 mb-3">
              <p className="text-sm text-[#A1A8B3] leading-relaxed">
                এই পরীক্ষাটি নিরাপত্তার জন্য পর্যবেক্ষণ করা হচ্ছে। আপনাকে সর্বোচ্চ{' '}
                <span className="text-[#EB5757] font-bold">৫টি লঙ্ঘনের</span> সুযোগ দেওয়া হবে। সীমা পৌঁছালে আপনার পরীক্ষা{' '}
                <span className="text-[#EB5757] font-bold">স্বয়ংক্রিয়ভাবে জমা</span> হয়ে যাবে।
              </p>
            </div>
            <div className="space-y-2">
              {violations.map((v, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${v.color}`}
                >
                  <div className={`mt-0.5 shrink-0 ${v.color.split(' ')[0]}`}>{v.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-[#F5F7FA]">{v.title}</div>
                    <div className="text-xs text-[#A1A8B3] mt-0.5">{v.desc}</div>
                  </div>
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-[#EB5757]/20 text-[#EB5757] border border-[#EB5757]/30 shrink-0">
                    +১ লঙ্ঘন
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* General Rules */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-[#9B51E0]" />
              <h3 className="text-base font-bold text-[#F5F7FA] uppercase tracking-wider">
                সাধারণ নিয়মাবলী
              </h3>
            </div>
            <ul className="space-y-2">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <ChevronRight size={16} className="text-[#9B51E0] mt-0.5 shrink-0" />
                  <span className="text-sm text-[#A1A8B3] leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timer warning */}
          <div className="flex items-start gap-3 bg-[#2F80ED]/5 border border-[#2F80ED]/20 rounded-xl p-4">
            <Clock size={18} className="text-[#2F80ED] shrink-0 mt-0.5" />
            <p className="text-sm text-[#A1A8B3] leading-relaxed">
              পেপার টাইপ নির্বাচন করার সাথে সাথেই পরীক্ষার টাইমার শুরু হবে। এগিয়ে যাওয়ার আগে নিশ্চিত হয়ে নিন যে আপনি প্রস্তুত।
            </p>
          </div>

          {/* Agreement checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div
              onClick={() => setChecked((c) => !c)}
              className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
                checked
                  ? 'bg-[#9B51E0] border-[#9B51E0]'
                  : 'bg-transparent border-[#3A3F50] group-hover:border-[#9B51E0]/50'
              }`}
            >
              {checked && <CheckCircle2 size={13} className="text-white" />}
            </div>
            <span className="text-sm text-[#A1A8B3] leading-relaxed">
              আমি পরীক্ষার সকল নিয়মাবলী এবং লঙ্ঘন নীতি পড়েছি এবং বুঝেছি। আমি পরীক্ষা চলাকালীন এই নিয়মগুলো মেনে চলতে সম্মত।
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#13151C] border-t border-[#23262D] px-6 py-4 rounded-b-2xl flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold text-base border border-[#3A3F50] text-[#A1A8B3] hover:bg-[#1C1F28] hover:text-[#F5F7FA] hover:border-[#4A5060] transition-all"
          >
            বাতিল করুন
          </button>
          <button
            onClick={onAgree}
            disabled={!checked}
            className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${
              checked
                ? 'bg-[#9B51E0] text-white hover:bg-[#883ECE] shadow-[0_4px_12px_rgba(155,81,224,0.4)] hover:shadow-[0_4px_20px_rgba(155,81,224,0.6)]'
                : 'bg-[#1C1F28] text-[#4A5060] border border-[#23262D] cursor-not-allowed'
            }`}
          >
            {checked ? 'সম্মত আছি — এগিয়ে যান →' : 'সম্মতির বক্সটি চেক করুন'}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── Main Component ────────────────────────────────────────────
const PaperTypeSelection: React.FC<PaperTypeSelectionProps> = ({ examId, board, versionId, scheduleId }) => {
  const examSessionKey = `${examId}:${versionId}:${scheduleId || ''}:${board || ''}`;
  const [rulesAgreed, setRulesAgreed] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [clicked, setClicked] = useState(false);

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1);
  };

  const handleAgree = () => {
    setRulesAgreed(true);
  };

  const handleSelect = (type: string) => {
    setSelectedType(type);
    setClicked(true);
  };

  const renderComponent = (key: string | null) => {
    switch (key) {
      case 'Type1':
        return <Omer examId={examId} board={board} versionId={versionId} />;
      case 'Type2':
        return <QuizPreatise examId={examId} board={board} versionId={versionId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1f26] flex flex-col items-center justify-center text-white">
      {/* Rules modal — shown until user agrees */}
      {!rulesAgreed && <ExamRulesModal onAgree={handleAgree} onCancel={handleCancel} />}

      {/* Paper type selection (only visible after agreement) */}
      <div className={`${clicked ? 'hidden' : 'block'}`}>
        <h2 className="text-2xl font-bold mb-6">Choose your preferred method</h2>
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => handleSelect('Type1')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedType === 'Type1'
                ? 'bg-emerald-600 text-white shadow-lg scale-105'
                : 'bg-[#222734] border border-[#373e4f] text-gray-200 hover:bg-[#2c3345]'
            }`}
          >
            OMR Sheet (Type 1)
          </button>
          <button
            onClick={() => handleSelect('Type2')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedType === 'Type2'
                ? 'bg-emerald-600 text-white shadow-lg scale-105'
                : 'bg-[#222734] border border-[#373e4f] text-gray-200 hover:bg-[#2c3345]'
            }`}
          >
            Digital Quiz (Type 2)
          </button>
        </div>
      </div>

      {rulesAgreed && clicked && (
        <React.Fragment key={examSessionKey}>
          {renderComponent(selectedType)}
        </React.Fragment>
      )}
    </div>
  );
};

export default PaperTypeSelection;