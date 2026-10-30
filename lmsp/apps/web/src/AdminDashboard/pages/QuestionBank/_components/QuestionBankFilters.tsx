import React from 'react';
import { Card, Select, Button, Tag } from 'antd';
import { ClearOutlined, FilterOutlined } from '@ant-design/icons';
import type { FilterOption } from './questionBankUtils';

export interface QuestionBankFilterValues {
  exam: string;
  examVersion: string;
  subject: string;
  board: string;
}

interface Props {
  values: QuestionBankFilterValues;
  activeCount: number;
  resultCount: number;
  examOptions: FilterOption[];
  boardOptions: FilterOption[];
  /** Options are empty until an exam is selected — the dependent selects explain that in their label. */
  getVersionOptions: (examId: string) => FilterOption[];
  getSubjectOptions: (examId: string) => FilterOption[];
  onChange: (key: keyof QuestionBankFilterValues, value: string) => void;
  onClear: () => void;
}

const QuestionBankFilters: React.FC<Props> = ({
  values,
  activeCount,
  resultCount,
  examOptions,
  boardOptions,
  getVersionOptions,
  getSubjectOptions,
  onChange,
  onClear,
}) => {
  // Version and subject both hang off the selected exam.
  const requiresExam = !values.exam;
  const hint = <span className="text-[#5F6B64] font-normal ml-1">(select exam first)</span>;

  return (
    <Card
      style={{ borderRadius: 12, marginBottom: 16, background: '#0B0B0B' }}
      className="!shadow-[0_0_0_1px_#1A1A1A]"
      title={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FilterOutlined style={{ color: '#22C55E' }} />
            <span className="text-sm font-semibold" style={{ color: '#E8F5EC' }}>Filters</span>
            {activeCount > 0 && <Tag color="green" className="!text-xs !ml-1">{activeCount} active</Tag>}
          </div>
          {activeCount > 0 && (
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={onClear}
              className="!text-[#9BA8A0] hover:!text-[#EB5757]"
            >
              Clear all
            </Button>
          )}
        </div>
      }
      styles={{ header: { borderBottom: '1px solid #1A1A1A', padding: '12px 16px' } }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Exam</label>
          <Select
            allowClear
            showSearch
            placeholder="All Exams"
            style={{ width: '100%' }}
            value={values.exam || undefined}
            onChange={(val) => onChange('exam', val || '')}
            optionFilterProp="label"
            options={examOptions}
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">
            Exam Version {requiresExam && hint}
          </label>
          <Select
            allowClear
            showSearch
            placeholder="All Versions"
            style={{ width: '100%' }}
            value={values.examVersion || undefined}
            onChange={(val) => onChange('examVersion', val || '')}
            disabled={requiresExam}
            optionFilterProp="label"
            options={getVersionOptions(values.exam)}
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">
            Subject {requiresExam && hint}
          </label>
          <Select
            allowClear
            showSearch
            placeholder="All Subjects"
            style={{ width: '100%' }}
            value={values.subject || undefined}
            onChange={(val) => onChange('subject', val || '')}
            disabled={requiresExam}
            optionFilterProp="label"
            options={getSubjectOptions(values.exam)}
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Board</label>
          <Select
            allowClear
            showSearch
            placeholder="All Boards"
            style={{ width: '100%' }}
            value={values.board || undefined}
            onChange={(val) => onChange('board', val || '')}
            optionFilterProp="label"
            options={boardOptions}
          />
        </div>

        <div className="flex items-end justify-end pb-1">
          <span className="whitespace-nowrap text-xs text-[#9BA8A0]">
            <strong className="text-[#E8F5EC]">{resultCount}</strong> documents
          </span>
        </div>
      </div>
    </Card>
  );
};

export default QuestionBankFilters;
