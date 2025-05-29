import React from 'react';
import { Card, Typography } from 'antd';
import TaskList from '../components/TaskList';

const { Title } = Typography;

const Tasks = () => {
    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Title level={2}>Task Management</Title>
                <TaskList />
            </Card>
        </div>
    );
};

export default Tasks; 