import React from 'react';
import { Table, Button, Tag, Tooltip, Space, Popconfirm, Typography } from 'antd';
import {
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AdminQuestion } from '@my-monorepo/store';

const { Text } = Typography;

interface Props {
  questions: AdminQuestion[];
  isFetching: boolean;
  analyzingId: string | null;
  getExamName: (id?: string) => string;
  getVersionName: (id?: string) => string;
  getSubjectName: (id?: string) => string;
  onManage: (record: AdminQuestion) => void;
  onAnalyze: (record: AdminQuestion) => void;
  onDeleteDocument: (id: string) => void;
}

/**
 * The bank overview: one row per stored question document.
 *
 * Individual questions are *not* managed here — expanding a table inside a
 * table is what made this page hard to use. Each row links to its own
 * QuestionManager page instead.
 */
const QuestionBankTable: React.FC<Props> = ({
  questions,
  isFetching,
  analyzingId,
  getExamName,
  getVersionName,
  getSubjectName,
  onManage,
  onAnalyze,
  onDeleteDocument,
}) => {
  const columns: ColumnsType<AdminQuestion> = [
    {
      title: 'Exam',
      dataIndex: 'exam',
      key: 'exam',
      render: (examId: string) => (
        <Tag color="blue" className="font-medium">
          {getExamName(examId)}
        </Tag>
      ),
      sorter: (a, b) => getExamName(a.exam).localeCompare(getExamName(b.exam)),
    },
    {
      title: 'Version',
      dataIndex: 'examVersion',
      key: 'examVersion',
      render: (versionId?: string) => <Tag color="purple">{getVersionName(versionId)}</Tag>,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subjectId?: string) => (
        <span className="text-sm text-[#9BA8A0]">{getSubjectName(subjectId)}</span>
      ),
    },
    {
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
      render: (board?: string) =>
        board ? (
          <Tag color="orange" className="font-medium">{board}</Tag>
        ) : (
          <span className="text-sm text-[#5F6B64]">—</span>
        ),
    },
    {
      title: 'Questions',
      dataIndex: 'data',
      key: 'dataCount',
      align: 'center',
      render: (data: AdminQuestion['data']) => <Tag color="cyan">{data?.length || 0}</Tag>,
      sorter: (a, b) => (a.data?.length || 0) - (b.data?.length || 0),
    },
    {
      title: 'Analyzed',
      dataIndex: 'analyzed',
      key: 'analyzed',
      align: 'center',
      render: (analyzed: boolean) =>
        analyzed ? (
          <Tag color="green" icon={<CheckCircleOutlined />} className="font-medium">Yes</Tag>
        ) : (
          <Tag color="red" icon={<CloseCircleOutlined />} className="font-medium">No</Tag>
        ),
      filters: [
        { text: 'Analyzed', value: true },
        { text: 'Not analyzed', value: false },
      ],
      onFilter: (value, record) => !!record.analyzed === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 300,
      render: (_: unknown, record: AdminQuestion) => (
        <Space size={4} wrap>
          <Tooltip title="Open the question manager for this document">
            <Button
              size="small"
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => onManage(record)}
              className="!rounded-lg"
            >
              Manage
            </Button>
          </Tooltip>
          <Tooltip title="Run AI pattern analysis on this stored set and save it">
            <Button
              type="link"
              size="small"
              icon={<RobotOutlined />}
              loading={analyzingId === record._id}
              disabled={!!analyzingId}
              onClick={() => onAnalyze(record)}
            >
              Analyze
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete this entire question document?"
            description={`This will permanently remove all ${record.data?.length || 0} questions.`}
            onConfirm={() => onDeleteDocument(record._id)}
            okText="Delete All"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete the whole document">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={questions}
      loading={isFetching}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {range[0]}-{range[1]} of {total} documents
          </Text>
        ),
      }}
      scroll={{ x: 1000 }}
    />
  );
};

export default QuestionBankTable;
