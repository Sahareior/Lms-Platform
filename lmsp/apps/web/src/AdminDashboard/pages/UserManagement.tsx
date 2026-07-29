import React, { useState } from 'react';
import { Table, Card, Avatar, Tag, Modal, Descriptions, Spin, Alert, Input, Button, Space, Popconfirm, message } from 'antd';
import { SearchOutlined, ReloadOutlined, UserOutlined, MailOutlined, PhoneOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetAdminUsersQuery, useGetAdminUserByIdQuery, useDeleteAdminUserMutation, type AdminUser } from '@my-monorepo/store';

const UserManagement: React.FC = () => {
  const { data: users, isLoading, error, refetch } = useGetAdminUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId).unwrap();
      message.success('User deleted successfully!');
      refetch();
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to delete user');
    }
  };

  // Filter users based on search
  const filteredUsers = users?.filter((user) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.division?.toLowerCase().includes(search) ||
      user.district?.toLowerCase().includes(search) ||
      user.education?.toLowerCase().includes(search)
    );
  });

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (name: string, record: AdminUser) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: '#1890ff', verticalAlign: 'middle' }} size="large">
            {(name || record.email || '?')[0].toUpperCase()}
          </Avatar>
          <div>
            <span className="font-medium" style={{ color: '#142347' }}>{name || 'N/A'}</span>
            <p className="text-xs text-gray-400 m-0">{record.email}</p>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: unknown, record: AdminUser) => (
        <div className="space-y-1">
          {record.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <PhoneOutlined /> {record.phone}
            </div>
          )}
          {record.email && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MailOutlined /> {record.email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_: unknown, record: AdminUser) => (
        <span className="text-sm text-gray-600">
          {[record.division, record.district, record.thana].filter(Boolean).join(', ') || '—'}
        </span>
      ),
    },
    {
      title: 'Education',
      dataIndex: 'education',
      key: 'education',
      render: (val: string) => val || '—',
    },
    {
      title: 'Institute',
      dataIndex: 'institute',
      key: 'institute',
      render: (val: string) => val || '—',
    },
    {
      title: 'Exams',
      dataIndex: 'selectedExams',
      key: 'selectedExams',
      render: (exams: string[] | undefined) => (
        <Tag color="blue">{exams?.length ?? 0} selected</Tag>
      ),
    },      {
        title: 'Actions',
        key: 'actions',
        render: (_: unknown, record: AdminUser) => (
          <Space>
            <Button
              type="link"
              onClick={() => {
                setSelectedUserId(record._id);
                setDetailModalOpen(true);
              }}
            >
              View Details
            </Button>
            <Popconfirm
              title="Delete this user?"
              description="This action cannot be undone."
              onConfirm={() => handleDeleteUser(record._id)}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading users..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Users"
        description="There was an error loading the user list."
        type="error"
        showIcon
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold m-0" style={{ color: '#142347' }}>User Management</h2>
        <Space>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="_id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* User Detail Modal */}
      <Modal
        title="User Details"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedUserId && <UserDetail userId={selectedUserId} />}
      </Modal>
    </div>
  );
};

// ─── User Detail Sub-component ──────────────────────────────
const UserDetail: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: user, isLoading, error } = useGetAdminUserByIdQuery(userId);

  if (isLoading) return <Spin />;
  if (error || !user) return <Alert message="Failed to load user details" type="error" />;

  return (
    <Descriptions column={2} bordered size="small" className="mt-4">
      <Descriptions.Item label="Username">{user.username || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
      <Descriptions.Item label="Phone">{user.phone || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Date of Birth">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Division">{user.division || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="District">{user.district || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Thana">{user.thana || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Village">{user.village || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Post Code">{user.postCode || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Education">{user.education || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Institute">{user.institute || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Target Date">{user.targetDate ? new Date(user.targetDate).toLocaleDateString() : 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Preferred Center">{user.preferredCenter || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Hear About">{user.hearAbout || 'N/A'}</Descriptions.Item>
    </Descriptions>
  );
};

export default UserManagement;
