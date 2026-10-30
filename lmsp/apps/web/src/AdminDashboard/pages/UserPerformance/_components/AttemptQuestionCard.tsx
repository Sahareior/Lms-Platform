import React from 'react';
import { Tag } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
  MinusCircleFilled,
} from '@ant-design/icons';
import type { AdminQuizAttemptQuestion } from '@my-monorepo/store';
import { formatDuration, getQuestionResult } from './performanceUtils';

interface Props {
  question: AdminQuizAttemptQuestion;
}

const RESULT_META = {
  correct: {
    label: 'Correct',
    color: 'success',
    icon: <CheckCircleFilled />,
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  incorrect: {
    label: 'Incorrect',
    color: 'error',
    icon: <CloseCircleFilled />,
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  unanswered: {
    label: 'Unanswered',
    color: 'default',
    icon: <MinusCircleFilled />,
    badge: 'bg-[#1A1A1A] text-[#7A8A80] border-[#2A2A2A]',
  },
} as const;

/**
 * A student's answer to one question, reviewable at a glance:
 * option states are colour-coded, so you can see what they picked versus
 * what was right without comparing two separate tag columns.
 */
const AttemptQuestionCard: React.FC<Props> = ({ question }) => {
  const result = getQuestionResult(question);
  const meta = RESULT_META[result];
  const options = Object.entries(question.options || {});
  const answered = question.selectedOption != null;

  return (
    <div className="bg-[#0B0B0B] border border-[#1E2B21] rounded-2xl p-4 transition-colors hover:border-emerald-500/30">
      <div className="flex items-start gap-3.5">
        <div className={`w-9 h-9 shrink-0 rounded-xl border text-sm font-bold flex items-center justify-center ${meta.badge}`}>
          {question.questionNumber}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <Tag color={meta.color} icon={meta.icon} className="!m-0 !font-semibold">
              {meta.label}
            </Tag>
            <span className="text-[11px] text-[#5F6B64] flex items-center gap-1 shrink-0">
              <ClockCircleOutlined />
              {formatDuration(question.timeTaken)}
            </span>
          </div>

          <p className="text-sm text-[#E8F5EC] font-medium leading-relaxed whitespace-pre-wrap mb-3">
            {question.questionText || 'Question text unavailable.'}
          </p>

          {options.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {options.map(([key, value]) => {
                const isCorrect = question.correctAnswer === key;
                const isPicked = question.selectedOption === key;
                const isWrongPick = isPicked && !isCorrect;

                const stateClass = isCorrect
                  ? 'border-emerald-500/45 bg-emerald-500/10 text-[#E8F5EC]'
                  : isWrongPick
                    ? 'border-red-500/45 bg-red-500/10 text-[#F5C2C2]'
                    : 'border-[#232323] bg-[#0F0F0F] text-[#9BA8A0]';

                const badgeClass = isCorrect
                  ? 'bg-emerald-500 text-[#04150B]'
                  : isWrongPick
                    ? 'bg-red-500 text-white'
                    : 'bg-[#1A1A1A] text-[#7A8A80]';

                return (
                  <div
                    key={key}
                    className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-[13px] leading-snug ${stateClass}`}
                  >
                    <span className={`shrink-0 w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center ${badgeClass}`}>
                      {key}
                    </span>
                    <span className="min-w-0 break-words">{value}</span>
                    <span className="ml-auto flex items-center gap-1.5 shrink-0 pl-1">
                      {isPicked && (
                        <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">picked</span>
                      )}
                      {isCorrect && <CheckCircleFilled className="text-emerald-400" />}
                      {isWrongPick && <CloseCircleFilled className="text-red-400" />}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Tag color={answered ? 'purple' : 'default'} className="!m-0 !text-xs">
                Picked: {question.selectedOption ?? '—'}
              </Tag>
              <Tag color="green" className="!m-0 !text-xs">
                Correct: {question.correctAnswer ?? '—'}
              </Tag>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttemptQuestionCard;
