import React from 'react';
import { Button, Popconfirm, Tag, Tooltip } from 'antd';
import {
  BookOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PictureOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { getOptionEntries, type QuestionItem } from './questionBankUtils';

interface Props {
  question: QuestionItem;
  onEdit: (question: QuestionItem) => void;
  onExplain: (question: QuestionItem) => void;
  onDelete: (question: QuestionItem) => void;
}

/**
 * One question, fully readable, with its actions right on the card.
 *
 * This replaces the old nested-table row: no horizontal scrolling and no
 * truncated cells, so you can actually read a paper's questions.
 */
const QuestionCard: React.FC<Props> = ({ question, onEdit, onExplain, onDelete }) => {
  const options = getOptionEntries(question.options);
  const hasExplanation = !!question.explanation?.trim();

  return (
    <div className="bg-[#0B0B0B] border border-[#1E2B21] rounded-2xl overflow-hidden transition-colors hover:border-emerald-500/35">
      <div className="flex items-start gap-3.5 p-4">
        {/* Question number */}
        <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 text-sm font-bold flex items-center justify-center">
          {question.question_number}
        </div>

        <div className="flex-1 min-w-0">
          {/* Meta + actions */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {question.correct_answer ? (
                <Tag color="green" className="!m-0 font-medium">
                  Answer {question.correct_answer}
                </Tag>
              ) : (
                <Tag color="orange" className="!m-0 font-medium">No answer set</Tag>
              )}
              {question.scenario_text && (
                <Tag color="geekblue" icon={<FileTextOutlined />} className="!m-0">Scenario</Tag>
              )}
              {question.image_url && (
                <Tag color="purple" icon={<PictureOutlined />} className="!m-0">Image</Tag>
              )}
              {hasExplanation ? (
                <Tag color="cyan" icon={<BookOutlined />} className="!m-0">Explanation</Tag>
              ) : (
                <Tag color="gold" className="!m-0">Needs explanation</Tag>
              )}
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <Tooltip title="Give / edit explanation">
                <Button
                  type="text"
                  size="small"
                  icon={<BookOutlined />}
                  onClick={() => onExplain(question)}
                  className={hasExplanation ? '!text-[#00E5B3]' : '!text-amber-400'}
                />
              </Tooltip>
              <Tooltip title="Edit this question">
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(question)} />
              </Tooltip>
              <Popconfirm
                title="Delete this question?"
                description="It will be removed from this question set."
                onConfirm={() => onDelete(question)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete this question">
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            </div>
          </div>

          {/* Scenario / passage */}
          {question.scenario_text && (
            <div className="mb-3 pl-3 border-l-2 border-[#2A3A30] text-[13px] italic text-[#9BA8A0] whitespace-pre-wrap leading-relaxed">
              {question.scenario_text}
            </div>
          )}

          {/* Question text */}
          <p className="text-sm text-[#E8F5EC] font-medium leading-relaxed whitespace-pre-wrap mb-3">
            {question.question_text}
          </p>

          {/* Question image */}
          {question.image_url && (
            <div className="mb-3">
              <img
                src={question.image_url}
                alt={`Question ${question.question_number}`}
                className="max-h-40 rounded-xl border border-[#232323] object-contain bg-black/40"
              />
            </div>
          )}

          {/* Options */}
          {options.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              {options.map(([key, value]) => {
                const isCorrect = question.correct_answer === key;
                return (
                  <div
                    key={key}
                    className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-[13px] leading-snug ${
                      isCorrect
                        ? 'border-emerald-500/45 bg-emerald-500/10 text-[#E8F5EC]'
                        : 'border-[#232323] bg-[#0F0F0F] text-[#9BA8A0]'
                    }`}
                  >
                    <span
                      className={`shrink-0 w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center ${
                        isCorrect ? 'bg-emerald-500 text-[#04150B]' : 'bg-[#1A1A1A] text-[#7A8A80]'
                      }`}
                    >
                      {key}
                    </span>
                    <span className="min-w-0 break-words">{value}</span>
                    {isCorrect && <CheckCircleFilled className="ml-auto text-emerald-400 mt-0.5" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Explanation */}
          {hasExplanation ? (
            <div className="rounded-xl border border-[#1E2B21] bg-gradient-to-br from-[#0E1812] to-[#0B0B0B] p-3">
              <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <BookOutlined /> Explanation / ব্যাখ্যা
              </div>
              <p className="text-[13px] text-[#C9D6CE] whitespace-pre-wrap leading-relaxed">
                {question.explanation}
              </p>
            </div>
          ) : (
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onExplain(question)}
              className="!text-amber-400 !border-amber-500/35 hover:!border-amber-500/70 !rounded-lg"
            >
              Add Explanation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
