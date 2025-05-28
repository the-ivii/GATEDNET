// import React from 'react';
// import '../styles/ComponentCard.css';

// const Reminders = () => {
//   return (
//     <div className="card">
//       <h3>REMINDERS</h3>
//       <p>🔔 Add a new reminder</p>
//     </div>
//   );
// };

// export default Reminders;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ComponentCard.css';

const Reminders = () => {
  const navigate = useNavigate();

  const handleAddReminder = () => {
    navigate('/add-reminder');
  };

  return (
    <div className="card">
      <h3>REMINDERS</h3>
      <p onClick={handleAddReminder} style={{ cursor: 'pointer'}}>
        🔔 Add a new reminder
      </p>
    </div>
  );
};

export default Reminders;