import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Empty,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Segmented,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PictureOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCQSetQuestions,
  useUpdateCreativeQuestionSetMutation,
  useUpdateCreativeQuestionMutation,
  useDeleteCreativeQuestionMutation,
  type CQQuestion,
  type CQPart,
  type CQImage,
} from '@my-monorepo/store';
import MediaUpload from '../../../reusable/MediaUpload';
import { useAdminTheme } from '../../ThemeContext';
import ImportQuestionsModal from './ImportQuestionsModal';

const { Text, Title } = Typography;
const { TextArea } = Input;

/** Questions listed per page in the manager. */
const PAGE_SIZE = 100;

/** Form state for one question (all fields editable as plain text). */
interface QuestionFormState {
  id: string;
  chapterId: string;
  chapterNumber: number;
  chapter: string;
  number: number;
  imageNeeded: boolean;
  stimulus: string;
  stimulusImages: CQImage[];
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
    questionImages: CQImage[];
    answerImages: CQImage[];
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
  imageNeeded: q.imageNeeded ?? false,
  stimulus: q.stimulus ?? '',
  stimulusImages: q.stimulusImages ?? [],
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
    questionImages: p.questionImages ?? [],
    answerImages: p.answerImages ?? [],
  })),
});

const toPayload = (form: QuestionFormState): Partial<CQQuestion> => ({
  id: form.id.trim(),
  chapterId: form.chapterId.trim(),
  chapterNumber: form.chapterNumber,
  chapter: form.chapter.trim(),
  number: form.number,
  imageNeeded: form.imageNeeded ?? false,
  stimulus: form.stimulus,
  stimulusImages: form.stimulusImages,
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

/** A small image editor row: URL preview, caption input, remove button. */
const CQImageRow: React.FC<{
  image: CQImage;
  onCaptionChange: (caption: string) => void;
  onRemove: () => void;
  isDark: boolean;
}> = ({ image, onCaptionChange, onRemove, isDark }) => (
  <div
    style={{
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
      padding: 8,
      borderRadius: 8,
      border: `1px solid ${isDark ? '#222222' : '#e0dcd5'}`,
      background: isDark ? '#0d0d0d' : '#faf8f5',
      marginBottom: 6,
    }}
  >
    <img
      src={image.url}
      alt={image.caption || 'Question image'}
      style={{
        width: 72,
        height: 54,
        objectFit: 'cover',
        borderRadius: 6,
        border: `1px solid ${isDark ? '#333' : '#ccc'}`,
        flexShrink: 0,
      }}
    />
    <div style={{ flex: 1, minWidth: 0 }}>
      <Input
        size="small"
        placeholder="Caption (optional, e.g. চিত্র-১)"
        value={image.caption ?? ''}
        onChange={(e) => onCaptionChange(e.target.value)}
        style={{ background: isDark ? '#111111' : '#ffffff', marginBottom: 4 }}
      />
      <Text type="secondary" style={{ fontSize: 11, wordBreak: 'break-all' }}>
        {image.url}
      </Text>
    </div>
    <Button size="small" danger type="text" icon={<DeleteOutlined />} onClick={onRemove} />
  </div>
);

const CreativeQuestionManager: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { isDark } = useAdminTheme();

  // Paged fetch: first 100 questions render immediately, remaining pages
  // load in the background and merge in server order.
  const {
    data: set,
    questions: setQuestions,
    isLoading,
    isError,
    refetch,
    isFetching,
    hasAllPages,
  } = useCQSetQuestions(setId, { skip: !setId });
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

  // ── Import questions modal state ──
  const [importOpen, setImportOpen] = useState(false);

  // ── Filter states ──
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'empty_ans' | 'empty_text' | 'image_needed' | 'complete'
  >('all');
  const [filterChapter, setFilterChapter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ── Pagination state (100 questions per page) ──
  const [page, setPage] = useState(1);

  const questions = setQuestions;

  // Helpers to test content completeness
  const hasEmptyAnswer = useCallback((q: CQQuestion) => {
    if (!q.parts || q.parts.length === 0) return true;
    return q.parts.some((p) => !p.answer || p.answer.trim() === '');
  }, []);

  const hasEmptyQuestionText = useCallback((q: CQQuestion) => {
    if (!q.parts || q.parts.length === 0) return true;
    return q.parts.some((p) => !p.text || p.text.trim() === '');
  }, []);

  const getMissingAnswerParts = useCallback((q: CQQuestion) => {
    if (!q.parts || q.parts.length === 0) return ['No parts'];
    return q.parts
      .filter((p) => !p.answer || p.answer.trim() === '')
      .map((p) => p.label || '?');
  }, []);

  const imageNeededCount = useMemo(
    () => questions.filter((q) => q.imageNeeded === true).length,
    [questions]
  );

  const emptyAnswerCount = useMemo(
    () => questions.filter((q) => hasEmptyAnswer(q)).length,
    [questions, hasEmptyAnswer]
  );

  const emptyTextCount = useMemo(
    () => questions.filter((q) => hasEmptyQuestionText(q)).length,
    [questions, hasEmptyQuestionText]
  );

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (filterStatus === 'empty_ans' && !hasEmptyAnswer(q)) return false;
      if (filterStatus === 'empty_text' && !hasEmptyQuestionText(q)) return false;
      if (filterStatus === 'image_needed' && !q.imageNeeded) return false;
      if (
        filterStatus === 'complete' &&
        (hasEmptyAnswer(q) || hasEmptyQuestionText(q) || q.imageNeeded)
      ) {
        return false;
      }
      if (filterChapter !== 'all' && q.chapterId !== filterChapter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = q.id.toLowerCase().includes(query);
        const matchesStimulus = (q.stimulus ?? '').toLowerCase().includes(query);
        const matchesParts = (q.parts ?? []).some(
          (p) =>
            p.text.toLowerCase().includes(query) ||
            (p.answer ?? '').toLowerCase().includes(query)
        );
        const matchesBoard = (q.source?.board ?? '').toLowerCase().includes(query);
        return matchesId || matchesStimulus || matchesParts || matchesBoard;
      }
      return true;
    });
  }, [
    questions,
    filterStatus,
    filterChapter,
    searchQuery,
    hasEmptyAnswer,
    hasEmptyQuestionText,
  ]);

  const openEdit = useCallback((q: CQQuestion) => {
    setEditingIsNew(false);
    setEditing(toFormState(q));
  }, []);

  /* Reset to page 1 whenever filters change. */
  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterChapter, searchQuery]);

  const openCreate = useCallback(() => {
    if (questions.length === 0) {
      message.warning('Upload a JSON file first — new questions inherit the chapter of existing ones.');
      return;
    }
    // Adding sends the full questions array back to the server — only safe
    // once every page has loaded, otherwise unloaded pages would be lost.
    if (!hasAllPages) {
      message.warning('Still loading all questions — please try again in a moment.');
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
      imageNeeded: false,
      stimulus: '',
      stimulusImages: [],
      board: first.source?.board ?? '',
      year: first.source?.year ?? '',
      questionNo: '',
      answerNotes: '',
      parts: [emptyPart('ক'), emptyPart('খ'), emptyPart('গ'), emptyPart('ঘ')].map((p) => ({
        ...p,
        questionImages: [],
        answerImages: [],
      })),
    });
  }, [questions, hasAllPages]);

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
        // Jump to the last page so the newly appended question is visible.
        const nextCount = set?.totalQuestions ? set.totalQuestions + 1 : questions.length + 1;
        setPage(Math.max(1, Math.ceil(nextCount / PAGE_SIZE)));
      } else if (!hasAllPages && !questions.some((q) => q.id === editing.id)) {
        // Editing a question not in the loaded pages would drop it on save.
        message.warning('That question is still loading — please try again in a moment.');
        setSaving(false);
        return;
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
  }, [set, editing, editingIsNew, questions, hasAllPages, updateSet, updateQuestion, refetch]);

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

  const handleToggleImageNeeded = useCallback(
    async (q: CQQuestion) => {
      if (!set) return;
      const nextVal = !q.imageNeeded;
      try {
        await updateQuestion({
          setId: set._id,
          questionId: q.id,
          data: { imageNeeded: nextVal },
        }).unwrap();
        message.success(
          nextVal
            ? `Question #${q.number} marked as needing image`
            : `Question #${q.number} marked as no image needed`
        );
        refetch();
      } catch (err: any) {
        message.error(err?.data?.message || 'Failed to update image needed state');
      }
    },
    [set, updateQuestion, refetch]
  );

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

  /* ── Pagination slice: 100 questions per page ── */
  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedQuestions = useMemo(
    () =>
      filteredQuestions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredQuestions, safePage]
  );

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
                {set?.totalQuestions ?? questions.length} questions · {chapterOptions.length}{' '}
                chapters
                {pageCount > 1 && ` · page ${safePage}/${pageCount}`}
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
          <Button type="primary" ghost icon={<CloudUploadOutlined />} onClick={() => setImportOpen(true)}>
            Upload JSON
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add question
          </Button>
        </Space>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <Card variant="borderless" style={{ marginBottom: 12 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Space wrap size={10}>
            <Segmented
              value={filterStatus}
              onChange={(val) => setFilterStatus(val as any)}
              options={[
                {
                  label: `All (${questions.length})`,
                  value: 'all',
                },
                {
                  label: (
                    <Space size={4}>
                      <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                      <span>Empty Ans</span>
                      {emptyAnswerCount > 0 && (
                        <Tag
                          color="error"
                          style={{
                            margin: 0,
                            padding: '0 6px',
                            fontSize: 11,
                            borderRadius: 10,
                          }}
                        >
                          {emptyAnswerCount}
                        </Tag>
                      )}
                    </Space>
                  ),
                  value: 'empty_ans',
                },
                {
                  label: (
                    <Space size={4}>
                      <PictureOutlined style={{ color: '#fa8c16' }} />
                      <span>Image Needed</span>
                      {imageNeededCount > 0 && (
                        <Tag
                          color="warning"
                          style={{
                            margin: 0,
                            padding: '0 6px',
                            fontSize: 11,
                            borderRadius: 10,
                          }}
                        >
                          {imageNeededCount}
                        </Tag>
                      )}
                    </Space>
                  ),
                  value: 'image_needed',
                },
                ...(emptyTextCount > 0
                  ? [
                      {
                        label: (
                          <Space size={4}>
                            <WarningOutlined style={{ color: '#ff7a45' }} />
                            <span>Empty Text</span>
                            <Tag
                              color="volcano"
                              style={{
                                margin: 0,
                                padding: '0 6px',
                                fontSize: 11,
                                borderRadius: 10,
                              }}
                            >
                              {emptyTextCount}
                            </Tag>
                          </Space>
                        ),
                        value: 'empty_text',
                      },
                    ]
                  : []),
                {
                  label: `Complete (${questions.length - emptyAnswerCount - (filterStatus === 'all' && emptyTextCount > 0 ? 0 : 0)})`,
                  value: 'complete',
                },
              ]}
            />

            <Select
              style={{ width: 170 }}
              value={filterChapter}
              onChange={(val) => setFilterChapter(val)}
              options={[
                { label: 'All Chapters', value: 'all' },
                ...chapterOptions.map((c) => ({
                  label: `Ch ${c.number}: ${c.name.slice(0, 16)}…`,
                  value: c.id,
                })),
              ]}
            />
          </Space>

          <Input
            placeholder="Search questions by ID, text, board..."
            prefix={<SearchOutlined style={{ color: '#888' }} />}
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 260, maxWidth: '100%', background: inputBg }}
          />
        </div>
      </Card>

      <Card variant="borderless">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredQuestions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Empty
                description={
                  questions.length === 0
                    ? 'This set has no questions yet'
                    : filterStatus === 'empty_ans'
                    ? 'No questions with empty answers! All questions have answers.'
                    : filterStatus === 'empty_text'
                    ? 'No questions with empty question text.'
                    : filterStatus === 'image_needed'
                    ? 'No questions currently marked as "Image Needed"'
                    : 'No questions match the current filters'
                }
              >
                {questions.length === 0 ? (
                  <Space style={{ marginTop: 12 }}>
                    <Button
                      type="primary"
                      icon={<CloudUploadOutlined />}
                      onClick={() => setImportOpen(true)}
                    >
                      Upload JSON Questions
                    </Button>
                    <Button icon={<PlusOutlined />} onClick={openCreate}>
                      Add Manually
                    </Button>
                  </Space>
                ) : (
                  <Button
                    style={{ marginTop: 10 }}
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterChapter('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Empty>
            </div>
          )}
          {pagedQuestions.map((q) => {
            const missingParts = getMissingAnswerParts(q);
            const questionHasEmptyAns = hasEmptyAnswer(q);
            const questionHasEmptyText = hasEmptyQuestionText(q);

            return (
              <div
                key={q._id ?? q.id}
                style={{
                  border: `1px solid ${
                    questionHasEmptyAns
                      ? '#ff4d4f'
                      : q.imageNeeded
                      ? '#fa8c16'
                      : isDark
                      ? '#222222'
                      : '#e0dcd5'
                  }`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  background: questionHasEmptyAns
                    ? isDark
                      ? '#220b0b'
                      : '#fff1f0'
                    : q.imageNeeded
                    ? isDark
                      ? '#1f1505'
                      : '#fffdf5'
                    : isDark
                    ? '#0a0a0a'
                    : '#faf8f5',
                }}
              >
                <Tag color="blue" style={{ marginTop: 2 }}>
                  #{q.number}
                </Tag>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Space size={6} wrap style={{ marginBottom: 4 }}>
                    <Tag>{q.id}</Tag>
                    <Tag color="purple">Ch {q.chapterNumber}</Tag>
                    {q.source?.board && <Tag color="geekblue">{q.source.board}</Tag>}
                    {q.source?.year && <Tag color="cyan">{q.source.year}</Tag>}
                    {questionHasEmptyAns && (
                      <Tag color="error" icon={<ExclamationCircleOutlined />} style={{ fontWeight: 600 }}>
                        Empty Ans ({missingParts.join(', ')})
                      </Tag>
                    )}
                    {questionHasEmptyText && (
                      <Tag color="volcano" icon={<WarningOutlined />} style={{ fontWeight: 600 }}>
                        Empty Text
                      </Tag>
                    )}
                    {q.imageNeeded ? (
                      <Tag color="warning" icon={<PictureOutlined />} style={{ fontWeight: 600 }}>
                        Image Needed
                      </Tag>
                    ) : null}
                  </Space>
                  <div style={{ marginBottom: 6 }}>
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
                    {q.parts.map((p) => {
                      const noAns = !p.answer || p.answer.trim() === '';
                      const noText = !p.text || p.text.trim() === '';
                      return (
                        <Tag
                          key={p.label}
                          color={noAns ? 'error' : noText ? 'volcano' : undefined}
                          style={{ fontSize: 11 }}
                        >
                          {p.label}. {noText ? '(Empty question)' : p.text.length > 35 ? `${p.text.slice(0, 35)}…` : p.text}
                          {noAns && ' [No Ans]'}
                        </Tag>
                      );
                    })}
                  </Space>
                </div>
                <Space>
                  <Tooltip
                    title={
                      q.imageNeeded
                        ? 'Click to mark as done (no image needed)'
                        : 'Click to mark that this question needs an image'
                    }
                  >
                    <Button
                      size="small"
                      type={q.imageNeeded ? 'primary' : 'default'}
                      style={
                        q.imageNeeded
                          ? { background: '#fa8c16', borderColor: '#fa8c16' }
                          : {}
                      }
                      icon={<PictureOutlined />}
                      onClick={() => handleToggleImageNeeded(q)}
                    >
                      {q.imageNeeded ? 'Needs Image' : 'Image?'}
                    </Button>
                  </Tooltip>
                  <Button
                    size="small"
                    type={questionHasEmptyAns ? 'primary' : 'default'}
                    danger={questionHasEmptyAns}
                    icon={<EditOutlined />}
                    onClick={() => openEdit(q)}
                  >
                    {questionHasEmptyAns ? 'Fill Ans' : 'Edit'}
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setDeleteTarget(q)}
                  />
                </Space>
              </div>
            );
          })}

          {/* ── Pagination: 100 questions per page ── */}
          {pageCount > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
              <Pagination
                current={safePage}
                total={filteredQuestions.length}
                pageSize={PAGE_SIZE}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
                showQuickJumper
              />
            </div>
          )}
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
              {/* Stimulus images (উদ্দীপক চিত্র) */}
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 8,
                  border: `1px dashed ${isDark ? '#333' : '#c9c4ba'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text strong style={{ fontSize: 12 }}>
                    <PictureOutlined /> উদ্দীপক চিত্র (stimulus images)
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {editing.stimulusImages.length} image(s)
                  </Text>
                </div>
                {editing.stimulusImages.map((img, imgIdx) => (
                  <CQImageRow
                    key={imgIdx}
                    image={img}
                    isDark={isDark}
                    onCaptionChange={(caption) =>
                      updateEditing({
                        stimulusImages: editing.stimulusImages.map((im, j) =>
                          j === imgIdx ? { ...im, caption } : im
                        ),
                      })
                    }
                    onRemove={() =>
                      updateEditing({
                        stimulusImages: editing.stimulusImages.filter((_, j) => j !== imgIdx),
                      })
                    }
                  />
                ))}
                <MediaUpload
                  type="image"
                  label="Add stimulus image"
                  value={undefined}
                  onChange={(url) =>
                    updateEditing({
                      stimulusImages: [...editing.stimulusImages, { url, caption: '' }],
                    })
                  }
                />
              </div>
            </div>

            {/* Image needed toggle switch */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: 8,
                border: `1px solid ${editing.imageNeeded ? '#fa8c16' : isDark ? '#222222' : '#e0dcd5'}`,
                background: editing.imageNeeded
                  ? isDark
                    ? '#261805'
                    : '#fffbe6'
                  : inputBg,
              }}
            >
              <Space>
                <PictureOutlined style={{ fontSize: 18, color: editing.imageNeeded ? '#fa8c16' : undefined }} />
                <div>
                  <Text strong>Image Needed (চিত্র প্রয়োজন)</Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                    Mark this question if a diagram, table, or visual asset is required.
                  </Text>
                </div>
              </Space>
              <Switch
                checked={editing.imageNeeded}
                onChange={(checked) => updateEditing({ imageNeeded: checked })}
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
                  {/* Question images (প্রশ্নের চিত্র) — always visible to students */}
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 8,
                      border: `1px dashed ${isDark ? '#333' : '#c9c4ba'}`,
                    }}
                  >
                    <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                      <PictureOutlined /> প্রশ্নের চিত্র (question images)
                    </Text>
                    {p.questionImages.map((img, imgIdx) => (
                      <CQImageRow
                        key={imgIdx}
                        image={img}
                        isDark={isDark}
                        onCaptionChange={(caption) =>
                          updatePart(i, {
                            questionImages: p.questionImages.map((im, j) =>
                              j === imgIdx ? { ...im, caption } : im
                            ),
                          })
                        }
                        onRemove={() =>
                          updatePart(i, {
                            questionImages: p.questionImages.filter((_, j) => j !== imgIdx),
                          })
                        }
                      />
                    ))}
                    <MediaUpload
                      type="image"
                      label="Add question image"
                      value={undefined}
                      onChange={(url) =>
                        updatePart(i, {
                          questionImages: [...p.questionImages, { url, caption: '' }],
                        })
                      }
                    />
                  </div>
                  {/* Answer images (উত্তরের চিত্র) — shown when answer is revealed */}
                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderRadius: 8,
                      border: `1px dashed ${isDark ? '#333' : '#c9c4ba'}`,
                    }}
                  >
                    <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                      <PictureOutlined /> উত্তরের চিত্র (answer images)
                    </Text>
                    {p.answerImages.map((img, imgIdx) => (
                      <CQImageRow
                        key={imgIdx}
                        image={img}
                        isDark={isDark}
                        onCaptionChange={(caption) =>
                          updatePart(i, {
                            answerImages: p.answerImages.map((im, j) =>
                              j === imgIdx ? { ...im, caption } : im
                            ),
                          })
                        }
                        onRemove={() =>
                          updatePart(i, {
                            answerImages: p.answerImages.filter((_, j) => j !== imgIdx),
                          })
                        }
                      />
                    ))}
                    <MediaUpload
                      type="image"
                      label="Add answer image"
                      value={undefined}
                      onChange={(url) =>
                        updatePart(i, {
                          answerImages: [...p.answerImages, { url, caption: '' }],
                        })
                      }
                    />
                  </div>
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

      {/* ── Import questions modal ── */}
      <ImportQuestionsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        setId={set._id}
        setTitle={set.title}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default CreativeQuestionManager;
