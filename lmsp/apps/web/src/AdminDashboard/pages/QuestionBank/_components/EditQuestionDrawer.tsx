import React, { useEffect } from 'react';
import { Drawer, Form, Input, Select, Button, Space, Tag, Divider } from 'antd';
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import MediaUpload from '../../../../reusable/MediaUpload';
import type { QuestionItem } from './questionBankUtils';
import { getOptionEntries } from './questionBankUtils';

const { TextArea } = Input;

/** Payload the drawer hands back — already in the shape the API expects. */
export interface QuestionEditPayload {
  question_text: string;
  scenario_text?: string;
  image_url?: string;
  options: Record<string, string>;
  correct_answer?: string;
  explanation?: string;
}

interface Props {
  open: boolean;
  question: QuestionItem | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: QuestionEditPayload) => void;
}

/**
 * Side drawer for editing one question.
 *
 * A drawer (not a modal) keeps the question list visible behind it, so admins
 * can move through a paper without losing their place.
 */
const EditQuestionDrawer: React.FC<Props> = ({ open, question, saving, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const imageUrl = Form.useWatch('image_url', form);

  // Reload the form whenever a different question is opened.
  useEffect(() => {
    if (!open || !question) return;
    form.setFieldsValue({
      question_text: question.question_text,
      scenario_text: question.scenario_text || '',
      image_url: question.image_url || '',
      ...Object.fromEntries(
        getOptionEntries(question.options).map(([key, val]) => [`option_${key}`, val])
      ),
      correct_answer: question.correct_answer || '',
      explanation: question.explanation || '',
    });
  }, [open, question, form]);

  if (!question) return null;

  const optionEntries = getOptionEntries(question.options);

  const handleFinish = (values: Record<string, string>) => {
    // Rebuild options from the *original* keys so a renamed or missing field
    // can never silently drop an option from the stored document.
    const options: Record<string, string> = {};
    for (const [key] of optionEntries) {
      const value = values[`option_${key}`];
      if (value) options[key] = value;
    }

    onSubmit({
      question_text: values.question_text,
      scenario_text: values.scenario_text || '',
      image_url: values.image_url || '',
      options,
      correct_answer: values.correct_answer || undefined,
      explanation: values.explanation || '',
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      destroyOnHidden
      title={
        <Space>
          <EditOutlined style={{ color: '#22C55E' }} />
          <span>Edit Question #{question.question_number}</span>
        </Space>
      }
      extra={
        <Space size={6}>
          {question.image_url && <Tag color="purple">Image</Tag>}
          {question.scenario_text && <Tag color="geekblue">Scenario</Tag>}
          {question.explanation ? (
            <Tag color="cyan">Has explanation</Tag>
          ) : (
            <Tag color="orange">No explanation</Tag>
          )}
        </Space>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} className="!rounded-lg">Cancel</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
            className="!rounded-lg"
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-1">
        <Form.Item
          name="question_text"
          label="Question Text"
          rules={[{ required: true, message: 'Question text is required' }]}
        >
          <TextArea rows={3} autoSize={{ minRows: 2, maxRows: 6 }} placeholder="Enter the question text…" />
        </Form.Item>

        <Form.Item
          name="scenario_text"
          label={
            <span>
              Scenario / Passage <span className="font-normal text-[#5F6B64]">(optional)</span>
            </span>
          }
        >
          <TextArea
            rows={3}
            autoSize={{ minRows: 2, maxRows: 8 }}
            placeholder="Passage, case study or scenario shown above the question…"
          />
        </Form.Item>

        <Form.Item
          name="image_url"
          label={
            <span>
              Question Image <span className="font-normal text-[#5F6B64]">(optional)</span>
            </span>
          }
        >
          <div className="flex flex-col gap-3">
            <MediaUpload
              type="image"
              value={imageUrl}
              onChange={(url) => form.setFieldsValue({ image_url: url })}
              label="Upload Image"
            />
            {imageUrl && (
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="self-start !rounded-lg"
                onClick={() => form.setFieldsValue({ image_url: '' })}
              >
                Remove image
              </Button>
            )}
          </div>
        </Form.Item>

        <Divider dashed className="!my-4 !border-emerald-500/15">Answer Options</Divider>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {optionEntries.map(([key]) => (
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
          <Select placeholder="Select the correct option">
            {optionEntries.map(([key, val]) => (
              <Select.Option key={key} value={key}>
                {key} — {val.slice(0, 40)}
                {val.length > 40 ? '…' : ''}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="explanation"
          label={
            <span>
              Explanation / ব্যাখ্যা{' '}
              <span className="font-normal text-[#5F6B64]">(shown to students in reviews)</span>
            </span>
          }
        >
          <TextArea
            rows={4}
            autoSize={{ minRows: 3, maxRows: 10 }}
            placeholder="Why is this answer correct? Write it in Bengali or English…"
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditQuestionDrawer;
