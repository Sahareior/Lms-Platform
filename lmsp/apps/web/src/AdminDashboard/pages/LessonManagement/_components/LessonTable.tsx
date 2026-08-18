import React from 'react';
import {
  Table, Button, Space, Tag, Tooltip, Popconfirm, Typography, Empty,
} from 'antd';
import {
  EditOutlined, DeleteOutlined, VideoCameraOutlined, EyeOutlined, LinkOutlined,
  CheckCircleOutlined, CloseCircleOutlined, BookOutlined, ClockCircleOutlined,
  FolderAddOutlined, HolderOutlined, PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ChevronDownIcon, Plus } from 'lucide-react';
import type { AdminLesson } from '@my-monorepo/store';
import { isModuleRow } from './lessonUtils';

const { Text } = Typography;

export interface DragInfo {
  key: string;
  groupId: string | null;
  rowType: 'module' | 'lesson';
}

interface LessonTableProps {
  data: any[];
  dragInfo: DragInfo | null;
  dragOverKey: string | null;
  rowDragProps: (record: any) => Record<string, any>;
  onRenameModule: (record: any) => void;
  onDeleteModule: (moduleId: string) => void;
  onEditLesson: (lesson: AdminLesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onManageModules: () => void;
  onCreateLesson: () => void;
}

/**
 * Grouped module/lesson table with drag-to-reorder support.
 * Columns and row styling live here so the page stays focused on state + logic.
 */
const LessonTable: React.FC<LessonTableProps> = ({
  data,
  dragInfo,
  dragOverKey,
  rowDragProps,
  onRenameModule,
  onDeleteModule,
  onEditLesson,
  onDeleteLesson,
  onManageModules,
  onCreateLesson,
}) => {
  const columns: ColumnsType<any> = [
    {
      title: '#',
      key: 'index',
      width: 64,
      render: (_: any, record: any) =>
        isModuleRow(record) ? (
          <Plus className="text-amber-400/80 text-base hidden" />
        ) : (
          <span className="flex items-center gap-1 text-emerald-400/70 font-mono text-xs font-medium">
            <HolderOutlined className="text-[#4A564E] text-[10px]" />
            {record.order ?? 0}
          </span>
        ),
    },
    {
      title: 'Lesson',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: any) =>
        isModuleRow(record) ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25">
              <BookOutlined />
            </div>
            <div>
              <Text strong className="block leading-tight text-[#E8F5EC]">{record.title}</Text>
              <span className="text-xs text-[#7A8A80]">
                {record.children?.length ?? 0} lesson{(record.children?.length ?? 0) === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${record.isPublished
              ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25'
              : 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25'
              }`}>
              <VideoCameraOutlined className="text-base" />
            </div>
            <div>
              <Text strong className="block leading-tight text-[#E8F5EC]">{title}</Text>
              <span className="text-xs text-[#7A8A80]">
                {record.duration ? `${record.duration} min` : 'No duration'}
                {record.isPreview && (
                  <span className="text-emerald-400 font-medium"> · Free preview</span>
                )}
              </span>
            </div>
          </div>
        ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 110,
      render: (mins: number, record: any) => {
        if (isModuleRow(record)) {
          const total = (record.children || []).reduce((acc: number, l: any) => acc + (l.duration || 0), 0);
          return total > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25">
              <ClockCircleOutlined className="text-[10px]" />
              {total} min
            </span>
          ) : (
            <span className="text-[#4A564E]">—</span>
          );
        }
        return mins ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25">
            <ClockCircleOutlined className="text-[10px]" />
            {mins} min
          </span>
        ) : (
          <span className="text-[#4A564E]">—</span>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      render: (_: any, record: any) => {
        if (isModuleRow(record)) {
          const published = (record.children || []).filter((l: any) => l.isPublished).length;
          const total = (record.children || []).length;
          return total > 0 ? (
            <Tag className="!rounded-full !px-2.5 !py-0.5 !border-0 !font-medium !bg-sky-500/15 !text-sky-300">
              {published}/{total} published
            </Tag>
          ) : (
            <span className="text-[#4A564E]">—</span>
          );
        }
        return (
          <Tag
            icon={record.isPublished ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            className={`!rounded-full !px-2.5 !py-0.5 !border-0 !font-medium ${record.isPublished
              ? '!bg-emerald-500/15 !text-emerald-300'
              : '!bg-amber-500/15 !text-amber-300'
              }`}
          >
            {record.isPublished ? 'Published' : 'Draft'}
          </Tag>
        );
      },
    },
    {
      title: 'Preview',
      dataIndex: 'isPreview',
      key: 'isPreview',
      width: 90,
      render: (val: boolean, record: any) => isModuleRow(record) ? (
        <span className="text-[#4A564E]">—</span>
      ) : val ? (
        <Tag icon={<EyeOutlined />} className="!rounded-full !bg-teal-500/15 !text-teal-300 !border-0 !font-medium">
          Free
        </Tag>
      ) : (
        <span className="text-[#4A564E]">—</span>
      ),
    },
    {
      title: 'Resources',
      key: 'resources',
      width: 100,
      render: (_: any, record: any) => {
        if (isModuleRow(record)) {
          const count = (record.children || []).reduce(
            (acc: number, l: any) => acc + (l.resources?.length || 0) + (l.material?.length || 0), 0
          );
          return count > 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25">
              <LinkOutlined className="text-[10px]" />
              {count}
            </span>
          ) : (
            <span className="text-[#4A564E]">—</span>
          );
        }
        const count = (record.resources?.length || 0) + (record.material?.length || 0);
        return count > 0 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25">
            <LinkOutlined className="text-[10px]" />
            {count}
          </span>
        ) : (
          <span className="text-[#4A564E]">—</span>
        );
      },
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 70,
      render: (order: number, record: any) => isModuleRow(record) ? (
        <span className="font-mono text-xs bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-lg ring-1 ring-amber-500/25">
          {order ?? 0}
        </span>
      ) : (
        <span className="font-mono text-xs bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-lg ring-1 ring-emerald-500/25">
          {order ?? 0}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => isModuleRow(record) ? (
        <Space size={4}>
          <Tooltip title="Rename module">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onRenameModule(record)}
              className="!text-amber-400 hover:!bg-amber-500/10 hover:!text-amber-300"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this module?"
            description="Lessons inside it move to Uncategorized. Lessons are not deleted."
            onConfirm={() => onDeleteModule(record.moduleId)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete module">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="hover:!bg-red-500/10"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ) : (
        <Space size={4}>
          <Tooltip title="Edit lesson">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEditLesson(record)}
              className="!text-emerald-400 hover:!bg-emerald-500/10 hover:!text-emerald-300"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this lesson?"
            description="This action cannot be undone."
            onConfirm={() => onDeleteLesson(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete lesson">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="hover:!bg-red-500/10"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (data.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span className="text-[#7A8A80]">No lessons match your criteria</span>}
        className="!py-16"
      >
        <Space wrap size={8}>
          <Button
            icon={<FolderAddOutlined />}
            onClick={onManageModules}
            className="!rounded-lg !border-amber-500/40 !text-amber-400 hover:!border-amber-500/70 hover:!text-amber-300"
          >
            Create Module
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateLesson}
            className="!rounded-lg !bg-emerald-600 hover:!bg-emerald-500 !border-emerald-600"
          >
            Create First Lesson
          </Button>
        </Space>
      </Empty>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="key"
      pagination={{
        pageSize: 50,
        hideOnSinglePage: true,
      }}
      scroll={{ x: 800 }}
      onRow={rowDragProps}
      rowClassName={(record: any) => {
        const isDragging = dragInfo?.key === record.key;
        const isDragTarget = dragOverKey === record.key;
        const base = record?.rowType === 'module'
          ? 'hover:!bg-amber-500/5 !bg-[#101510]'
          : 'hover:!bg-emerald-500/5';
        return `transition-colors ${base} ${isDragging ? '!opacity-40' : ''} ${
          isDragTarget
            ? record?.rowType === 'module' ? '!bg-amber-500/20' : '!bg-emerald-500/15'
            : ''
        }`;
      }}
      expandable={{
        defaultExpandAllRows: false,
        indentSize: 18,
        expandIcon: ({ expanded, onExpand, record }: any) => (
          <Button
            type="text"
            size="small"
            icon={<ChevronDownIcon rotate={expanded ? -90 : 0} className="text-amber-400 !text-lg transition-transform" />}
            onClick={(e) => onExpand(record, e)}
            disabled={!record.children?.length}
            className="!p-0 !h-7 !w-7"
          />
        ),
      }}
      className="emerald-table"
    />
  );
};

export default LessonTable;
