import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  PictureOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  useGetAdminExamsQuery,
  useGetAdminExamVersionsQuery,
  useGetAdminSubjectsQuery,
  useGetCreativeQuestionSetsQuery,
  useUploadCreativeQuestionSetMutation,
  useDeleteCreativeQuestionSetMutation,
  type CQQuestionSetSummary,
} from '@my-monorepo/store';
import ImportQuestionsModal from './ImportQuestionsModal';

const { Text, Title } = Typography;
const { Dragger } = Upload;

const emptySetLabel = (s: CQQuestionSetSummary): string =>
  s.title ||
  [
    typeof s.exam === 'object' && s.exam ? s.exam.name : '',
    typeof s.examVersion === 'object' && s.examVersion ? s.examVersion.examVersion : '',
    typeof s.subject === 'object' && s.subject ? s.subject.name : '',
  ]
    .filter(Boolean)
    .join(' — ') ||
  s._id;

const CreativeQuestions: React.FC = () => {
  const navigate = useNavigate();

  // ── Lookups for the upload form ──
  const { data: exams = [] } = useGetAdminExamsQuery();
  const { data: examVersions = [] } = useGetAdminExamVersionsQuery();
  const { data: subjects = [] } = useGetAdminSubjectsQuery();

  // ── Set list ──
  const {
    data: sets = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetCreativeQuestionSetsQuery(undefined);

  const [uploadSet] = useUploadCreativeQuestionSetMutation();
  const [deleteSet] = useDeleteCreativeQuestionSetMutation();

  // ── Upload drawer state ──
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadExam, setUploadExam] = useState<string>('');
  const [uploadVersion, setUploadVersion] = useState<string>('');
  const [uploadSubject, setUploadSubject] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // ── Upload format guide modal ──
  const [guideOpen, setGuideOpen] = useState(false);

  // ── Quick upload JSON modal state ──
  const [importTarget, setImportTarget] = useState<CQQuestionSetSummary | null>(null);

  // ── Filter states ──
  const [filterNeedImageOnly, setFilterNeedImageOnly] = useState(false);
  const [filterEmptyAnsOnly, setFilterEmptyAnsOnly] = useState(false);

  const versionOptions = useMemo(
    () => examVersions.filter((v) => !uploadExam || v.exam === uploadExam),
    [examVersions, uploadExam]
  );
  const subjectOptions = useMemo(
    () => subjects.filter((s) => {
      const examId = typeof s.exam === 'object' && s.exam ? s.exam._id : s.exam;
      return !uploadExam || examId === uploadExam;
    }),
    [subjects, uploadExam]
  );

  const openUpload = useCallback(() => {
    setUploadExam('');
    setUploadVersion('');
    setUploadSubject('');
    setUploadTitle('');
    setUploadFile(null);
    setUploadErrors([]);
    setUploadOpen(true);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!uploadExam) {
      message.warning('Select an exam first');
      return;
    }
    if (!uploadFile) {
      message.warning('Choose a JSON file to upload');
      return;
    }
    setUploading(true);
    setUploadErrors([]);
    try {
      const res = await uploadSet({
        exam: uploadExam,
        examVersion: uploadVersion || undefined,
        subject: uploadSubject || undefined,
        title: uploadTitle || undefined,
        file: uploadFile,
      }).unwrap();
      message.success(`${res.message} (${res.questionCount} questions)`);
      setUploadOpen(false);
      refetch();
    } catch (err: any) {
      // The server returns structured validation errors for a wrong format.
      const data = err?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setUploadErrors(data.errors);
        message.error(`${data.message || 'Invalid format'} — ${data.errors.length} issue(s)`);
      } else {
        message.error(data?.message || err?.error || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  }, [uploadExam, uploadVersion, uploadSubject, uploadTitle, uploadFile, uploadSet, refetch]);

  const handleDeleteSet = useCallback(
    async (setId: string) => {
      try {
        await deleteSet(setId).unwrap();
        message.success('Question set deleted');
        refetch();
      } catch (err: any) {
        message.error(err?.data?.message || 'Failed to delete set');
      }
    },
    [deleteSet, refetch]
  );

  const downloadTemplate = useCallback(() => {
    const template = [
      {
        id: 'ch1-q1',
        chapterId: 'ch1',
        chapterNumber: 1,
        chapter: 'অধ্যায়ের নাম',
        source: {
          kind: 'board',
          board: 'ঢাকা',
          year: '২০২৫',
          questionNo: '১',
          raw: 'ঢাকা বোর্ড ২০২৫। প্রশ্ন নং ১',
        },
        type: 'cq',
        number: 1,
        stimulus: 'উদ্দীপক...',
        parts: [
          { label: 'ক', text: 'প্রশ্ন...', marks: 1, cognitiveType: 'জ্ঞানমূলক', answer: 'উত্তর...' },
          { label: 'খ', text: 'প্রশ্ন...', marks: 2, cognitiveType: 'অনুধাবন', answer: 'উত্তর...' },
          { label: 'গ', text: 'প্রশ্ন...', marks: 3, cognitiveType: 'প্রয়োগ', answer: 'উত্তর...' },
          { label: 'ঘ', text: 'প্রশ্ন...', marks: 4, cognitiveType: 'উচ্চতর দক্ষতা', answer: 'উত্তর...' },
        ],
        answerNotes: 'ঐচ্ছিক নোট',
      },
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'creative-questions-template.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const columns = useMemo(
    () => [
      {
        title: 'Title',
        key: 'title',
        render: (_: unknown, record: CQQuestionSetSummary) => (
          <Space direction="vertical" size={0}>
            <Text strong>{emptySetLabel(record)}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {(record.chapters ?? [])
                .map((c) => `Ch ${c.number}`)
                .join(', ')}
            </Text>
          </Space>
        ),
      },
      {
        title: 'Questions',
        key: 'questionCount',
        width: 220,
        render: (_: unknown, record: CQQuestionSetSummary) => (
          <Space size={4} wrap>
            <Tag color="blue">{record.questionCount}</Tag>
            {(record.emptyAnswerCount ?? 0) > 0 && (
              <Tag color="error" icon={<ExclamationCircleOutlined />}>
                {record.emptyAnswerCount} empty ans
              </Tag>
            )}
            {(record.imageNeededCount ?? 0) > 0 && (
              <Tag color="warning" icon={<PictureOutlined />}>
                {record.imageNeededCount} need image
              </Tag>
            )}
          </Space>
        ),
      },
      {
        title: 'Uploaded',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 120,
        render: (d?: string) => (d ? new Date(d).toLocaleDateString() : '—'),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 240,
        render: (_: unknown, record: CQQuestionSetSummary) => (
          <Space>
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/creative-questions/${record._id}`)}
            >
              Edit
            </Button>
            <Button
              size="small"
              icon={<CloudUploadOutlined />}
              onClick={() => setImportTarget(record)}
            >
              Upload JSON
            </Button>
            <Popconfirm
              title="Delete this entire question set?"
              description="All its questions will be removed."
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDeleteSet(record._id)}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [navigate, handleDeleteSet]
  );

  const totalImageNeededCount = useMemo(
    () => sets.reduce((acc, s) => acc + (s.imageNeededCount || 0), 0),
    [sets]
  );

  const totalEmptyAnsCount = useMemo(
    () => sets.reduce((acc, s) => acc + (s.emptyAnswerCount || 0), 0),
    [sets]
  );

  const displayedSets = useMemo(() => {
    return sets.filter((s) => {
      if (filterEmptyAnsOnly && (s.emptyAnswerCount || 0) === 0) return false;
      if (filterNeedImageOnly && (s.imageNeededCount || 0) === 0) return false;
      return true;
    });
  }, [sets, filterEmptyAnsOnly, filterNeedImageOnly]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 2 }}>
            Creative Questions (সৃজনশীল)
          </Title>
          <Text type="secondary">
            Test-paper sets used by the Reading page — classified by exam, exam version and subject.
          </Text>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
            Refresh
          </Button>
          {totalEmptyAnsCount > 0 && (
            <Button
              type={filterEmptyAnsOnly ? 'primary' : 'default'}
              danger
              icon={<ExclamationCircleOutlined />}
              onClick={() => setFilterEmptyAnsOnly(!filterEmptyAnsOnly)}
            >
              {filterEmptyAnsOnly ? 'Show All Sets' : `Empty Ans (${totalEmptyAnsCount})`}
            </Button>
          )}
          {totalImageNeededCount > 0 && (
            <Button
              type={filterNeedImageOnly ? 'primary' : 'default'}
              style={filterNeedImageOnly ? { background: '#fa8c16', borderColor: '#fa8c16' } : {}}
              icon={<PictureOutlined />}
              onClick={() => setFilterNeedImageOnly(!filterNeedImageOnly)}
            >
              {filterNeedImageOnly ? 'Show All Sets' : `Need Images (${totalImageNeededCount})`}
            </Button>
          )}
          <Button icon={<FileTextOutlined />} onClick={() => setGuideOpen(true)}>
            Format Guide
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openUpload}>
            Upload JSON
          </Button>
        </Space>
      </div>

      <Card variant="borderless">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={displayedSets}
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{
            emptyText: filterEmptyAnsOnly
              ? 'No question sets currently have questions with empty answers'
              : filterNeedImageOnly
              ? 'No question sets currently have questions needing images'
              : 'No question sets uploaded yet',
          }}
        />
      </Card>

      {/* ── Upload drawer ── */}
      <Drawer
        title="Upload Creative Question Set"
        width={480}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        destroyOnHidden
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>
              Exam <span style={{ color: '#ff4d4f' }}>*</span>
            </Text>
            <Select
              showSearch
              optionFilterProp="label"
              style={{ width: '100%' }}
              placeholder="Select exam"
              value={uploadExam || undefined}
              onChange={(v) => {
                setUploadExam(v);
                setUploadVersion('');
                setUploadSubject('');
              }}
              options={exams.map((e) => ({ label: e.name, value: e._id }))}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>
              Exam Version
            </Text>
            <Select
              showSearch
              optionFilterProp="label"
              allowClear
              style={{ width: '100%' }}
              placeholder="Optional (e.g. 2026)"
              disabled={!uploadExam}
              value={uploadVersion || undefined}
              onChange={(v) => setUploadVersion(v || '')}
              options={versionOptions.map((v) => ({
                label: v.examVersion,
                value: v._id,
              }))}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>
              Subject
            </Text>
            <Select
              showSearch
              optionFilterProp="label"
              allowClear
              style={{ width: '100%' }}
              placeholder="Optional (e.g. ICT)"
              disabled={!uploadExam}
              value={uploadSubject || undefined}
              onChange={(v) => setUploadSubject(v || '')}
              options={subjectOptions.map((s) => ({
                label: s.name,
                value: s._id,
              }))}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>
              Title
            </Text>
            <Input
              placeholder="Optional display title (e.g. HSC ICT Test Paper 2026)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>
              JSON file <span style={{ color: '#ff4d4f' }}>*</span>
            </Text>
            <Dragger
              accept=".json,application/json"
              maxCount={1}
              beforeUpload={(file) => {
                setUploadFile(file);
                setUploadErrors([]);
                return false; // manual upload
              }}
              onRemove={() => setUploadFile(null)}
              fileList={uploadFile ? [uploadFile as any] : []}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag the JSON file here</p>
              <p className="ant-upload-hint">Format is validated on upload — wrong files are rejected with details.</p>
            </Dragger>
          </div>

          {uploadErrors.length > 0 && (
            <Alert
              type="error"
              showIcon
              message={`Invalid format — ${uploadErrors.length} issue(s) found`}
              description={
                <ul style={{ margin: '4px 0 0 16px', padding: 0, maxHeight: 220, overflowY: 'auto' }}>
                  {uploadErrors.map((e, i) => (
                    <li key={i} style={{ fontSize: 12, marginBottom: 2 }}>
                      {e}
                    </li>
                  ))}
                </ul>
              }
            />
          )}

          <Button
            type="primary"
            block
            loading={uploading}
            disabled={!uploadExam || !uploadFile}
            onClick={handleUpload}
            icon={<CloudUploadOutlined />}
          >
            Upload & Save to Database
          </Button>
        </Space>
      </Drawer>

      {/* ── Format guide ── */}
      <Modal
        title="Expected JSON format"
        open={guideOpen}
        onCancel={() => setGuideOpen(false)}
        footer={[
          <Button key="dl" icon={<DownloadOutlined />} onClick={downloadTemplate}>
            Download template
          </Button>,
          <Button key="ok" type="primary" onClick={() => setGuideOpen(false)}>
            OK
          </Button>,
        ]}
        width={640}
      >
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Root">
            An <Text code>array</Text> of question objects.
          </Descriptions.Item>
          <Descriptions.Item label="id">
            Unique string, e.g. <Text code>ch1-q1</Text>
          </Descriptions.Item>
          <Descriptions.Item label="chapter*">
            <Text code>chapterId</Text> (string), <Text code>chapterNumber</Text> (positive int),{' '}
            <Text code>chapter</Text> (name)
          </Descriptions.Item>
          <Descriptions.Item label="number">
            Positive int, unique within the file
          </Descriptions.Item>
          <Descriptions.Item label="source">
            Optional object: <Text code>kind, board, year, questionNo, raw</Text> (all strings)
          </Descriptions.Item>
          <Descriptions.Item label="stimulus">
            Optional string (the উদ্দীপক)
          </Descriptions.Item>
          <Descriptions.Item label="parts">
            Required non-empty array of{' '}
            <Text code>{'{ label, text, marks?, cognitiveType?, answer? }'}</Text> — one per
            ক/খ/গ/ঘ
          </Descriptions.Item>
          <Descriptions.Item label="answerNotes">
            Optional string
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* ── Import questions modal ── */}
      {importTarget && (
        <ImportQuestionsModal
          open={!!importTarget}
          onClose={() => setImportTarget(null)}
          setId={importTarget._id}
          setTitle={emptySetLabel(importTarget)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};

export default CreativeQuestions;
