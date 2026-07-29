import React from 'react';
import { Modal } from 'antd';
import {
  CheckCircle,
  BarChart3,
  BookOpen,
  Star,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';

type ModalType = 'answer' | 'statistics' | 'explanation' | 'bookmark';

interface QuestionData {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  stats?: {
    totalAttempts: number;
    correctPercentage: number;
    averageTime: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  };
}

interface CustomModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  modalType?: ModalType;
  questionData?: QuestionData;
  letterLabels?: string[];
}

const letters = ['ক', 'খ', 'গ', 'ঘ'];

const CustomModal: React.FC<CustomModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  modalType,
  questionData,
  letterLabels = letters,
}) => {
  if (!modalType || !questionData) return null;

  const colors = {
    success: '#00E5B3',
    brand: '#2F80ED',
    purple: '#9B51E0',
    amber: '#F2C94C',
    red: '#EB5757',
  };

  const difficultyStyles: Record<string, { badge: string; label: string }> = {
    Easy: { badge: 'bg-[#00E5B3]/10 text-[#00E5B3] border-[#00E5B3]/30', label: 'সহজ' },
    Medium: { badge: 'bg-[#F2C94C]/10 text-[#F2C94C] border-[#F2C94C]/30', label: 'মাঝারি' },
    Hard: { badge: 'bg-[#EB5757]/10 text-[#EB5757] border-[#EB5757]/30', label: 'কঠিন' },
  };

  // ─── Content renderers ───────────────────────────────────────
  const renderAnswerContent = () => {
    const correctIdx = questionData.correctAnswer;
    return (
      <div className="space-y-5">
        <div className="bg-[#00E5B3]/5 border border-[#00E5B3]/20 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center">
              <CheckCircle size={22} className="text-[#00E5B3]" />
            </div>
            <div>
              <h3 className="font-bold text-[#00E5B3]">সঠিক উত্তর</h3>
              <p className="text-xs text-[#A1A8B3]">Correct Answer</p>
            </div>
          </div>
          <div className="bg-[#161920] border border-[#23262D] rounded-lg p-4">
            <p className="text-lg font-semibold text-[#F5F7FA]">
              {letterLabels[correctIdx]}) {questionData.options[correctIdx]}
            </p>
          </div>
        </div>

        {questionData.explanation && (
          <div className="bg-[#2F80ED]/5 border border-[#2F80ED]/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/30 flex items-center justify-center">
                <MessageSquare size={20} className="text-[#2F80ED]" />
              </div>
              <div>
                <h3 className="font-bold text-[#2F80ED]">সংক্ষিপ্ত ব্যাখ্যা</h3>
                <p className="text-xs text-[#A1A8B3]">Brief Explanation</p>
              </div>
            </div>
            <div className="bg-[#161920] border border-[#23262D] rounded-lg p-4">
              <p className="text-sm text-[#A1A8B3] leading-7">{questionData.explanation}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStatisticsContent = () => {
    const stats = questionData.stats || {
      totalAttempts: 2847,
      correctPercentage: 62,
      averageTime: '38 sec',
      difficulty: 'Medium' as const,
    };

    const ds = difficultyStyles[stats.difficulty];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#9B51E0]/5 border border-[#9B51E0]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-[#9B51E0]" />
              <span className="text-xs font-medium text-[#9B51E0]">মোট পরীক্ষার্থী</span>
            </div>
            <p className="text-2xl font-bold text-[#F5F7FA]">{stats.totalAttempts.toLocaleString()}</p>
            <p className="text-[10px] text-[#A1A8B3]">Total Attempts</p>
          </div>

          <div className="bg-[#00E5B3]/5 border border-[#00E5B3]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-[#00E5B3]" />
              <span className="text-xs font-medium text-[#00E5B3]">সঠিকতার হার</span>
            </div>
            <p className="text-2xl font-bold text-[#F5F7FA]">{stats.correctPercentage}%</p>
            <p className="text-[10px] text-[#A1A8B3]">Accuracy Rate</p>
          </div>

          <div className="bg-[#2F80ED]/5 border border-[#2F80ED]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-[#2F80ED]" />
              <span className="text-xs font-medium text-[#2F80ED]">গড় সময়</span>
            </div>
            <p className="text-2xl font-bold text-[#F5F7FA]">{stats.averageTime}</p>
            <p className="text-[10px] text-[#A1A8B3]">Avg Time per Question</p>
          </div>

          <div className={`${ds.badge} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="currentColor" />
              <span className="text-xs font-medium">কঠিনতা</span>
            </div>
            <p className="text-2xl font-bold">{stats.difficulty}</p>
            <p className="text-[10px] opacity-80">Difficulty Level</p>
          </div>
        </div>

        <div className="bg-[#161920] border border-[#23262D] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#A1A8B3]">সঠিক উত্তরের হার</span>
            <span className="text-sm font-bold text-[#F5F7FA]">{stats.correctPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-[#1C1F26] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${stats.correctPercentage}%`,
                backgroundColor:
                  stats.correctPercentage >= 80
                    ? colors.success
                    : stats.correctPercentage >= 50
                    ? colors.amber
                    : colors.red,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#6B7280] mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderExplanationContent = () => {
    const correctIdx = questionData.correctAnswer;
    return (
      <div className="space-y-5">
        <div className="bg-[#00E5B3]/5 border border-[#00E5B3]/20 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center">
              <CheckCircle size={22} className="text-[#00E5B3]" />
            </div>
            <div>
              <h3 className="font-bold text-[#00E5B3]">সঠিক উত্তর</h3>
              <p className="text-xs text-[#A1A8B3]">
                {letterLabels[correctIdx]}) {questionData.options[correctIdx]}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#9B51E0]/5 border border-[#9B51E0]/20 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#9B51E0]/10 border border-[#9B51E0]/30 flex items-center justify-center">
              <BookOpen size={20} className="text-[#9B51E0]" />
            </div>
            <div>
              <h3 className="font-bold text-[#9B51E0]">বিস্তারিত ব্যাখ্যা</h3>
              <p className="text-xs text-[#A1A8B3]">Detailed Explanation</p>
            </div>
          </div>
          <div className="bg-[#161920] border border-[#23262D] rounded-lg p-4">
            <p className="text-sm text-[#A1A8B3] leading-7">
              {questionData.explanation || 'এই প্রশ্নের জন্য কোনো ব্যাখ্যা পাওয়া যায়নি।'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-[#F2C94C]/10 border border-[#F2C94C]/30 rounded-lg">
          <AlertCircle size={16} className="text-[#F2C94C] shrink-0" />
          <p className="text-xs text-[#F2C94C]">
            টিপ: এই ধরনের প্রশ্ন প্রায়ই বিসিএস preliminary তে আসে। ভালোভাবে মনে রাখুন।
          </p>
        </div>
      </div>
    );
  };

  const renderBookmarkContent = () => {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#F2994A] flex items-center justify-center shadow-lg mb-4">
            <Star size={28} className="text-black" />
          </div>
          <h3 className="text-lg font-bold text-[#F5F7FA] mb-1">বুকমার্ক যুক্ত হয়েছে!</h3>
          <p className="text-sm text-[#A1A8B3] text-center">
            প্রশ্নটি আপনার বুকমার্ক তালিকায় যুক্ত করা হয়েছে।
            <br />
            পরে রিভিউ করার জন্য সহজেই খুঁজে পাবেন।
          </p>
        </div>

        <div className="bg-[#F2C94C]/5 border border-[#F2C94C]/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F2C94C]/10 border border-[#F2C94C]/30 flex items-center justify-center">
              <ThumbsUp size={18} className="text-[#F2C94C]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F2C94C]">বুকমার্কেড প্রশ্ন</p>
              <p className="text-xs text-[#A1A8B3]">প্রশ্ন #{questionData.id}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // This is the missing function – must be declared before use
  const renderContent = () => {
    switch (modalType) {
      case 'answer':
        return renderAnswerContent();
      case 'statistics':
        return renderStatisticsContent();
      case 'explanation':
        return renderExplanationContent();
      case 'bookmark':
        return renderBookmarkContent();
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (modalType) {
      case 'answer': return 'উত্তর দেখুন';
      case 'statistics': return 'পরিসংখ্যান';
      case 'explanation': return 'ব্যাখ্যা';
      case 'bookmark': return 'বুকমার্ক';
      default: return 'Modal';
    }
  };

  const getIcon = () => {
    switch (modalType) {
      case 'answer': return <CheckCircle size={20} className="text-[#00E5B3]" />;
      case 'statistics': return <BarChart3 size={20} className="text-[#9B51E0]" />;
      case 'explanation': return <BookOpen size={20} className="text-[#9B51E0]" />;
      case 'bookmark': return <Star size={20} className="text-[#F2C94C]" />;
      default: return null;
    }
  };

  const getButtonColor = () => {
    switch (modalType) {
      case 'answer': return colors.success;
      case 'statistics': return colors.purple;
      case 'explanation': return colors.brand;
      case 'bookmark': return colors.amber;
      default: return colors.brand;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          {getIcon()}
          <span className="text-lg font-bold text-[#F5F7FA]">{getTitle()}</span>
        </div>
      }
      closable
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2 rounded-lg text-sm font-semibold border border-[#23262D] bg-[#161920] text-[#A1A8B3] hover:bg-[#1C1F26] hover:text-[#F5F7FA] transition"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition"
            style={{ backgroundColor: getButtonColor(), boxShadow: `0 4px 14px ${getButtonColor()}40` }}
          >
            বুঝলাম
          </button>
        </div>
      }
      width={520}
      styles={{
        header: {
          borderBottom: '1px solid #23262D',
          paddingBottom: 16,
        },
        body: {
          paddingTop: 20,
          paddingBottom: 8,
          maxHeight: 460,
          overflowY: 'auto',
        },
      }}
      className="[&_.ant-modal-content]:!bg-[#111318] [&_.ant-modal-content]:!border-[#23262D] [&_.ant-modal-close]:!text-[#A1A8B3] [&_.ant-modal-close]:hover:!text-[#F5F7FA]"
    >
      {renderContent()}
    </Modal>
  );
};

export default CustomModal;