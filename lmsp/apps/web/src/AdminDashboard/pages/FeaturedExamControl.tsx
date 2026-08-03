import React, { useState } from 'react';
import { Table, Card, Button, Modal, Tag, Space, Spin, Alert, Empty, Typography, message } from 'antd';
import { ReloadOutlined, StarFilled, StarOutlined, ArrowUpOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  useGetScheduleExamsQuery,
  useGetFeaturedScheduleExamQuery,
  useSetFeaturedScheduleExamMutation,
  type ScheduleExam,
} from '@my-monorepo/store';

const { Title, Text, Paragraph } = Typography;

const statusColors: Record<string, string> = {
  upcoming: 'blue',
  active: 'green',
  completed: 'default',
  cancelled: 'red',
};

const FeaturedExamControl: React.FC = () => {
  const { data: scheduleExams, isLoading, error, refetch } = useGetScheduleExamsQuery();
  const { data: featuredExam, isLoading: featuredLoading } = useGetFeaturedScheduleExamQuery();
  const [setFeatured, { isLoading: isSettingFeatured }] = useSetFeaturedScheduleExamMutation();

  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unfeatureOpen, setUnfeatureOpen] = useState(false);

  const featuredIdFromServer = featuredExam?._id ?? null;
  const currentFeaturedId = featuredId ?? featuredIdFromServer;

  const handleSetFeatured = async () => {
    if (!featuredId) return;
    try {
      await setFeatured({ examId: featuredId, isFeatured: true }).unwrap();
      message.success('Mock exam featured successfully!');
      setConfirmOpen(false);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to feature exam');
    }
  };

  const handleRemoveFeatured = async () => {
    if (!currentFeaturedId) return;
    try {
      await setFeatured({ examId: currentFeaturedId, isFeatured: false }).unwrap();
      message.success('Featured mock exam removed.');
      setUnfeatureOpen(false);
      setFeaturedId(null);
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to remove featured exam');
    }
  };

  const columns: ColumnsType<ScheduleExam> = [
    {
      title: 'Mock Exam',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: ScheduleExam) => (
        <div>
          <div className="font-medium flex items-center gap-2" style={{ color: '#E8F5EC' }}>
            {title}
            {record.isFeatured && <Tag color="green" icon={<StarFilled />}>FEATURED</Tag>}
          </div>
          {record.description && (
            <div className="text-xs text-[#5F6B64] truncate max-w-[280px]">{record.description}</div>
          )}
        </div>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Exam',
      key: 'exam',
      render: (_: unknown, record: ScheduleExam) => {
        const name = typeof record.exam === 'object' ? record.exam.name : record.exam;
        return <span className="text-sm">{name || '—'}</span>;
      },
    },
    {
      title: 'Version',
      key: 'version',
      render: (_: unknown, record: ScheduleExam) => {
        const v = typeof record.examVersion === 'object' ? record.examVersion.examVersion : record.examVersion;
        return <Tag color="purple">{v || '—'}</Tag>;
      },
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_: unknown, record: ScheduleExam) => (
        <div className="text-xs text-[#9BA8A0]">
          <div>{dayjs(record.startDate).format('DD MMM, hh:mm A')}</div>
          <div className="text-[#5F6B64]">→ {dayjs(record.endDate).format('DD MMM, hh:mm A')}</div>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (mins: number) => <span className="text-sm">{mins} min</span>,
    },
    {
      title: 'Questions',
      dataIndex: 'totalQuestions',
      key: 'totalQuestions',
      render: (val: number) => <Tag color="cyan">{val || 0}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: ScheduleExam) => (
        <Space>
          {currentFeaturedId === record._id ? (
            <Button
              size="small"
              icon={<StarFilled />}
              onClick={() => setUnfeatureOpen(true)}
              loading={isSettingFeatured}
            >
              Featured
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              ghost
              icon={<StarOutlined />}
              onClick={() => { setFeaturedId(record._id); setConfirmOpen(true); }}
              disabled={record.status === 'cancelled'}
            >
              Feature
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading || featuredLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading featured mock exam..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Scheduled Exams"
        description="There was an error loading the scheduled exam list."
        type="error"
        showIcon
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} style={{ margin: 0, color: '#E8F5EC' }}>Featured Mock Exam</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Choose which mock exam appears prominently on the student dashboard.
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={refetch}>Refresh</Button>
      </div>

      {/* ── Current Featured Highlight ─────────────────────── */}
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #0E1A12 0%, #0B0B0B 100%)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}
      >
        <div className="flex flex-wrap items-center gap-5">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #22C55E, #14532D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            <StarFilled />
          </div>
          {featuredExam ? (
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2">
                <Text strong style={{ fontSize: 16, color: '#E8F5EC' }}>{featuredExam.title}</Text>
                <Tag color="green" icon={<StarFilled />}>LIVE ON DASHBOARD</Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {typeof featuredExam.exam === 'object' ? featuredExam.exam.name : ''}
                {typeof featuredExam.examVersion === 'object' && featuredExam.examVersion.examVersion
                  ? ` • ${featuredExam.examVersion.examVersion}` : ''}
                {' • '}{featuredExam.totalQuestions} Questions • {featuredExam.duration} min
                {' • '}{dayjs(featuredExam.endDate).format('DD MMM YYYY, hh:mm A')}
              </Text>
            </div>
          ) : (
            <div className="flex-1">
              <Text strong style={{ fontSize: 15, color: '#4ADE80' }}>
                <EyeOutlined style={{ marginRight: 8 }} />
                No mock exam is currently featured
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Select an exam from the table below and click <b>Feature</b> to showcase it on the student dashboard.
                </Text>
              </div>
            </div>
          )}
          {featuredExam && (
            <Button danger size="small" icon={<StarOutlined />} onClick={() => setUnfeatureOpen(true)}>
              Remove from Dashboard
            </Button>
          )}
        </div>
      </Card>

      {/* ── Guidance ──────────────────────────────────────── */}
      <Card style={{ borderRadius: 12, marginBottom: 24 }} size="small">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#9BA8A0]">
          <span><ArrowUpOutlined style={{ color: '#22C55E', marginRight: 6 }} />Only one mock exam can be featured at a time.</span>
          <span><StarFilled style={{ color: '#22C55E', marginRight: 6 }} />Featuring an exam replaces the previously featured one.</span>
        </div>
      </Card>

      <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={scheduleExams}
          rowKey="_id"
          onRow={(record) => ({
            style:
              currentFeaturedId === record._id
                ? { background: 'rgba(34, 197, 94, 0.08)' }
                : undefined,
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} scheduled exams`,
          }}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: <Empty description="No scheduled exams yet. Create one from Exam Control first." />,
          }}
        />
      </Card>

      {/* ── Confirm Feature Modal ─────────────────────────── */}
      <Modal
        title="Feature this Mock Exam?"
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onOk={handleSetFeatured}
        okText="Feature Exam"
        confirmLoading={isSettingFeatured}
        okButtonProps={{ icon: <StarFilled /> }}
      >
        <Paragraph className="mt-4">
          This mock exam will be displayed on the <b>student dashboard</b> as the featured mock exam.
        </Paragraph>
        {featuredIdFromServer && featuredIdFromServer !== featuredId && (
          <Alert
            type="warning"
            showIcon
            message={`This will replace the currently featured exam "${scheduleExams?.find((e) => e._id === featuredIdFromServer)?.title}".`}
          />
        )}
      </Modal>

      {/* ── Confirm Remove Modal ──────────────────────────── */}
      <Modal
        title="Remove from Dashboard?"
        open={unfeatureOpen}
        onCancel={() => setUnfeatureOpen(false)}
        onOk={handleRemoveFeatured}
        okText="Remove"
        okButtonProps={{ danger: true }}
        confirmLoading={isSettingFeatured}
      >
        <Paragraph className="mt-4">
          The featured mock exam will no longer be shown on the student dashboard.
        </Paragraph>
      </Modal>
    </div>
  );
};

export default FeaturedExamControl;
