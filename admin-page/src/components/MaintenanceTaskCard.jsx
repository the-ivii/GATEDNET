import React from 'react';

const MaintenanceTaskCard = ({ task, onStatusChange }) => {
  const toggleStatus = () => {
    const newStatus = task.status === 'open' ? 'resolved' : 'open';
    onStatusChange(task.id, newStatus);
  };

  return (
    <div className="task-card">
      <p className="task-title">
        {task.title}
        <span className={`status ${task.status}`}>{task.status.toUpperCase()}</span>
      </p>
      {onStatusChange && (
        <button onClick={toggleStatus}>
          {task.status === 'open' ? 'Resolve' : 'Reopen'}
        </button>
      )}
    </div>
  );
};

export default MaintenanceTaskCard;
