import React from 'react';
import { Button, Modal, Progress } from 'antd';
import { FiCheckCircle, FiBarChart2, FiBookOpen, FiStar, FiAlertCircle, FiClock, FiUsers, FiTrendingUp, FiThumbsUp, FiMessageSquare } from 'react-icons/fi';

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

const letters = ["ক", "খ", "গ", "ঘ"];

const CustomModal: React.FC<CustomModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  modalType,
  questionData,
  letterLabels = letters,
}) => {
  if (!modalType || !questionData) return null;

  const renderAnswerContent = () => {
    const correctIdx = questionData.correctAnswer;
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="text-green-600" size={22} />
            </div>
            <div>
              <h3 className="font-bold text-green-800">সঠিক উত্তর</h3>
              <p className="text-xs text-green-600">Correct Answer</p>
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-4 border border-green-100">
            <p className="text-lg font-semibold text-gray-800">
              {letterLabels[correctIdx]}) {questionData.options[correctIdx]}
            </p>
          </div>
        </div>

        {questionData.explanation && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FiMessageSquare className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-blue-800">সংক্ষিপ্ত ব্যাখ্যা</h3>
                <p className="text-xs text-blue-600">Brief Explanation</p>
              </div>
            </div>
            <div className="bg-white/70 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-gray-700 leading-7">{questionData.explanation}</p>
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

    const difficultyStyles = {
      Easy: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text600: 'text-green-600',
        text800: 'text-green-800',
        text500: 'text-green-500',
        from: 'from-green-50',
      },
      Medium: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text600: 'text-yellow-600',
        text800: 'text-yellow-800',
        text500: 'text-yellow-500',
        from: 'from-yellow-50',
      },
      Hard: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text600: 'text-red-600',
        text800: 'text-red-800',
        text500: 'text-red-500',
        from: 'from-red-50',
      },
    };

    const ds = difficultyStyles[stats.difficulty];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <FiUsers className="text-purple-600" size={16} />
              <span className="text-xs font-medium text-purple-600">মোট পরীক্ষার্থী</span>
            </div>
            <p className="text-2xl font-bold text-purple-800">{stats.totalAttempts.toLocaleString()}</p>
            <p className="text-[10px] text-purple-500">Total Attempts</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp className="text-green-600" size={16} />
              <span className="text-xs font-medium text-green-600">সঠিকতার হার</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{stats.correctPercentage}%</p>
            <p className="text-[10px] text-green-500">Accuracy Rate</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <FiClock className="text-blue-600" size={16} />
              <span className="text-xs font-medium text-blue-600">গড় সময়</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{stats.averageTime}</p>
            <p className="text-[10px] text-blue-500">Avg Time per Question</p>
          </div>

          <div className={`bg-gradient-to-br ${ds.from} rounded-xl p-4 border ${ds.border}`}>
            <div className="flex items-center gap-2 mb-2">
              <FiAlertCircle className={ds.text600} size={16} />
              <span className={`text-xs font-medium ${ds.text600}`}>কঠিনতা</span>
            </div>
            <p className={`text-2xl font-bold ${ds.text800}`}>{stats.difficulty}</p>
            <p className={`text-[10px] ${ds.text500}`}>Difficulty Level</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">সঠিক উত্তরের হার</span>
            <span className="text-sm font-bold text-gray-800">{stats.correctPercentage}%</span>
          </div>
          <Progress
            percent={stats.correctPercentage}
            strokeColor={stats.correctPercentage >= 80 ? '#22c55e' : stats.correctPercentage >= 50 ? '#eab308' : '#ef4444'}
            trailColor="#e5e7eb"
            showInfo={false}
            size="small"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
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
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="text-green-600" size={22} />
            </div>
            <div>
              <h3 className="font-bold text-green-800">সঠিক উত্তর</h3>
              <p className="text-xs text-green-600">{letterLabels[correctIdx]}) {questionData.options[correctIdx]}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <FiBookOpen className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-indigo-800">বিস্তারিত ব্যাখ্যা</h3>
              <p className="text-xs text-indigo-600">Detailed Explanation</p>
            </div>
          </div>
          <div className="bg-white/70 rounded-lg p-4 border border-indigo-100">
            <p className="text-sm text-gray-700 leading-7">
              {questionData.explanation || 'এই প্রশ্নের জন্য কোনো ব্যাখ্যা পাওয়া যায়নি।'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <FiAlertCircle className="text-amber-500 shrink-0" size={16} />
          <p className="text-xs text-amber-700">
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg mb-4">
            <FiStar className="text-white" size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">বুকমার্ক যুক্ত হয়েছে!</h3>
          <p className="text-sm text-gray-500 text-center">
            প্রশ্নটি আপনার বুকমার্ক তালিকায় যুক্ত করা হয়েছে।
            <br />
            পরে রিভিউ করার জন্য সহজেই খুঁজে পাবেন।
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
              <FiThumbsUp className="text-yellow-600" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-yellow-800">বুকমার্কেড প্রশ্ন</p>
              <p className="text-xs text-yellow-600">প্রশ্ন #{questionData.id}</p>
            </div>
          </div>
        </div>
      </div>
    );
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
      case 'answer': return <FiCheckCircle className="text-green-500" size={20} />;
      case 'statistics': return <FiBarChart2 className="text-purple-500" size={20} />;
      case 'explanation': return <FiBookOpen className="text-indigo-500" size={20} />;
      case 'bookmark': return <FiStar className="text-yellow-500" size={20} />;
      default: return null;
    }
  };

  const getButtonColor = () => {
    switch (modalType) {
      case 'answer': return '#059669';
      case 'statistics': return '#7c3aed';
      case 'explanation': return '#6366f1';
      case 'bookmark': return '#f59e0b';
      default: return '#6366f1';
    }
  };

  const renderContent = () => {
    switch (modalType) {
      case 'answer': return renderAnswerContent();
      case 'statistics': return renderStatisticsContent();
      case 'explanation': return renderExplanationContent();
      case 'bookmark': return renderBookmarkContent();
      default: return null;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          {getIcon()}
          <span className="text-lg font-bold text-gray-800">{getTitle()}</span>
        </div>
      }
      closable={{ 'aria-label': 'Close' }}
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={
        <div className="flex justify-end gap-3 pt-2">
          <Button
            onClick={() => setIsModalOpen(false)}
            className="!rounded-lg !h-10 !px-5 !border-gray-300 !text-gray-600 hover:!bg-gray-50"
          >
            বন্ধ করুন
          </Button>
          <Button
            type="primary"
            onClick={() => setIsModalOpen(false)}
            className="!rounded-lg !h-10 !px-5 !shadow-md"
            style={{ 
              background: getButtonColor(),
              border: 'none'
            }}
          >
            বুঝলাম
          </Button>
        </div>
      }
      width={520}
      styles={{
        header: {
          borderBottom: '1px solid #f3f4f6',
          paddingBottom: 16,
        },
        body: {
          paddingTop: 20,
          paddingBottom: 8,
          maxHeight: 460,
          overflowY: 'auto',
        },
      }}
      className="[&_.ant-modal-content]:!rounded-2xl [&_.ant-modal-content]:!shadow-2xl"
    >
      {renderContent()}
    </Modal>
  );
};

export default CustomModal;