import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { truncate } from './questionBankUtils';

const { TextArea } = Input;

interface Props {
  open: boolean;
  questionNumber?: number;
  questionText?: string;
  initialExplanation?: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (explanation: string) => void;
}

/**
 * Focused editor for a question's explanation — the single field admins touch
 * most often, so it gets its own lightweight dialog instead of a full edit.
 */
const ExplanationModal: React.FC<Props> = ({
  open,
  questionNumber,
  questionText,
  initialExplanation,
  saving,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ explanation: initialExplanation || '' });
  }, [open, initialExplanation, form]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      destroyOnHidden
      title={
        <Space>
          <BookOutlined style={{ color: '#00E5B3' }} />
          <span>Question #{questionNumber} Explanation (ব্যাখ্যা)</span>
        </Space>
      }
    >
      <div className="mt-2 mb-4 p-3.5 rounded-xl bg-[#161920] border border-[#23262D]">
        <p className="text-[11px] text-[#A1A8B3] uppercase font-bold tracking-wider mb-1">Question</p>
        <p className="text-sm text-[#F5F7FA] font-medium leading-relaxed">
          {truncate(questionText, 240)}
        </p>
      </div>

      <Form form={form} layout="vertical" onFinish={(values) => onSubmit(values.explanation || '')}>
        <Form.Item
          name="explanation"
          label={<span className="font-semibold text-sm text-[#E8F5EC]">Detailed Explanation / ব্যাখ্যা</span>}
          rules={[{ required: true, message: 'Please provide an explanation' }]}
        >
          <TextArea
            rows={6}
            autoSize={{ minRows: 4, maxRows: 12 }}
            placeholder="Write the detailed explanation for this question. It is shown to students in exam reviews and question views."
          />
        </Form.Item>

        <div className="flex justify-end gap-3 pt-1">
          <Button onClick={onClose} className="!rounded-lg">Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            className="!rounded-lg"
            style={{ backgroundColor: '#00E5B3', color: '#0B0D12', borderColor: '#00E5B3', fontWeight: 600 }}
          >
            Save Explanation
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ExplanationModal;
