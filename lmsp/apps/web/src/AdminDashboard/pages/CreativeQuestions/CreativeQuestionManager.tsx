import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Empty,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetCreativeQuestionSetByIdQuery,
  useUpdateCreativeQuestionSetMutation,
  useUpdateCreativeQuestionMutation,
  useDeleteCreativeQuestionMutation,
  type CQQuestion,
  type CQPart,
} from '@my-monorepo/store';
import { useAdminTheme } from '../../ThemeContext';

const { Text, Title } = Typography;
const { TextArea } = Input;

/** Form state for one question (all fields editable as plain text). */
interface QuestionFormState {
  id: string;
  chapterId: string;
  chapterNumber: number;
  chapter: string;
  number: number;
  stimulus: string;
  board: string;
  year: string;
  questionNo: string;
  answerNotes: string;
  parts: Array<{
    label: string;
    text: string;
    marks: number;
    cognitiveType: string;
    answer: string;
  }>;
}

const emptyPart = (label: string): QuestionFormState['parts'][number] => ({
  label,
  text: '',
  marks: label === 'ক' ? 1 : label === 'খ' ? 2 : label === 'গ' ? 3 : 4,
  cognitiveType: '',
  answer: '',
});

const toFormState = (q: CQQuestion): QuestionFormState => ({
  id: q.id,
  chapterId: q.chapterId,
  chapterNumber: q.chapterNumber,
  chapter: q.chapter,
  number: q.number,
  stimulus: q.stimulus ?? '',
  board: q.source?.board ?? '',
  year: q.source?.year ?? '',
  questionNo: q.source?.questionNo ?? '',
  answerNotes: q.answerNotes ?? '',
  parts: (q.parts ?? []).map((p: CQPart) => ({
    label: p.label,
    text: p.text,
    marks: p.marks ?? 0,
    cognitiveType: p.cognitiveType ?? '',
    answer: p.answer ?? '',
  })),
});

const toPayload = (form: QuestionFormState): Partial<CQQuestion> => ({
  id: form.id.trim(),
  chapterId: form.chapterId.trim(),
  chapterNumber: form.chapterNumber,
  chapter: form.chapter.trim(),
  number: form.number,
  stimulus: form.stimulus,
  source: {
    kind: 'board',
    board: form.board,
    year: form.year,
    questionNo: form.questionNo,
    raw: form.board ? `${form.board} ${form.year}` : '',
  },
  parts: form.parts,
  answerNotes: form.answerNotes,
});

const CreativeQuestionManager: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { isDark } = useAdminTheme();

  const { data: set, isLoading, isError, refetch, isFetching } = useGetCreativeQuestionSetByIdQuery(setId ?? '', { skip: !setId });
  const [updateSet] = useUpdateCreativeQuestionSetMutation();
  const [updateQuestion] = useUpdateCreativeQuestionMutation();
  const [deleteQuestion] = useDeleteCreativeQuestionMutation();

  // ── Editor drawer state ──
  const [editing, setEditing] = useState<QuestionFormState | null>(null);
  const [editingIsNew, setEditingIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CQQuestion | null>(null);

  // ── Meta editor state ──
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  const questions = useMemo(() => set?.questions ?? [], [set]);

  const openEdit = useCallback((q: CQQuestion) => {
    setEditingIsNew(false);
    setEditing(toFormState(q));
  }, []);

  const openCreate = useCallback(() => {
    if (questions.length === 0) {
      message.warning('Upload a JSON file first — new questions inherit the chapter of existing ones.');
      return;
    }
    const first = questions[0];
    setEditingIsNew(true);
    setEditing({
      id: `${first.chapterId}-q-new-${Date.now().toString(36)}`,
      chapterId: first.chapterId,
      chapterNumber: first.chapterNumber,
      chapter: first.chapter,
      number: Math.max(...questions.map((q) => q.number)) + 1,
      stimulus: '',
      board: first.source?.board ?? '',
      year: first.source?.year ?? '',
      questionNo: '',
      answerNotes: '',
      parts: [emptyPart('ক'), emptyPart('খ'), emptyPart('গ'), emptyPart('ঘ')],
    });
  }, [questions]);

  const handleSave = useCallback(async () => {
    if (!set || !editing) return;
    if (!editing.id.trim()) {
      message.error('Question id is required');
      return;
    }
    if (editing.parts.some((p) => !p.label.trim() || !p.text.trim())) {
      message.error('Every part needs a label and text');
      return;
    }
    setSaving(true);
    try {
      if (editingIsNew) {
        // Add: append via set update (validated server-side).
        await updateSet({
          setId: set._id,
          data: { questions: [...questions, toPayload(editing) as CQQuestion] },
        }).unwrap();
        message.success('Question added');
      } else {
        await updateQuestion({
          setId: set._id,
          questionId: editing.id,
          data: toPayload(editing),
        }).unwrap();
        message.success('Question updated');
      }
      setEditing(null);
      refetch();
    } catch (err: any) {
      const data = err?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        message.error(`${data.message}: ${data.errors[0]}`);
      } else {
        message.error(data?.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  }, [set, editing, editingIsNew, questions, updateSet, updateQuestion, refetch]);

  const handleDelete = useCallback(async () => {
    if (!set || !deleteTarget) return;
    try {
      await deleteQuestion({ setId: set._id, questionId: deleteTarget.id }).unwrap();
      message.success('Question deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Delete failed');
    }
  }, [set, deleteTarget, deleteQuestion, refetch]);

  const openMeta = useCallback(() => {
    setMetaTitle(set?.title ?? '');
    setMetaDesc(set?.description ?? '');
    setMetaOpen(true);
  }, [set]);

  const handleSaveMeta = useCallback(async () => {
    if (!set) return;
    setSavingMeta(true);
    try {
      await updateSet({
        setId: set._id,
        data: { title: metaTitle, description: metaDesc },
      }).unwrap();
      message.success('Set details updated');
      setMetaOpen(false);
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Update failed');
    } finally {
      setSavingMeta(false);
    }
  }, [set, metaTitle, metaDesc, updateSet, refetch]);

  const chapterOptions = useMemo(() => {
    const map = new Map<string, { id: string; number: number; name: string }>();
    for (const q of questions) {
      map.set(q.chapterId, {
        id: q.chapterId,
        number: q.chapterNumber,
        name: q.chapter,
      });
    }
    return [...map.values()];
  }, [questions]);

  const updateEditing = (patch: Partial<QuestionFormState>) =>
    setEditing((prev) => (prev ? { ...prev, ...patch } : prev));

  const updatePart = (idx: number, patch: Partial<QuestionFormState['parts'][number]>) =>
    setEditing((prev) =>
      prev
        ? {
            ...prev,
            parts: prev.parts.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
          }
        : prev
    );

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !set) {
    return (
      <Empty description="Question set not found">
        <Button onClick={() => navigate('/admin/creative-questions')}>Back to list</Button>
      </Empty>
    );
  }

  const inputBg = isDark ? '#111111' : '#ffffff';

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
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/creative-questions')}
          />
          <div>
            <Title level={4} style={{ marginBottom: 2 }}>
              {set.title || 'Creative Question Set'}
            </Title>
            <Space size={4} wrap>
              <Text type="secondary">
                {questions.length} questions · {chapterOptions.length} chapters
              </Text>
              {set.examVersion && typeof set.examVersion === 'object' && (
                <Tag>v{set.examVersion.examVersion}</Tag>
              )}
            </Space>
          </div>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} />
          <Button onClick={openMeta}>Edit details</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add question
          </Button>
        </Space>
      </div>

      <Card variant="borderless">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions.length === 0 && (
            <Empty description="This set has no questions" />
          )}
          {questions.map((q) => (
            <div
              key={q._id ?? q.id}
              style={{
                border: `1px solid ${isDark ? '#222222' : '#e0dcd5'}`,
                borderRadius: 10,
                padding: '10px 12px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                background: isDark ? '#0a0a0a' : '#faf8f5',
              }}
            >
              <Tag color="blue" style={{ marginTop: 2 }}>
                #{q.number}
              </Tag>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Space size={6} wrap style={{ marginBottom: 2 }}>
                  <Tag>{q.id}</Tag>
                  <Tag color="purple">Ch {q.chapterNumber}</Tag>
                  {q.source?.board && <Tag color="geekblue">{q.source.board}</Tag>}
                  {q.source?.year && <Tag color="cyan">{q.source.year}</Tag>}
                </Space>
                <div style={{ marginBottom: 4 }}>
                  {q.stimulus ? (
                    <Text style={{ fontSize: 13 }}>
                      {q.stimulus.length > 140 ? `${q.stimulus.slice(0, 140)}…` : q.stimulus}
                    </Text>
                  ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      (no stimulus)
                    </Text>
                  )}
                </div>
                <Space size={4} wrap>
                  {q.parts.map((p) => (
                    <Tag key={p.label} style={{ fontSize: 11 }}>
                      {p.label}. {p.text.length > 40 ? `${p.text.slice(0, 40)}…` : p.text}
                    </Tag>
                  ))}
                </Space>
              </div>
              <Space>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => openEdit(q)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setDeleteTarget(q)}
                />
              </Space>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Question editor drawer ── */}
      <Drawer
        title={editingIsNew ? 'Add question' : `Edit question #${editing?.number ?? ''}`}
        width={560}
        open={!!editing}
        onClose={() => setEditing(null)}
        destroyOnHidden
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
            >
              Save
            </Button>
          </Space>
        }
      >
        {editing && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Question id *</Text>
                <Input
                  value={editing.id}
                  onChange={(e) => updateEditing({ id: e.target.value })}
                  style={{ background: inputBg }}
                />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Question number *</Text>
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  value={editing.number}
                  onChange={(v) => updateEditing({ number: v ?? 1 })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Chapter</Text>
                <Select
                  style={{ width: '100%' }}
                  value={editing.chapterId || undefined}
                  onChange={(cid) => {
                    const ch = chapterOptions.find((c) => c.id === cid);
                    if (ch) {
                      updateEditing({
                        chapterId: ch.id,
                        chapterNumber: ch.number,
                        chapter: ch.name,
                      });
                    }
                  }}
                  options={chapterOptions.map((c) => ({
                    label: `Ch ${c.number}: ${c.name.slice(0, 24)}`,
                    value: c.id,
                  }))}
                />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Board</Text>
                <Input
                  value={editing.board}
                  onChange={(e) => updateEditing({ board: e.target.value })}
                  style={{ background: inputBg }}
                />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Year</Text>
                <Input
                  value={editing.year}
                  onChange={(e) => updateEditing({ year: e.target.value })}
                  style={{ background: inputBg }}
                />
              </div>
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>
                উদ্দীপক (Stimulus)
              </Text>
              <TextArea
                rows={5}
                value={editing.stimulus}
                onChange={(e) => updateEditing({ stimulus: e.target.value })}
                style={{ background: inputBg }}
              />
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <Text strong>Parts (ক/খ/গ/ঘ) *</Text>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    updateEditing({
                      parts: [...editing.parts, emptyPart('ঘ')],
                    })
                  }
                >
                  Add part
                </Button>
              </div>
              {editing.parts.map((p, i) => (
                <div
                  key={i}
                  style={{
                    border: `1px solid ${isDark ? '#222222' : '#e0dcd5'}`,
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px', gap: 8, marginBottom: 8 }}>
                    <Input
                      addonBefore="Label"
                      value={p.label}
                      onChange={(e) => updatePart(i, { label: e.target.value })}
                      style={{ background: inputBg }}
                    />
                    <Input
                      addonBefore="Type"
                      placeholder="জ্ঞানমূলক / অনুধাবন…"
                      value={p.cognitiveType}
                      onChange={(e) => updatePart(i, { cognitiveType: e.target.value })}
                      style={{ background: inputBg }}
                    />
                    <InputNumber
                      min={0}
                      max={100}
                      addonBefore="Marks"
                      style={{ width: '100%' }}
                      value={p.marks}
                      onChange={(v) => updatePart(i, { marks: v ?? 0 })}
                    />
                  </div>
                  <TextArea
                    rows={2}
                    placeholder="প্রশ্ন (question text) *"
                    value={p.text}
                    onChange={(e) => updatePart(i, { text: e.target.value })}
                    style={{ background: inputBg, marginBottom: 8 }}
                  />
                  <TextArea
                    rows={4}
                    placeholder="উত্তর (answer)"
                    value={p.answer}
                    onChange={(e) => updatePart(i, { answer: e.target.value })}
                    style={{ background: inputBg }}
                  />
                  {editing.parts.length > 1 && (
                    <Button
                      size="small"
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      style={{ marginTop: 6 }}
                      onClick={() =>
                        updateEditing({ parts: editing.parts.filter((_, j) => j !== i) })
                      }
                    >
                      Remove part
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>
                নোট (Answer notes)
              </Text>
              <TextArea
                rows={3}
                value={editing.answerNotes}
                onChange={(e) => updateEditing({ answerNotes: e.target.value })}
                style={{ background: inputBg }}
              />
            </div>
          </Space>
        )}
      </Drawer>

      {/* ── Delete confirm ── */}
      <Modal
        open={!!deleteTarget}
        title="Delete question?"
        onCancel={() => setDeleteTarget(null)}
        onOk={handleDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <Text>
          Question <Text code>{deleteTarget?.id}</Text> (#{deleteTarget?.number}) will be removed
          from this set. This cannot be undone.
        </Text>
      </Modal>

      {/* ── Meta editor ── */}
      <Modal
        title="Set details"
        open={metaOpen}
        onCancel={() => setMetaOpen(false)}
        onOk={handleSaveMeta}
        okText="Save"
        confirmLoading={savingMeta}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>Title</Text>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              style={{ background: inputBg }}
            />
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>Description</Text>
            <TextArea
              rows={3}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              style={{ background: inputBg }}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default CreativeQuestionManager;
