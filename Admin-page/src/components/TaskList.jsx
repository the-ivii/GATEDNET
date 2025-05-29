import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    Button,
    Modal,
    Form,
    Select,
    DatePicker,
    message,
    Space,
    Tag
} from 'antd';
import moment from 'moment';

const { Option } = Select;

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingTask, setEditingTask] = useState(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/tasks');
            setTasks(response.data);
        } catch (error) {
            message.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreateTask = async (values) => {
        try {
            if (editingTask) {
                await axios.put(`/api/tasks/${editingTask._id}`, values);
                message.success('Task updated successfully');
            } else {
                await axios.post('/api/tasks', values);
                message.success('Task created successfully');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingTask(null);
            fetchTasks();
        } catch (error) {
            message.error('Failed to save task');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        form.setFieldsValue({
            ...task,
            dueDate: task.dueDate ? moment(task.dueDate) : null
        });
        setModalVisible(true);
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`/api/tasks/${taskId}`);
            message.success('Task deleted successfully');
            fetchTasks();
        } catch (error) {
            message.error('Failed to delete task');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === 'completed' ? 'green' :
                    status === 'in-progress' ? 'blue' : 'orange'
                }>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => (
                <Tag color={
                    priority === 'high' ? 'red' :
                    priority === 'medium' ? 'orange' : 'green'
                }>
                    {priority.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => date ? moment(date).format('YYYY-MM-DD') : 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Button type="danger" onClick={() => handleDelete(record._id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Button
                type="primary"
                onClick={() => {
                    setEditingTask(null);
                    form.resetFields();
                    setModalVisible(true);
                }}
                style={{ marginBottom: '16px' }}
            >
                Create New Task
            </Button>

            <Table
                columns={columns}
                dataSource={tasks}
                loading={loading}
                rowKey="_id"
            />

            <Modal
                title={editingTask ? 'Edit Task' : 'Create Task'}
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingTask(null);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleCreateTask}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter task title' }]}
                    >
                        <input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter task description' }]}
                    >
                        <textarea />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select task status' }]}
                    >
                        <Select>
                            <Option value="pending">Pending</Option>
                            <Option value="in-progress">In Progress</Option>
                            <Option value="completed">Completed</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Priority"
                        rules={[{ required: true, message: 'Please select task priority' }]}
                    >
                        <Select>
                            <Option value="low">Low</Option>
                            <Option value="medium">Medium</Option>
                            <Option value="high">High</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dueDate"
                        label="Due Date"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingTask ? 'Update Task' : 'Create Task'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TaskList; 