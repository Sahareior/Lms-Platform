import React from 'react';
import {
  Modal, Input, Button, Empty, Space, Popconfirm,
} from 'antd';
import {
  PlusOutlined, FolderOpenOutlined, FolderAddOutlined, EditOutlined,
  DeleteOutlined, SaveOutlined, CloseOutlined,
} from '@ant-design/icons';
import type { AdminLesson, AdminModule } from '@my-monorepo/store';
import { getLessonModuleId } from './lessonUtils';

interface ManageModulesModalProps {
  open: boolean;
  modules: AdminModule[];
  lessons: AdminLesson[];
  newModuleTitle: string;
  editingModuleId: string | null;
  editingModuleTitle: string;
  deletingModuleId: string | null;
  isCreatingModule: boolean;
  isUpdatingModule: boolean;
  onNewModuleTitleChange: (value: string) => void;
  onCreateModule: () => void;
  onStartEditModule: (module: AdminModule) => void;
  onEditingModuleTitleChange: (value: string) => void;
  onSaveModule: () => void;
  onCancelEditModule: () => void;
  onDeleteModule: (moduleId: string) => void;
  onCancel: () => void;
}

/**
 * Create / rename / delete modules for the course.
 * Deleting a module keeps its lessons — they move to Uncategorized.
 */
const ManageModulesModal: React.FC<ManageModulesModalProps> = ({
  open,
  modules,
  lessons,
  newModuleTitle,
  editingModuleId,
  editingModuleTitle,
  deletingModuleId,
  isCreatingModule,
  isUpdatingModule,
  onNewModuleTitleChange,
  onCreateModule,
  onStartEditModule,
  onEditingModuleTitleChange,
  onSaveModule,
  onCancelEditModule,
  onDeleteModule,
  onCancel,
}) => {
  return (
    <Modal
      title={
        <Space className="text-amber-400">
          <FolderOpenOutlined />
          <span className="font-semibold">Manage Modules</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={560}
      destroyOnClose
      className="emerald-modal"
    >
      <div className="mt-4 space-y-4">
        {/* Create module */}
        <div className="flex gap-2">
          <Input
            placeholder="New module name, e.g. Module 1 – Fundamentals"
            value={newModuleTitle}
            onChange={(e) => onNewModuleTitleChange(e.target.value)}
            onPressEnter={onCreateModule}
            prefix={<FolderAddOutlined className="text-amber-400" />}
            className="!rounded-lg hover:!border-amber-500/60 focus:!border-amber-500"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={isCreatingModule}
            onClick={onCreateModule}
            className="!rounded-lg !bg-amber-600 hover:!bg-amber-500 !border-amber-600"
          >
            Add
          </Button>
        </div>

        {/* Module list */}
        {modules.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-[#7A8A80] text-sm">
                No modules yet. Create one, then assign lessons to it from the lesson form.
              </span>
            }
            className="!py-6"
          />
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {modules.map((module, idx) => {
              const lessonCount = lessons.filter((l) => getLessonModuleId(l) === module._id).length;
              const isEditing = editingModuleId === module._id;
              return (
                <div
                  key={module._id}
                  className="flex items-center gap-3 bg-amber-500/5 p-3 rounded-xl border border-amber-500/15 hover:border-amber-500/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <FolderOpenOutlined className="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <Input
                        value={editingModuleTitle}
                        onChange={(e) => onEditingModuleTitleChange(e.target.value)}
                        onPressEnter={onSaveModule}
                        autoFocus
                        size="small"
                        className="!rounded-lg"
                      />
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-[#E8F5EC] truncate">{module.title}</div>
                        <div className="text-xs text-[#7A8A80]">
                          #{idx + 1} · {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
                        </div>
                      </>
                    )}
                  </div>
                  <Space size={2}>
                    {isEditing ? (
                      <>
                        <Button
                          type="text"
                          size="small"
                          icon={<SaveOutlined />}
                          loading={isUpdatingModule}
                          onClick={onSaveModule}
                          className="!text-emerald-400 hover:!bg-emerald-500/10"
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={onCancelEditModule}
                          className="!text-[#7A8A80] hover:!bg-white/5"
                        />
                      </>
                    ) : (
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onStartEditModule(module)}
                        className="!text-amber-400 hover:!bg-amber-500/10"
                      />
                    )}
                    <Popconfirm
                      title="Delete this module?"
                      description="Lessons inside it move to Uncategorized."
                      onConfirm={() => onDeleteModule(module._id)}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        loading={deletingModuleId === module._id}
                        icon={<DeleteOutlined />}
                        className="hover:!bg-red-500/10"
                      />
                    </Popconfirm>
                  </Space>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ManageModulesModal;
