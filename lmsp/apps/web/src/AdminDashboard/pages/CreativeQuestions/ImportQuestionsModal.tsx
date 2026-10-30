import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Collapse,
  Divider,
  Modal,
  Radio,
  Space,
  Tabs,
  Tag,
  Typography,
  Upload,
  Input,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  FormatPainterOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  useImportCreativeQuestionsMutation,
  type CQImportMode,
  type CQQuestion,
} from '@my-monorepo/store';
import { useAdminTheme } from '../../ThemeContext';

const { Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

export interface ImportQuestionsModalProps {
  open: boolean;
  onClose: () => void;
  setId: string;
  setTitle?: string;
  onSuccess?: () => void;
}

const SAMPLE_TEMPLATE = [
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
    imageNeeded: false,
    stimulus: 'উদ্দীপক...',
    parts: [
      { label: 'ক', text: 'জ্ঞানমূলক প্রশ্ন...', marks: 1, cognitiveType: 'জ্ঞানমূলক', answer: 'উত্তর...' },
      { label: 'খ', text: 'অনুধাবনমূলক প্রশ্ন...', marks: 2, cognitiveType: 'অনুধাবন', answer: 'উত্তর...' },
      { label: 'গ', text: 'প্রয়োগমূলক প্রশ্ন...', marks: 3, cognitiveType: 'প্রয়োগ', answer: 'উত্তর...' },
      { label: 'ঘ', text: 'উচ্চতর দক্ষতামূলক প্রশ্ন...', marks: 4, cognitiveType: 'উচ্চতর দক্ষতা', answer: 'উত্তর...' },
    ],
    answerNotes: 'ঐচ্ছিক নোট',
  },
];

export const ImportQuestionsModal: React.FC<ImportQuestionsModalProps> = ({
  open,
  onClose,
  setId,
  setTitle,
  onSuccess,
}) => {
  const { isDark } = useAdminTheme();
  const [importQuestions, { isLoading: isImporting }] = useImportCreativeQuestionsMutation();

  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState<string>('');
  const [mode, setMode] = useState<CQImportMode>('upsert');
  const [errors, setErrors] = useState<string[]>([]);

  // Parsed questions preview
  const [parsedQuestions, setParsedQuestions] = useState<CQQuestion[] | null>(null);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setJsonText('');
    setErrors([]);
    setParsedQuestions(null);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleDownloadTemplate = useCallback(() => {
    const blob = new Blob([JSON.stringify(SAMPLE_TEMPLATE, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'creative-questions-upload-template.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Client-side validation helper
  const validateJsonArray = useCallback((arr: any[]): string[] => {
    const issues: string[] = [];
    if (!Array.isArray(arr)) {
      return ['JSON must be an array of question objects (e.g. [ { ... } ])'];
    }
    if (arr.length === 0) {
      return ['The file contains an empty question array.'];
    }
    const seenIds = new Set<string>();
    arr.forEach((q, idx) => {
      const at = `Question #${idx + 1}${q?.id ? ` ("${q.id}")` : ''}`;
      if (!q || typeof q !== 'object') {
        issues.push(`${at}: must be an object`);
        return;
      }
      if (!q.id || typeof q.id !== 'string') {
        issues.push(`${at}: "id" is required (string, e.g. "ch1-q1")`);
      } else if (seenIds.has(q.id)) {
        issues.push(`${at}: duplicate id "${q.id}" inside this file`);
      } else {
        seenIds.add(q.id);
      }
      if (!q.chapterId) issues.push(`${at}: "chapterId" is required (e.g. "ch1")`);
      if (typeof q.chapterNumber !== 'number') issues.push(`${at}: "chapterNumber" must be a number`);
      if (!q.chapter) issues.push(`${at}: "chapter" name is required`);
      if (typeof q.number !== 'number') issues.push(`${at}: "number" must be a number`);
      if (q.imageNeeded !== undefined && typeof q.imageNeeded !== 'boolean') {
        issues.push(`${at}: "imageNeeded" must be a boolean (true or false)`);
      }
      if (!Array.isArray(q.parts)) {
        issues.push(`${at}: "parts" must be an array of { label, text, answer }`);
      } else {
        q.parts.forEach((p: any, pi: number) => {
          const atPart = `${at}, part #${pi + 1}`;
          // Image arrays: each entry needs a url; caption is optional string.
          for (const key of ['questionImages', 'answerImages'] as const) {
            const arr = p?.[key];
            if (arr === undefined || arr === null) continue;
            if (!Array.isArray(arr)) {
              issues.push(`${atPart}: "${key}" must be an array of { url, caption? }`);
              continue;
            }
            arr.forEach((img: any, ii: number) => {
              if (!img || typeof img !== 'object' || typeof img.url !== 'string' || !img.url.trim()) {
                issues.push(`${atPart}: "${key}[${ii}]" must be an object with a "url" string`);
              } else if (img.caption !== undefined && img.caption !== null && typeof img.caption !== 'string') {
                issues.push(`${atPart}: "${key}[${ii}].caption" must be a string`);
              }
            });
          }
        });
      }
      // Stimulus images: each entry needs a url; caption is optional string.
      const sImages = q.stimulusImages;
      if (sImages !== undefined && sImages !== null) {
        if (!Array.isArray(sImages)) {
          issues.push(`${at}: "stimulusImages" must be an array of { url, caption? }`);
        } else {
          sImages.forEach((img: any, ii: number) => {
            if (!img || typeof img !== 'object' || typeof img.url !== 'string' || !img.url.trim()) {
              issues.push(`${at}: "stimulusImages[${ii}]" must be an object with a "url" string`);
            } else if (img.caption !== undefined && img.caption !== null && typeof img.caption !== 'string') {
              issues.push(`${at}: "stimulusImages[${ii}].caption" must be a string`);
            }
          });
        }
      }
    });
    return issues;
  }, []);

  // Handle file selection and read immediately
  const handleFileChange = useCallback((file: File) => {
    setSelectedFile(file);
    setErrors([]);
    setParsedQuestions(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        const validationIssues = validateJsonArray(arr);
        if (validationIssues.length > 0) {
          setErrors(validationIssues.slice(0, 10));
        } else {
          setErrors([]);
        }
        setParsedQuestions(arr);
      } catch (parseErr: any) {
        setErrors([`JSON Parse Error: ${parseErr.message}`]);
        setParsedQuestions(null);
      }
    };
    reader.onerror = () => {
      setErrors(['Unable to read file content']);
      setParsedQuestions(null);
    };
    reader.readAsText(file);
  }, [validateJsonArray]);

  // Handle direct text changes
  const handlePasteChange = useCallback((value: string) => {
    setJsonText(value);
    setErrors([]);
    if (!value.trim()) {
      setParsedQuestions(null);
      return;
    }
    try {
      const parsed = JSON.parse(value.trim());
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      setParsedQuestions(arr);
      const validationIssues = validateJsonArray(arr);
      if (validationIssues.length > 0) {
        setErrors(validationIssues.slice(0, 10));
      } else {
        setErrors([]);
      }
    } catch {
      setParsedQuestions(null);
    }
  }, [validateJsonArray]);

  const handleFormatJson = useCallback(() => {
    if (!jsonText.trim()) return;
    try {
      const parsed = JSON.parse(jsonText.trim());
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      setParsedQuestions(arr);
      const validationIssues = validateJsonArray(arr);
      if (validationIssues.length > 0) {
        setErrors(validationIssues.slice(0, 10));
      } else {
        setErrors([]);
      }
      message.success(`JSON formatted (${arr.length} question${arr.length > 1 ? 's' : ''})`);
    } catch (e: any) {
      message.error(`JSON Parse Error: ${e.message}`);
    }
  }, [jsonText, validateJsonArray]);

  // Detected chapters summary
  const detectedChapters = useMemo(() => {
    if (!parsedQuestions) return [];
    const map = new Map<string, { id: string; number: number; name: string; count: number }>();
    parsedQuestions.forEach((q) => {
      if (!q.chapterId) return;
      const existing = map.get(q.chapterId);
      if (existing) {
        existing.count++;
      } else {
        map.set(q.chapterId, {
          id: q.chapterId,
          number: q.chapterNumber || 0,
          name: q.chapter || q.chapterId,
          count: 1,
        });
      }
    });
    return [...map.values()];
  }, [parsedQuestions]);

  const handleUploadAndImport = useCallback(async () => {
    if (!setId) {
      message.error('Target question set is missing');
      return;
    }

    setErrors([]);

    let fileToUpload: File | undefined = undefined;
    let dataToUpload: any[] | undefined = undefined;

    if (activeTab === 'file') {
      if (!selectedFile) {
        message.warning('Please select a JSON file to upload');
        return;
      }
      fileToUpload = selectedFile;
    } else {
      if (!jsonText.trim()) {
        message.warning('Please enter or paste JSON questions to upload');
        return;
      }
      try {
        const parsed = JSON.parse(jsonText.trim());
        dataToUpload = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseErr: any) {
        setErrors([`Invalid JSON: ${parseErr.message}`]);
        message.error('The pasted content is not valid JSON');
        return;
      }
    }

    try {
      const res = await importQuestions({
        setId,
        mode,
        file: fileToUpload,
        data: dataToUpload,
      }).unwrap();

      message.success(
        res.message ||
          `Successfully uploaded! (${res.addedCount} added, ${res.updatedCount} updated, ${res.skippedCount} skipped)`
      );

      handleClose();
      onSuccess?.();
    } catch (err: any) {
      const resData = err?.data;
      if (resData?.errors && Array.isArray(resData.errors)) {
        setErrors(resData.errors);
        message.error(`${resData.message || 'Validation failed'} (${resData.errors.length} issues)`);
      } else if (resData?.conflictingIds && Array.isArray(resData.conflictingIds)) {
        setErrors([
          `Duplicate IDs found in set: ${resData.conflictingIds.join(', ')}. Use "Upsert" or "Skip duplicates" mode to proceed.`,
        ]);
        message.error('Conflicting question IDs in strict mode');
      } else {
        message.error(resData?.message || err?.error || 'Upload failed');
      }
    }
  }, [setId, activeTab, selectedFile, jsonText, mode, importQuestions, handleClose, onSuccess]);

  const inputBg = isDark ? '#111111' : '#ffffff';
  const cardBorder = isDark ? '#222222' : '#e0dcd5';

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <Space>
          <CloudUploadOutlined style={{ color: '#1677ff', fontSize: 20 }} />
          <span>Upload JSON Questions to {setTitle ? `"${setTitle}"` : 'Question Set'}</span>
        </Space>
      }
      width={720}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={isImporting}>
          Cancel
        </Button>,
        <Button
          key="import"
          type="primary"
          icon={<CloudUploadOutlined />}
          loading={isImporting}
          disabled={!selectedFile && !jsonText.trim()}
          onClick={handleUploadAndImport}
        >
          Upload & Import Questions
        </Button>,
      ]}
    >
      <div style={{ marginTop: 8 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => {
            setActiveTab(k as 'file' | 'paste');
            setErrors([]);
          }}
          items={[
            {
              key: 'file',
              label: (
                <span>
                  <CloudUploadOutlined /> Upload JSON File
                </span>
              ),
              children: (
                <div>
                  <Dragger
                    accept=".json,application/json"
                    maxCount={1}
                    beforeUpload={(file) => {
                      handleFileChange(file);
                      return false;
                    }}
                    onRemove={() => {
                      setSelectedFile(null);
                      setParsedQuestions(null);
                      setErrors([]);
                    }}
                    fileList={selectedFile ? [selectedFile as any] : []}
                    style={{ background: inputBg, padding: '24px 16px' }}
                  >
                    <p className="ant-upload-drag-icon">
                      <CloudUploadOutlined style={{ fontSize: 40, color: '#1677ff' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: 15, fontWeight: 500 }}>
                      Click or drag JSON file here to upload
                    </p>
                    <p className="ant-upload-hint" style={{ fontSize: 13 }}>
                      Accepts test-paper JSON containing an array of creative questions.
                    </p>
                  </Dragger>

                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Supported format: Standard Creative Questions JSON schema
                    </Text>
                    <Button
                      size="small"
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadTemplate}
                    >
                      Download Template JSON
                    </Button>
                  </div>
                </div>
              ),
            },
            {
              key: 'paste',
              label: (
                <span>
                  <FileTextOutlined /> Paste JSON Content
                </span>
              ),
              children: (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Paste a JSON array of questions directly:
                    </Text>
                    <Space size={8}>
                      <Button
                        size="small"
                        icon={<FormatPainterOutlined />}
                        onClick={handleFormatJson}
                        disabled={!jsonText.trim()}
                      >
                        Format / Prettify
                      </Button>
                    </Space>
                  </div>
                  <TextArea
                    rows={8}
                    value={jsonText}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder={'[\n  {\n    "id": "ch1-q1",\n    "chapterId": "ch1",\n    "chapterNumber": 1,\n    "chapter": "অধ্যায়ের নাম",\n    "number": 1,\n    "stimulus": "উদ্দীপক...",\n    "parts": [\n      { "label": "ক", "text": "...", "marks": 1, "cognitiveType": "জ্ঞানমূলক", "answer": "..." }\n    ]\n  }\n]'}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      background: inputBg,
                    }}
                  />
                </div>
              ),
            },
          ]}
        />

        {/* Live Detected Info & Preview */}
        {parsedQuestions && parsedQuestions.length > 0 && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              borderRadius: 8,
              border: `1px solid ${errors.length === 0 ? '#b7eb8f' : '#ffa39e'}`,
              background: isDark
                ? errors.length === 0
                  ? '#0d1d0d'
                  : '#2a1215'
                : errors.length === 0
                ? '#f6ffed'
                : '#fff2f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <Space size={6} wrap>
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  {parsedQuestions.length} Questions detected
                </Tag>
                {parsedQuestions.filter((q) => q.imageNeeded === true).length > 0 && (
                  <Tag color="warning">
                    {parsedQuestions.filter((q) => q.imageNeeded === true).length} Need Images
                  </Tag>
                )}
                {detectedChapters.length > 0 && (
                  <Tag color="purple">
                    {detectedChapters.length} Chapter{detectedChapters.length > 1 ? 's' : ''}
                  </Tag>
                )}
                {selectedFile && (
                  <Tag color="blue">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Tag>
                )}
              </Space>

              <Text type="secondary" style={{ fontSize: 12 }}>
                {detectedChapters.map((c) => `Ch ${c.number}: ${c.count}q`).join(' · ')}
              </Text>
            </div>

            {/* Quick collapsible preview */}
            <Collapse
              ghost
              size="small"
              style={{ marginTop: 8 }}
              items={[
                {
                  key: 'preview',
                  label: (
                    <Text style={{ fontSize: 12 }}>
                      <EyeOutlined /> View Question IDs Preview ({parsedQuestions.length})
                    </Text>
                  ),
                  children: (
                    <div
                      style={{
                        maxHeight: 120,
                        overflowY: 'auto',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        padding: 4,
                      }}
                    >
                      {parsedQuestions.map((q, i) => (
                        <Tag key={i} style={{ fontSize: 11 }}>
                          #{q.number || i + 1} ({q.id || 'no-id'}) - Ch {q.chapterNumber || '?'}
                        </Tag>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}

        {/* Conflict Handling Strategy */}
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${cardBorder}`,
            background: isDark ? '#141414' : '#fafafa',
          }}
        >
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Upload & Conflict Strategy:
          </Text>
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <Radio value="upsert">
              <Space direction="vertical" size={0}>
                <Text strong>Upsert / Merge (Recommended)</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Updates matching questions if ID exists; appends new questions to the set.
                </Text>
              </Space>
            </Radio>
            <Radio value="skip">
              <Space direction="vertical" size={0}>
                <Text strong>Skip existing duplicates</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Appends only questions with new IDs; leaves existing questions untouched.
                </Text>
              </Space>
            </Radio>
            <Radio value="error">
              <Space direction="vertical" size={0}>
                <Text strong>Strict (Fail on duplicate)</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Rejects upload if any question ID already exists in this set.
                </Text>
              </Space>
            </Radio>
            <Radio value="replace">
              <Space direction="vertical" size={0}>
                <Text type="danger" strong>Replace all questions</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Warning: Clears all current questions in this set and replaces them with the uploaded ones.
                </Text>
              </Space>
            </Radio>
          </Radio.Group>
        </div>

        {/* Error Alert */}
        {errors.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <Alert
              type="error"
              showIcon
              message={`Validation / Upload Issue (${errors.length} found)`}
              description={
                <ul
                  style={{
                    margin: '4px 0 0 16px',
                    padding: 0,
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  {errors.map((err, idx) => (
                    <li key={idx} style={{ fontSize: 12, marginBottom: 2 }}>
                      {err}
                    </li>
                  ))}
                </ul>
              }
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportQuestionsModal;
