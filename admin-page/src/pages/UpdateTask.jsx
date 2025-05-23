import React, { useState, useEffect } from 'react';
import '../styles/Maintenance.css';

const UpdateTask = () => {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem('tasks');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleStatusChange = (id, newStatus) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  if (tasks.length === 0) return <p className="maintenance-container">No tasks found to update.</p>;

  return (
    <div className="maintenance-container">
      <h2 className="maintenance-heading">Update Tasks</h2>
      <table className="maintenance-table">
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Status</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.status}</td>
              <td>
                <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UpdateTask;
