import React from 'react';
import {
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

interface StatCard {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent: string;
}

/**
 * Compact stat strip for the bank overview. Kept dumb (no hooks, no fetching)
 * so the page owns all the data and this only paints it.
 */
const QuestionBankStats: React.FC<{
  documents: number;
  totalQuestions: number;
  analyzed: number;
}> = ({ documents, totalQuestions, analyzed }) => {
  const stats: StatCard[] = [
    {
      label: 'Documents',
      value: documents,
      icon: <BookOutlined />,
      accent: 'bg-emerald-500/15 text-emerald-400',
    },
    {
      label: 'Total Questions',
      value: totalQuestions,
      icon: <QuestionCircleOutlined />,
      accent: 'bg-teal-500/15 text-teal-400',
    },
    {
      label: 'Analyzed',
      value: analyzed,
      icon: <CheckCircleOutlined />,
      accent: 'bg-emerald-500/15 text-emerald-400',
    },
    {
      label: 'Pending Analysis',
      value: documents - analyzed,
      icon: <CloseCircleOutlined />,
      accent: 'bg-amber-500/15 text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3.5 bg-gradient-to-br from-[#0E1812] to-[#0B0B0B] border border-[#1E2B21] rounded-2xl px-4 py-3.5 transition-all hover:border-emerald-500/40"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${stat.accent}`}>
            {stat.icon}
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-[#E8F5EC] tracking-tight leading-tight">{stat.value}</div>
            <div className="text-xs text-[#7A8A80] font-medium truncate">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionBankStats;
