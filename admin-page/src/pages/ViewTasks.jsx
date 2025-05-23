import React, { useState, useEffect } from 'react';
import '../styles/Maintenance.css';

const ViewTasks = () => {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem('tasks');
    return stored ? JSON.parse(stored) : [];
  });

  if (tasks.length === 0) return <p className="maintenance-container">No tasks available.</p>;

  return (
    <div className="maintenance-container">
      <h2 className="maintenance-heading">All Tasks</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li key={task.id} className="task-list-item">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p className="task-status">Status: {task.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewTasks;
