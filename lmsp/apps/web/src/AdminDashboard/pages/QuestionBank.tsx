import React, { useState, useMemo } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Spin,
  Alert,
  Tag,
  Popconfirm,
  Tooltip,
  Typography,
} from 'antd';
import {
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  PictureOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RobotOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetAdminQuestionsQuery,
  useGetAdminExamsQuery,
  useGetAdminExamVersionsQuery,
  useGetAdminSubjectsQuery,
  useDeleteAdminQuestionDocumentMutation,
  useDeleteAdminSingleQuestionMutation,
  useUpdateAdminSingleQuestionMutation,
  useUpdateAdminQuestionExplanationMutation,
  useQuestionAnalyzerMutation,
  type AdminQuestion,
  BANGLADESH_BOARDS,
} from '@my-monorepo/store';
import { usePostQuestionPatternMutation } from '@my-monorepo/store/src/redux/api/examApi';
import MediaUpload from '../../reusable/MediaUpload';

const { TextArea } = Input;
const { Text } = Typography;

const QuestionBank: React.FC = () => {
  // ── Filter states ─────────────────────────────────────────
  const [examFilter, setExamFilter] = useState<string>('');
  const [versionFilter, setVersionFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [boardFilter, setBoardFilter] = useState<string>('');

  const filterParams = useMemo(() => {
    const params: { exam?: string; examVersion?: string; subject?: string; board?: string } = {};
    if (examFilter) params.exam = examFilter;
    if (versionFilter) params.examVersion = versionFilter;
    if (subjectFilter) params.subject = subjectFilter;
    if (boardFilter) params.board = boardFilter;
    return Object.keys(params).length ? params : undefined;
  }, [examFilter, versionFilter, subjectFilter, boardFilter]);

  const { data: questions, isLoading, error, refetch } = useGetAdminQuestionsQuery(filterParams);
  const { data: exams } = useGetAdminExamsQuery();
  const { data: examVersions } = useGetAdminExamVersionsQuery();
  const { data: subjects } = useGetAdminSubjectsQuery();

  // ── Dependent filter options ─────────────────────────────
  const filteredExamVersions = useMemo(() => {
    if (!examVersions) return [];
    if (!examFilter) return examVersions;
    return examVersions.filter((v) => v.exam === examFilter);
  }, [examVersions, examFilter]);

  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];
    if (!examFilter) return subjects;
    return subjects.filter((s) => {
      const examId = typeof s.exam === 'object' && s.exam ? s.exam._id : s.exam;
      return examId === examFilter;
    });
  }, [subjects, examFilter]);

  const activeFilterCount =
    (examFilter ? 1 : 0) + (versionFilter ? 1 : 0) + (subjectFilter ? 1 : 0) + (boardFilter ? 1 : 0);

  const handleExamChange = (val: string) => {
    setExamFilter(val || '');
    setVersionFilter(''); // reset dependent filters when exam changes
    setSubjectFilter('');
  };

  const clearAllFilters = () => {
    setExamFilter('');
    setVersionFilter('');
    setSubjectFilter('');
    setBoardFilter('');
  };

  const [deleteDocument] = useDeleteAdminQuestionDocumentMutation();
  const [deleteSingleQuestion] = useDeleteAdminSingleQuestionMutation();
  const [updateSingleQuestion] = useUpdateAdminSingleQuestionMutation();
  const [updateQuestionExplanation] = useUpdateAdminQuestionExplanationMutation();
  const [questionAnalyzer] = useQuestionAnalyzerMutation();
  const [postQuestionPattern] = usePostQuestionPatternMutation();

  // ── View/Edit states ───────────────────────────────────────
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{
    docId: string;
    questionNumber: number;
    question_text: string;
    scenario_text?: string;
    image_url?: string;
    options: Record<string, string>;
    correct_answer?: string;
    explanation?: string;
  } | null>(null);
  const [editForm] = Form.useForm();
  const imageUrl = Form.useWatch('image_url', editForm);

  // ── Quick Explanation Modal State ─────────────────────────
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [explanationTarget, setExplanationTarget] = useState<{
    docId: string;
    questionNumber: number;
    questionText: string;
    explanation: string;
  } | null>(null);
  const [explanationForm] = Form.useForm();
  const [isSavingExplanation, setIsSavingExplanation] = useState(false);

  // ── Pattern analysis state ─────────────────────────────────
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Transform a stored question document into the AI analyzer payload.
  const transformStoredToAnalyzer = (data: AdminQuestion['data'], year: number) => ({
    questions: data.map((item) => {
      const optionKeys = Object.keys(item.options || {});
      const optionValues = optionKeys.map((k) => item.options[k]);
      const correctAnswer = item.options[item.correct_answer || ''] || item.correct_answer || '';
      return {
        year,
        question: item.question_text || '',
        options: optionValues,
        answer: correctAnswer,
      };
    }),
  });

  // ── Lookup helpers ─────────────────────────────────────────
  const getExamName = (examId: string) =>
    exams?.find((e) => e._id === examId)?.name || examId.slice(-8);

  const getVersionName = (versionId?: string) =>
    versionId
      ? examVersions?.find((v) => v._id === versionId)?.examVersion || versionId.slice(-8)
      : '—';

  const getSubjectName = (subjectId?: string) =>
    subjectId
      ? subjects?.find((s) => s._id === subjectId)?.name || subjectId.slice(-8)
      : '—';

  // ── Handlers ───────────────────────────────────────────────
  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id).unwrap();
      message.success('Question document deleted');
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete');
    }
  };

  // ── Run AI pattern analysis on a stored set and save it to the DB ──
  // This is the retry path: if the analysis failed during scraping, admins can
  // re-run it from the Question Bank without re-uploading the PDF.
  const handleAnalyzePattern = async (record: AdminQuestion) => {
    if (!record.data?.length) {
      message.warning('This question set has no questions to analyze.');
      return;
    }
    setAnalyzingId(record._id);
    try {
      const analyzerPayload = transformStoredToAnalyzer(record.data, new Date().getFullYear());
      const res = await questionAnalyzer(analyzerPayload).unwrap();

      const patternPayload: any = { exam: record.exam, res, questionDocumentId: record._id };
      if (record.examVersion) patternPayload.examVersion = record.examVersion;
      if (record.subject) patternPayload.subject = record.subject;
      if (record.board) patternPayload.board = record.board;

      try {
        await postQuestionPattern(patternPayload).unwrap();
        message.success('Question pattern analyzed and stored successfully!');
      } catch (err: any) {
        if (err?.status === 409) {
          // Pattern already exists — the set is considered analyzed.
          message.info('Question pattern already exists for this set (marked as analyzed).');
        } else {
          throw err;
        }
      }
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Analysis failed. Please retry when the AI service is available.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDeleteSingleQuestion = async (docId: string, questionNumber: number) => {
    try {
      await deleteSingleQuestion({ questionId: docId, questionNumber }).unwrap();
      message.success('Question deleted from document');
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete question');
    }
  };

  const openEditModal = (
    docId: string,
    q: {
      question_number: number;
      question_text: string;
      scenario_text?: string;
      image_url?: string;
      options: Record<string, string>;
      correct_answer?: string;
      explanation?: string;
    }
  ) => {
    setEditingQuestion({
      docId,
      questionNumber: q.question_number,
      question_text: q.question_text,
      scenario_text: q.scenario_text,
      image_url: q.image_url,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    });
    editForm.setFieldsValue({
      question_text: q.question_text,
      scenario_text: q.scenario_text || '',
      image_url: q.image_url || '',
      ...Object.fromEntries(
        Object.entries(q.options).map(([key, val]) => [`option_${key}`, val])
      ),
      correct_answer: q.correct_answer || '',
      explanation: q.explanation || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSave = async (values: any) => {
    if (!editingQuestion) return;
    try {
      // Preserve original option keys - build options from only the keys that exist
      const originalKeys = Object.keys(editingQuestion.options);
      const options: Record<string, string> = {};
      originalKeys.forEach((key) => {
        const val = values[`option_${key}`];
        if (val) options[key] = val;
      });

      await updateSingleQuestion({
        questionId: editingQuestion.docId,
        questionNumber: editingQuestion.questionNumber,
        data: {
          question_text: values.question_text,
          scenario_text: values.scenario_text || '',
          image_url: values.image_url || '',
          options,
          correct_answer: values.correct_answer || undefined,
          explanation: values.explanation || '',
        },
      }).unwrap();

      message.success('Question updated successfully!');
      setEditModalOpen(false);
      setEditingQuestion(null);
      editForm.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update question');
    }
  };

  const openExplanationModal = (
    docId: string,
    q: {
      question_number: number;
      question_text: string;
      explanation?: string;
    }
  ) => {
    setExplanationTarget({
      docId,
      questionNumber: q.question_number,
      questionText: q.question_text,
      explanation: q.explanation || '',
    });
    explanationForm.setFieldsValue({
      explanation: q.explanation || '',
    });
    setExplanationModalOpen(true);
  };

  const handleExplanationSave = async (values: { explanation: string }) => {
    if (!explanationTarget) return;
    setIsSavingExplanation(true);
    try {
      await updateQuestionExplanation({
        questionId: explanationTarget.docId,
        questionNumber: explanationTarget.questionNumber,
        explanation: values.explanation || '',
      }).unwrap();

      message.success(`Explanation for question #${explanationTarget.questionNumber} saved!`);
      setExplanationModalOpen(false);
      setExplanationTarget(null);
      explanationForm.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to save explanation');
    } finally {
      setIsSavingExplanation(false);
    }
  };

  // ── Expandable row renderer ────────────────────────────────
  const expandedRowRender = (record: AdminQuestion) => {
    const innerColumns: ColumnsType<any> = [
      {
        title: '#',
        dataIndex: 'question_number',
        key: 'question_number',
        width: 60,
        render: (num: number) => (
          <Text strong style={{ color: '#E8F5EC' }}>
            {num}
          </Text>
        ),
      },
      {
        title: 'Question',
        dataIndex: 'question_text',
        key: 'question_text',
        render: (text: string) => (
          <Text className="text-sm" style={{ maxWidth: 400 }} ellipsis={{ tooltip: text }}>
            {text}
          </Text>
        ),
      },
      {
        title: 'Scenario / Image',
        key: 'scenario',
        width: 150,
        render: (_: unknown, record: any) => (
          <Space direction="vertical" size={2}>
            {record.scenario_text ? (
              <Tag color="geekblue" icon={<FileTextOutlined />}>
                Scenario
              </Tag>
            ) : null}
            {record.image_url ? (
              <Tag color="purple" icon={<PictureOutlined />}>
                Image
              </Tag>
            ) : null}
            {!record.scenario_text && !record.image_url ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                —
              </Text>
            ) : null}
          </Space>
        ),
      },
      {
        title: 'Options',
        key: 'options',
        width: 250,
        render: (_: unknown, record: any) => {
          const optionEntries = Object.entries(record.options || {}) as [string, string][];
          return (
            <div className="flex flex-wrap gap-1">
              {optionEntries.map(([key, val]) => (
                <Tag
                  key={key}
                  color={record.correct_answer === key ? 'green' : 'default'}
                  className="text-xs"
                >
                  {key}: {val.length > 20 ? val.slice(0, 20) + '…' : val}
                </Tag>
              ))}
            </div>
          );
        },
      },
      {
        title: 'Answer',
        dataIndex: 'correct_answer',
        key: 'correct_answer',
        width: 80,
        render: (ans: string) =>
          ans ? (
            <Tag color="green" className="font-bold">
              {ans}
            </Tag>
          ) : (
            <Tag color="orange">N/A</Tag>
          ),
      },
      {
        title: 'Explanation (ব্যাখ্যা)',
        dataIndex: 'explanation',
        key: 'explanation',
        width: 200,
        render: (exp: string, rowRecord: any) =>
          exp ? (
            <Tooltip title={exp}>
              <Tag
                color="cyan"
                icon={<BookOutlined />}
                className="cursor-pointer max-w-[180px] truncate"
                onClick={() => openExplanationModal(record._id, rowRecord)}
              >
                {exp.length > 25 ? exp.slice(0, 25) + '…' : exp}
              </Tag>
            </Tooltip>
          ) : (
            <Button
              type="dashed"
              size="small"
              className="text-xs text-amber-500 border-amber-500/30 hover:border-amber-500"
              icon={<BookOutlined />}
              onClick={() => openExplanationModal(record._id, rowRecord)}
            >
              + Add Explanation
            </Button>
          ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 170,
        render: (_: unknown, rowRecord: any) => (
          <Space>
            <Tooltip title="Provide / Edit Explanation">
              <Button
                type="link"
                size="small"
                icon={<BookOutlined style={{ color: '#00E5B3' }} />}
                onClick={() => openExplanationModal(record._id, rowRecord)}
              />
            </Tooltip>
            <Tooltip title="Edit this question">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditModal(record._id, rowRecord)}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this question?"
              description="This will remove this question from the document."
              onConfirm={() => handleDeleteSingleQuestion(record._id, rowRecord.question_number)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete this question">
                <Button type="link" size="small" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    const dataSource = record.data
      .map((q, idx) => ({ ...q, key: q.question_number || idx }))
      .sort((a, b) => a.question_number - b.question_number);

    return (
      <Table
        columns={innerColumns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        rowKey="question_number"
        style={{ margin: 0 }}
      />
    );
  };

  // ── Main table columns ─────────────────────────────────────
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
      render: (versionId?: string) => (
        <Tag color="purple">{getVersionName(versionId)}</Tag>
      ),
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
      render: (board?: string) => (
        board ? (
          <Tag color="orange" className="font-medium">{board}</Tag>
        ) : (
          <span className="text-sm text-[#5F6B64]">—</span>
        )
      ),
    },
    {
      title: 'Questions',
      dataIndex: 'data',
      key: 'dataCount',
      render: (data: any[]) => (
        <Tag color="cyan">{data?.length || 0} questions</Tag>
      ),
    },
    {
      title: 'Analyzed',
      dataIndex: 'analyzed',
      key: 'analyzed',
      render: (analyzed: boolean) =>
        analyzed ? (
          <Tag color="green" icon={<CheckCircleOutlined />} className="font-medium">
            Yes
          </Tag>
        ) : (
          <Tag color="red" icon={<CloseCircleOutlined />} className="font-medium">
            No
          </Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 320,
      render: (_: unknown, record: AdminQuestion) => (
        <Space>
          <Tooltip title="Run AI pattern analysis on this stored set and save it">
            <Button
              type="link"
              size="small"
              icon={<RobotOutlined />}
              loading={analyzingId === record._id}
              disabled={!!analyzingId}
              onClick={() => handleAnalyzePattern(record)}
            >
              {analyzingId === record._id ? 'Analyzing...' : 'Analyze & Save'}
            </Button>
          </Tooltip>
          <Button
            type="link"
            size="small"
            icon={expandedRowId === record._id ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => setExpandedRowId(expandedRowId === record._id ? null : record._id)}
          >
            {expandedRowId === record._id ? 'Collapse' : 'View'}
          </Button>
          <Popconfirm
            title="Delete this entire question document?"
            description={`This will permanently remove all ${record.data?.length || 0} questions.`}
            onConfirm={() => handleDeleteDocument(record._id)}
            okText="Delete All"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ── Loading / Error states ─────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading question bank..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Question Bank"
        description="There was an error loading the question data."
        type="error"
        showIcon
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  return (
    <div className="">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold m-0" style={{ color: '#E8F5EC' }}>
            <QuestionCircleOutlined style={{ marginRight: 10 }} />
            Question Bank
          </h2>
          <p className="text-sm text-[#5F6B64] mt-1">
            View, edit, and manage all question documents stored in the database
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="flex gap-4 mb-4">
        <div className="bg-[#0B0B0B] rounded-xl border border-[#232323] px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <BookOutlined className="text-emerald-400" />
          </div>
          <div>
            <Text className="text-xs text-[#5F6B64]">Documents</Text>
            <Text className="block text-lg font-bold" style={{ color: '#E8F5EC' }}>
              {questions?.length || 0}
            </Text>
          </div>
        </div>
        <div className="bg-[#0B0B0B] rounded-xl border border-[#232323] px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <QuestionCircleOutlined className="text-emerald-400" />
          </div>
          <div>
            <Text className="text-xs text-[#5F6B64]">Total Questions</Text>
            <Text className="block text-lg font-bold" style={{ color: '#E8F5EC' }}>
              {questions?.reduce((sum, q) => sum + (q.data?.length || 0), 0) || 0}
            </Text>
          </div>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────── */}
      <Card
        style={{ borderRadius: 12, marginBottom: 16, background: '#0B0B0B' }}
        className="!shadow-[0_0_0_1px_#1A1A1A]"
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilterOutlined style={{ color: '#22C55E' }} />
              <span className="text-sm font-semibold" style={{ color: '#E8F5EC' }}>Filters</span>
              {activeFilterCount > 0 && (
                <Tag color="green" className="!text-xs !ml-1">{activeFilterCount} active</Tag>
              )}
            </div>
            {activeFilterCount > 0 && (
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={clearAllFilters}
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
          {/* Exam */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Exam</label>
            <Select
              allowClear
              showSearch
              placeholder="All Exams"
              style={{ width: '100%' }}
              value={examFilter || undefined}
              onChange={handleExamChange}
              optionFilterProp="label"
              options={(exams || []).map((e) => ({ label: e.name, value: e._id }))}
            />
          </div>

          {/* Exam Version */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">
              Exam Version
              {!examFilter && (
                <span className="text-[#5F6B64] font-normal ml-1">(select exam first)</span>
              )}
            </label>
            <Select
              allowClear
              showSearch
              placeholder="All Versions"
              style={{ width: '100%' }}
              value={versionFilter || undefined}
              onChange={(val) => setVersionFilter(val || '')}
              disabled={!examFilter}
              optionFilterProp="label"
              options={filteredExamVersions.map((v) => ({ label: v.examVersion, value: v._id }))}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">
              Subject
              {!examFilter && (
                <span className="text-[#5F6B64] font-normal ml-1">(select exam first)</span>
              )}
            </label>
            <Select
              allowClear
              showSearch
              placeholder="All Subjects"
              style={{ width: '100%' }}
              value={subjectFilter || undefined}
              onChange={(val) => setSubjectFilter(val || '')}
              disabled={!examFilter}
              optionFilterProp="label"
              options={filteredSubjects.map((s) => ({ label: s.name, value: s._id }))}
            />
          </div>

          {/* Board */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-[#9BA8A0]">Board</label>
            <Select
              allowClear
              showSearch
              placeholder="All Boards"
              style={{ width: '100%' }}
              value={boardFilter || undefined}
              onChange={(val) => setBoardFilter(val || '')}
              optionFilterProp="label"
              options={BANGLADESH_BOARDS.map((b) => ({ label: b, value: b }))}
            />
          </div>

          {/* Result count */}
          <div className="flex items-end justify-end pb-1">
            <Text type="secondary" style={{ fontSize: 12 }} className="whitespace-nowrap">
              <strong style={{ color: '#E8F5EC' }}>{questions?.length || 0}</strong> documents
            </Text>
          </div>
        </div>
      </Card>

      {/* ── Main Table ──────────────────────────────────────── */}
      <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={questions}
          rowKey="_id"
          expandable={{
            expandedRowRender,
            expandedRowKeys: expandedRowId ? [expandedRowId] : [],
            onExpand: (expanded, record) => {
              setExpandedRowId(expanded ? record._id : null);
            },
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} documents`,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* ── Edit Question Modal ─────────────────────────────── */}
      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: '#22C55E' }} />
            Edit Question #{editingQuestion?.questionNumber}
          </Space>
        }
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingQuestion(null);
          editForm.resetFields();
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSave}
          className="mt-4"
        >
          <Form.Item
            name="question_text"
            label="Question Text"
            rules={[{ required: true, message: 'Question text is required' }]}
          >
            <TextArea rows={3} placeholder="Enter the question text..." />
          </Form.Item>

          <Form.Item
            name="scenario_text"
            label={
              <span>
                Scenario / Passage Text <span style={{ fontWeight: 400, color: '#5F6B64' }}>(optional)</span>
              </span>
            }
          >
            <TextArea
              rows={3}
              placeholder="Optional passage, case study or scenario that appears above the question..."
            />
          </Form.Item>

          <Form.Item
            name="image_url"
            label={
              <span>
                Question Image <span style={{ fontWeight: 400, color: '#5F6B64' }}>(optional)</span>
              </span>
            }
          >
            <div className="flex flex-col gap-3">
              <MediaUpload
                type="image"
                value={imageUrl}
                onChange={(url) => editForm.setFieldsValue({ image_url: url })}
                label="Upload Image"
              />
              {imageUrl && (
                <div className="flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="Question image preview"
                    style={{
                      maxWidth: 200,
                      maxHeight: 110,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #232323',
                    }}
                  />
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => editForm.setFieldsValue({ image_url: '' })}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            {editingQuestion &&
              Object.keys(editingQuestion.options).map((key) => (
                <Form.Item
                  key={key}
                  name={`option_${key}`}
                  label={`Option ${key}`}
                  rules={[{ required: true, message: `Option ${key} is required` }]}
                >
                  <Input placeholder={`Enter option ${key}`} />
                </Form.Item>
              ))}
          </div>

          <Form.Item
            name="correct_answer"
            label="Correct Answer"
            rules={[{ required: true, message: 'Select the correct answer' }]}
          >
            <Select placeholder="Select correct answer option">
              {editingQuestion &&
                Object.keys(editingQuestion.options).map((key) => (
                  <Select.Option key={key} value={key}>
                    {key} — {editingQuestion.options[key]?.slice(0, 40)}
                    {editingQuestion.options[key]?.length > 40 ? '…' : ''}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="explanation"
            label={
              <span>
                Explanation / ব্যাখ্যা <span style={{ fontWeight: 400, color: '#5F6B64' }}>(detailed solution & reasoning for students)</span>
              </span>
            }
          >
            <TextArea
              rows={4}
              placeholder="Enter explanation in Bengali or English for why this answer is correct..."
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingQuestion(null);
                  editForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Question
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Quick Explanation Modal ─────────────────────────── */}
      <Modal
        title={
          <Space>
            <BookOutlined style={{ color: '#00E5B3' }} />
            <span>Question #{explanationTarget?.questionNumber} Explanation (ব্যাখ্যা)</span>
          </Space>
        }
        open={explanationModalOpen}
        onCancel={() => {
          setExplanationModalOpen(false);
          setExplanationTarget(null);
          explanationForm.resetFields();
        }}
        footer={null}
        width={650}
        destroyOnClose
      >
        <div className="mt-2 mb-4 p-3.5 rounded-xl bg-[#161920] border border-[#23262D]">
          <p className="text-xs text-[#A1A8B3] uppercase font-bold tracking-wider mb-1">
            Question
          </p>
          <p className="text-sm text-[#F5F7FA] font-medium leading-relaxed">
            {explanationTarget?.questionText}
          </p>
        </div>

        <Form
          form={explanationForm}
          layout="vertical"
          onFinish={handleExplanationSave}
        >
          <Form.Item
            name="explanation"
            label={<span className="font-semibold text-sm text-[#E8F5EC]">Detailed Explanation / ব্যাখ্যা</span>}
            rules={[{ required: true, message: 'Please provide an explanation' }]}
          >
            <TextArea
              rows={6}
              placeholder="Write the detailed explanation and breakdown for this question here. This will be shown to students in exam reviews and question views."
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={() => {
                setExplanationModalOpen(false);
                setExplanationTarget(null);
                explanationForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSavingExplanation}
              style={{ backgroundColor: '#00E5B3', color: '#0B0D12', borderColor: '#00E5B3', fontWeight: 600 }}
            >
              Save Explanation
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionBank;
