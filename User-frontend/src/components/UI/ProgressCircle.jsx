import React from 'react';

const ProgressCircle = ({
  progress,
  size = 64,
  strokeWidth = 10,
  color = '#3b82f6', // blue-600
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (progress * circumference) / 100;

  return (
    <svg width={size} height={size} className="transform -rotate-90 drop-shadow-md">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#1e293b" // navy-900
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - dash}
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 6px #3b82f6)' }}
      />
    </svg>
  );
};

export default ProgressCircle;