import React from 'react';
import Card from '../UI/Card';
import ProgressCircle from '../UI/ProgressCircle';

const PollItem = ({ id, title, progress, onClick, className = "" }) => {
  return (
    <div className="mb-6 flex items-center">
      <div className="mr-4">
        <ProgressCircle progress={progress} />
      </div>
      <div 
        className={`text-xl cursor-pointer hover:text-blue-300 transition-colors ${className}`}
        onClick={() => onClick(id)}
      >
        {title}
      </div>
    </div>
  );
};

export default PollItem;