import React, { useState } from 'react';
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
  type AdminQuestion,
} from '@my-monorepo/store';

const { TextArea } = Input;
const { Text } = Typography;

const QuestionBank: React.FC = () => {
  const { data: questions, isLoading, error, refetch } = useGetAdminQuestionsQuery();
  const { data: exams } = useGetAdminExamsQuery();
  const { data: examVersions } = useGetAdminExamVersionsQuery();
  const { data: subjects } = useGetAdminSubjectsQuery();

  const [deleteDocument] = useDeleteAdminQuestionDocumentMutation();
  const [deleteSingleQuestion] = useDeleteAdminSingleQuestionMutation();
  const [updateSingleQuestion] = useUpdateAdminSingleQuestionMutation();

  // ── View/Edit states ───────────────────────────────────────
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{
    docId: string;
    questionNumber: number;
    question_text: string;
    options: Record<string, string>;
    correct_answer?: string;
  } | null>(null);
  const [editForm] = Form.useForm();

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
      options: Record<string, string>;
      correct_answer?: string;
    }
  ) => {
    setEditingQuestion({
      docId,
      questionNumber: q.question_number,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
    });
    editForm.setFieldsValue({
      question_text: q.question_text,
      ...Object.fromEntries(
        Object.entries(q.options).map(([key, val]) => [`option_${key}`, val])
      ),
      correct_answer: q.correct_answer || '',
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
          options,
          correct_answer: values.correct_answer || undefined,
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
        title: 'Actions',
        key: 'actions',
        width: 140,
        render: (_: unknown, rowRecord: any) => (
          <Space>
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
      title: 'Questions',
      dataIndex: 'data',
      key: 'dataCount',
      render: (data: any[]) => (
        <Tag color="cyan">{data?.length || 0} questions</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: AdminQuestion) => (
        <Space>
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
          scroll={{ x: 900 }}
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
    </div>
  );
};

export default QuestionBank;
