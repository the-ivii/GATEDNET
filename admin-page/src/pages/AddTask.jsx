import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Maintenance.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddTask = () => {
  const navigate = useNavigate();
  const [task, setTask] = useState({ title: '', description: '', status: 'open' });

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const existingTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const newTask = { id: Date.now(), ...task };
    localStorage.setItem('tasks', JSON.stringify([...existingTasks, newTask]));

    toast.success('✅ Task added successfully!', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });

    // Reset form after adding task
    setTask({ title: '', description: '', status: 'open' });
  };

  return (
    <div className="maintenance-container">
      <h2 className="maintenance-heading">Add New Maintenance Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Task Title</label>
          <input
            type="text"
            name="title"
            value={task.title}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Enter task title"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={task.description}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Enter task description"
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={task.status}
            onChange={handleChange}
            className="form-control"
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Add Task
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/maintenance-updates/view-tasks')}>
          Go to View Tasks
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AddTask;
