import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Maintenance.css';

const MaintenanceUpdates = () => {
  const navigate = useNavigate();

  return (
    <div className="card maintenance-dashboard">
      <h3 className="maintenance-title">MAINTENANCE UPDATES</h3>
      <div className="maintenance-actions">
        <button className="maintenance-btn add-btn" onClick={() => navigate('/maintenance-updates/add-task')}>
          + Add Task
        </button>
        <button className="maintenance-btn update-btn" onClick={() => navigate('/maintenance-updates/update-task')}>
          ✎ Update Task
        </button>
        <button className="maintenance-btn view-btn" onClick={() => navigate('/maintenance-updates/view-tasks')}>
          👁 View Tasks
        </button>
      </div>
    </div>
  );
};

export default MaintenanceUpdates;
