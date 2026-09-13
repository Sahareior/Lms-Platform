import React from 'react';
import { Card, Tag, Button, Select, DatePicker, Typography } from 'antd';
import { ClearOutlined, FilterOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { BANGLADESH_BOARDS } from '@my-monorepo/store';

const { Text } = Typography;
const { RangePicker } = DatePicker;

/** `scheduleExam` holds a ScheduleExam id, `'none'` for unattached attempts, or `''` for any. */
export interface PerformanceFilterValues {
  scheduleExam: string;
  type: string;
  exam: string;
  examVersion: string;
  board: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
}

export const EMPTY_PERFORMANCE_FILTERS: PerformanceFilterValues = {
  scheduleExam: '',
  type: '',
  exam: '',
  examVersion: '',
  board: '',
  dateRange: null,
};

export const countActiveFilters = (values: PerformanceFilterValues): number =>
  [
    values.scheduleExam,
    values.type,
    values.exam,
    values.examVersion,
    values.board,
    values.dateRange,
  ].filter(Boolean).length;

interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  values: PerformanceFilterValues;
  activeCount: number;
  resultCount: number;
  examOptions: SelectOption[];
  versionOptions: SelectOption[];
  /** Exams scheduled in Exam Control, plus the "unscheduled" option. */
  scheduleExamOptions: SelectOption[];
  onChange: (
    key: keyof PerformanceFilterValues,
    value: PerformanceFilterValues[keyof PerformanceFilterValues]
  ) => void;
  onClear: () => void;
}

const TYPE_OPTIONS: SelectOption[] = [
  { label: 'Mock Exam', value: 'mock_exam' },
  { label: 'Practice', value: 'practice' },
];

const BOARD_OPTIONS: SelectOption[] = BANGLADESH_BOARDS.map((b) => ({ label: b, value: b }));

/**
 * Filter panel for the attempts table.
 *
 * Scheduled exams come first because that's how admins actually think about
 * results: "how did people do on the Dhaka board mock I scheduled?", not
 * "show me every HSC attempt ever".
 */
const PerformanceFilters: React.FC<Props> = ({
  values,
  activeCount,
  resultCount,
  examOptions,
  versionOptions,
  scheduleExamOptions,
  onChange,
  onClear,
}) => {
  const requiresExam = !values.exam;
  const hint = <span className="text-[#5F6B64] font-normal ml-1">(select exam first)</span>;

  return (
    <Card
      style={{ borderRadius: 12, marginBottom: 16, background: '#0B0B0B' }}
      className="!shadow-[0_0_0_1px_#1A1A1A]"
      title={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-[#22C55E]" />
            <span className="text-sm font-semibold text-[#E8F5EC]">Filters</span>
            {activeCount > 0 && <Tag color="green" className="!text-xs !ml-1">{activeCount} active</Tag>}
          </div>
          <div className="flex items-center gap-3">
            <Text type="secondary" style={{ fontSize: 12 }} className="whitespace-nowrap">
              <strong className="text-[#E8F5EC]">{resultCount}</strong> results
            </Text>
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
        </div>
      }
      styles={{ header: { borderBottom: '1px solid #1A1A1A', padding: '12px 16px' } }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Scheduled exam (created in Exam Control) */}
        <div>
          <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Scheduled Exam</label>
          <Select
            allowClear
            showSearch
            placeholder="All Exams & Practice"
            style={{ width: '100%' }}
            value={values.scheduleExam || undefined}
            onChange={(val) => onChange('scheduleExam', val || '')}
            optionFilterProp="label"
            options={scheduleExamOptions}
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Quiz Type</label>
          <Select
            allowClear
            placeholder="All Types"
            style={{ width: '100%' }}
            value={values.type || undefined}
            onChange={(val) => onChange('type', val || '')}
            options={TYPE_OPTIONS}
          />
        </div>

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
            options={versionOptions}
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
            options={BOARD_OPTIONS}
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Date Range</label>
          <RangePicker
            style={{ width: '100%' }}
            value={values.dateRange}
            onChange={(dates) => onChange('dateRange', dates as [Dayjs | null, Dayjs | null] | null)}
            format="DD MMM YYYY"
            placeholder={['Start date', 'End date']}
            allowClear
          />
        </div>
      </div>
    </Card>
  );
};

export default PerformanceFilters;
