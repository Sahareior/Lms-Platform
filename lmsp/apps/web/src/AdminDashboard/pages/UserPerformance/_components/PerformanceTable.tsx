import React from 'react';
import { Avatar, Button, Progress, Table, Tag, Tooltip, Typography } from 'antd';
import {
  BarChartOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { AdminQuizAttempt } from '@my-monorepo/store';
import {
  formatDuration,
  getScoreColor,
  getStatusTone,
  getTypeTone,
} from './performanceUtils';

const { Text } = Typography;

interface Props {
  attempts: AdminQuizAttempt[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView: (attempt: AdminQuizAttempt) => void;
}

/** One row per completed attempt. Per-question review lives on its own page. */
const PerformanceTable: React.FC<Props> = ({
  attempts,
  total,
  page,
  pageSize,
  onPageChange,
  onView,
}) => {
  const columns: ColumnsType<AdminQuizAttempt> = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      fixed: 'left',
      render: (user: AdminQuizAttempt['user']) => (
        <div className="flex items-center gap-2.5">
          <Avatar size={36} icon={<UserOutlined />} style={{ backgroundColor: '#14532D', flexShrink: 0 }} />
          <div className="min-w-0">
            <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.3 }} className="!text-[#E8F5EC] truncate">
              {user?.name || user?.username || 'Unknown'}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }} className="truncate block">
              {user?.email || user?.district || '—'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Exam',
      key: 'examInfo',
      width: 190,
      render: (_: unknown, record) => (
        <div className="min-w-0">
          <Text style={{ fontSize: 13 }} className="!text-[#E8F5EC] font-medium block truncate">
            {record.exam?.name || 'N/A'}
          </Text>
          {record.examVersion?.examVersion && (
            <Text type="secondary" style={{ fontSize: 11 }} className="block truncate">
              v: {record.examVersion.examVersion}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Scheduled Exam',
      key: 'scheduleExam',
      width: 200,
      render: (_: unknown, record) =>
        record.scheduleExam?.title ? (
          <div className="min-w-0">
            <Text style={{ fontSize: 12 }} className="!text-[#E8F5EC] font-medium block truncate">
              {record.scheduleExam.title}
            </Text>
            {record.scheduleExam.startDate && (
              <Text type="secondary" style={{ fontSize: 11 }} className="block truncate">
                {dayjs(record.scheduleExam.startDate).format('DD MMM YYYY')}
              </Text>
            )}
          </div>
        ) : (
          <Tag color="default" className="!text-xs">Unscheduled</Tag>
        ),
    },
    {
      title: 'Type',
      key: 'type',
      width: 110,
      render: (_: unknown, record) => {
        const tone = getTypeTone(record.type, record.source);
        return <Tag color={tone.color} className="!text-xs !font-medium">{tone.label}</Tag>;
      },
    },
    {
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
      width: 100,
      render: (board?: string | null) =>
        board ? (
          <Tag color="purple" className="!text-xs">{board}</Tag>
        ) : (
          <span className="text-xs text-[#5F6B64]">—</span>
        ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      width: 140,
      render: (subject?: string | null) =>
        subject ? (
          <span className="text-xs text-[#9BA8A0]">{subject}</span>
        ) : (
          <span className="text-xs text-[#5F6B64]">—</span>
        ),
    },
    {
      title: 'Score',
      key: 'score',
      width: 90,
      align: 'center',
      render: (_: unknown, record) => (
        <div className="text-center">
          <span className="text-sm font-bold text-[#E8F5EC] font-mono">{record.correctCount}</span>
          <span className="text-xs text-[#5F6B64]">/</span>
          <span className="text-xs text-[#9BA8A0] font-mono">{record.totalQuestions}</span>
        </div>
      ),
    },
    {
      title: 'Percentage',
      key: 'percentage',
      width: 150,
      sorter: (a, b) => a.percentage - b.percentage,
      render: (_: unknown, record) => (
        <Progress
          percent={record.percentage}
          size="small"
          strokeColor={getScoreColor(record.percentage)}
          style={{ width: 90, margin: 0 }}
          format={(val) => (
            <span className="text-xs font-semibold" style={{ color: getScoreColor(val || 0) }}>
              {val}%
            </span>
          )}
        />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      render: (_: unknown, record) => {
        const tone = getStatusTone(record.percentage);
        return <Tag color={tone.color} className="!text-xs !font-semibold">{tone.label}</Tag>;
      },
    },
    {
      title: 'Duration',
      key: 'timeTaken',
      width: 100,
      render: (_: unknown, record) => (
        <Tooltip title={record.timeTaken ? `${record.timeTaken} seconds` : 'No data'}>
          <Text type="secondary" style={{ fontSize: 12 }} className="flex items-center gap-1">
            <ClockCircleOutlined className="text-[10px]" />
            {formatDuration(record.timeTaken)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      width: 120,
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render: (date: string) => (
        <div className="text-xs">
          <div className="text-[#E8F5EC] font-medium">{date ? dayjs(date).format('DD MMM YYYY') : '—'}</div>
          {date && <div className="text-[#5F6B64]">{dayjs(date).format('hh:mm A')}</div>}
        </div>
      ),
    },
    {
      title: 'Details',
      key: 'details',
      width: 110,
      fixed: 'right',
      render: (_: unknown, record) => (
        <Button
          type="primary"
          size="small"
          icon={<BarChartOutlined />}
          onClick={() => onView(record)}
          className="!rounded-lg"
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={attempts}
      columns={columns}
      scroll={{ x: 1700 }}
      size="middle"
      className="!bg-transparent"
      showSorterTooltip={false}
      pagination={{
        current: page,
        pageSize,
        total,
        onChange: onPageChange,
        showSizeChanger: false,
        showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} attempts`,
      }}
    />
  );
};

export default PerformanceTable;
