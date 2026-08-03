import React, { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, message, Space, Spin, Alert, Tag, Tooltip, Popconfirm, Empty, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, BookOutlined, DeleteOutlined, UserOutlined, PhoneOutlined, BookOutlined as BookIcon, EnvironmentOutlined } from '@ant-design/icons';
import MediaUpload from '../../reusable/MediaUpload';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useGetAdminCoursesQuery, useGetAdminExamsQuery, useGetAdminUsersQuery, useGetAdminSubjectsByExamQuery, useCreateAdminCourseMutation, useUpdateAdminCourseMutation, useDeleteAdminCourseMutation, type AdminCourse, type CreateCourseRequest, type EnrolledStudent } from '@my-monorepo/store';

const { TextArea } = Input;

// ─── Subjects Form Item ────────────────────────────────────
const SubjectsFormItem: React.FC<{ form: any }> = ({ form }) => {
  const examId = Form.useWatch('exam', form);
  const { data: subjects, isLoading: subjectsLoading } = useGetAdminSubjectsByExamQuery(examId, {
    skip: !examId,
  });

  return (
    <Form.Item
      name="subjects"
      label="Subjects"
      tooltip="Select subjects covered in this course (based on the selected exam)"
    >
      <Select
        mode="multiple"
        showSearch
        placeholder={!examId ? 'Select an exam first' : subjectsLoading ? 'Loading subjects...' : 'Select subjects'}
        disabled={!examId || subjectsLoading}
        loading={subjectsLoading}
        allowClear
        optionFilterProp="label"
        options={subjects?.map((s: any) => ({
          label: s.name + (s.code ? ` (${s.code})` : ''),
          value: s._id,
        }))}
      />
    </Form.Item>
  );
};

const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading, error, refetch } = useGetAdminCoursesQuery();
  const { data: exams } = useGetAdminExamsQuery();
  const { data: instructors } = useGetAdminUsersQuery();
  const [createCourse, { isLoading: isCreating }] = useCreateAdminCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateAdminCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteAdminCourseMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const createThumbnail = Form.useWatch('thumbnail', form);
  const editThumbnail = Form.useWatch('thumbnail', editForm);

  const handleCreateCourse = async (values: CreateCourseRequest) => {
    try {
      // Ensure the uploaded thumbnail (set via setFieldValue) is sent
      const payload = { ...values, thumbnail: form.getFieldValue('thumbnail') || undefined };
      await createCourse(payload).unwrap();
      message.success(`Course "${values.title}" created successfully!`);
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to create course');
    }
  };

  const handleEditCourse = async (values: any) => {
    if (!editingCourse) return;
    try {
      const payload = { ...values, thumbnail: editForm.getFieldValue('thumbnail') || undefined };
      await updateCourse({ courseId: editingCourse._id, data: payload }).unwrap();
      message.success('Course updated successfully!');
      setEditModalOpen(false);
      setEditingCourse(null);
      editForm.resetFields();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId).unwrap();
      message.success('Course deleted successfully!');
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete course');
    }
  };

  const openEditModal = (course: AdminCourse) => {
    setEditingCourse(course);
    editForm.setFieldsValue({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || '',
      instructor: course.instructor?._id,
      exam: course.exam?._id,
      subjects: course.subjects?.map((s) => s._id) || [],
    });
    setEditModalOpen(true);
  };

  const columns: ColumnsType<AdminCourse> = [
    {
      title: '',
      key: 'thumbnail',
      width: 72,
      render: (_: unknown, record: AdminCourse) =>
        record.thumbnail ? (
          <img
            src={record.thumbnail}
            alt={record.title}
            className="w-12 h-12 rounded-lg object-cover border border-gray-100"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold"
          >
            {(record.title || 'C')[0].toUpperCase()}
          </div>
        ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <span className="font-medium" style={{ color: '#142347' }}>{title}</span>,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc ? (
        <span className="text-sm text-gray-600">{desc.length > 50 ? desc.slice(0, 50) + '...' : desc}</span>
      ) : (
        <span className="text-gray-400">—</span>
      ),
    },
    {
      title: 'Instructor',
      dataIndex: ['instructor', 'username'],
      key: 'instructor',
      render: (name: string, record: AdminCourse) => (
        <span className="text-sm">{name || record.instructor?.email || 'N/A'}</span>
      ),
    },
    {
      title: 'Lessons',
      key: 'lessons',
      render: (_: unknown, record: AdminCourse) => (
        <Tag color="purple">{record.lessons?.length ?? 0}</Tag>
      ),
    },
    {
      title: 'Students',
      key: 'students',
      render: (_: unknown, record: AdminCourse) => (
        <Tag color="green">{record.enrolledStudents?.length ?? 0}</Tag>
      ),
    },
    {
      title: 'Exam',
      key: 'exam',
      render: (_: unknown, record: AdminCourse) => (
        <span className="text-sm">{record.exam?.name || '—'}</span>
      ),
    },
    {
      title: 'Subjects',
      key: 'subjects',
      render: (_: unknown, record: AdminCourse) => (
        record.subjects && record.subjects.length > 0 ? (
          <Space wrap size={[2, 2]}>
            {record.subjects.map((s) => (
              <Tag key={s._id} color="blue" style={{ fontSize: 11 }}>{s.name}</Tag>
            ))}
          </Space>
        ) : (
          <span className="text-gray-400">—</span>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: AdminCourse) => (
        <Space>
          <Tooltip title="Manage lessons for this course">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<BookOutlined />}
              onClick={() => {
                const id = record._id || (record as any).id;
                if (!id) {
                  message.error('Course id missing');
                  return;
                }
                navigate(`/admin/courses/${id}/lessons`);
              }}
            >
              Lessons
            </Button>
          </Tooltip>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this course?"
            description="This will permanently remove the course and its lessons."
            onConfirm={() => handleDeleteCourse(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} loading={isDeleting}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderEnrolledStudents = (students: EnrolledStudent[] | undefined) => {
    if (!students || students.length === 0) {
      return (
        <div className="py-8 text-center">
          <Empty description="No enrolled students" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="mb-4">
          <Typography.Text strong style={{ fontSize: 15, color: '#142347' }}>
            <UserOutlined className="mr-2" />
            Enrolled Students ({students.length})
          </Typography.Text>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {students.map((student) => (
            <div
              key={student._id}
              className="rounded-lg border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow duration-200"
              style={{ borderLeft: '4px solid #667eea' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {(student.username || student.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <Typography.Text strong className="block truncate" style={{ color: '#142347' }}>
                    {student.username || 'Unnamed'}
                  </Typography.Text>
                  <Typography.Text type="secondary" className="text-xs block truncate">
                    {student.email}
                  </Typography.Text>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                {student.phone && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <PhoneOutlined className="text-xs" />
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.education && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <BookIcon className="text-xs" />
                    <span>{student.education}{student.institute ? ` - ${student.institute}` : ''}</span>
                  </div>
                )}
                {student.division && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <EnvironmentOutlined className="text-xs" />
                    <span>{student.division}{student.district ? `, ${student.district}` : ''}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading courses..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Courses"
        description="There was an error loading the course list."
        type="error"
        showIcon
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold m-0" style={{ color: '#142347' }}>Course Management</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Create Course
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="_id"
          expandable={{
            expandedRowRender: (record: AdminCourse) => renderEnrolledStudents(record.enrolledStudents),
            rowExpandable: (record: AdminCourse) => (record.enrolledStudents?.length ?? 0) > 0,
            expandRowByClick: true,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} courses`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create Course Modal */}
      <Modal
        title="Create New Course"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCourse}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Course Title"
            rules={[{ required: true, message: 'Please enter the course title' }]}
          >
            <Input placeholder="e.g. BCS Preliminary Course" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={3} placeholder="Course description..." />
          </Form.Item>

          <Form.Item label="Course Thumbnail" tooltip="Upload an image — stored on Cloudinary">
            <MediaUpload
              type="image"
              value={createThumbnail}
              onChange={(url) => form.setFieldValue('thumbnail', url)}
              label="Upload Thumbnail"
            />
          </Form.Item>

          <Form.Item
            name="instructor"
            label="Instructor"
            rules={[{ required: true, message: 'Please select an instructor' }]}
          >
            <Select
              showSearch
              placeholder="Select instructor"
              optionFilterProp="label"
              options={instructors?.map((u) => ({
                label: u.username || u.email,
                value: u._id,
              }))}
            />
          </Form.Item>

          <Form.Item name="exam" label="Related Exam">
            <Select
              showSearch
              placeholder="Select exam (optional)"
              allowClear
              optionFilterProp="label"
              options={exams?.map((e) => ({
                label: e.name,
                value: e._id,
              }))}
            />
          </Form.Item>

          <SubjectsFormItem form={form} />

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => { setModalOpen(false); form.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Create Course
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        title="Edit Course"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingCourse(null); editForm.resetFields(); }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditCourse}
          className="mt-4"
        >
          <Form.Item name="title" label="Course Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Course Thumbnail" tooltip="Upload an image — stored on Cloudinary">
            <MediaUpload
              type="image"
              value={editThumbnail}
              onChange={(url) => editForm.setFieldValue('thumbnail', url)}
              label="Upload Thumbnail"
            />
          </Form.Item>

          <Form.Item name="instructor" label="Instructor" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Select instructor"
              optionFilterProp="label"
              options={instructors?.map((u) => ({
                label: u.username || u.email,
                value: u._id,
              }))}
            />
          </Form.Item>

          <Form.Item name="exam" label="Related Exam">
            <Select
              showSearch
              placeholder="Select exam (optional)"
              allowClear
              optionFilterProp="label"
              options={exams?.map((e) => ({
                label: e.name,
                value: e._id,
              }))}
            />
          </Form.Item>

          <SubjectsFormItem form={editForm} />

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => { setEditModalOpen(false); setEditingCourse(null); editForm.resetFields(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Course
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement;
