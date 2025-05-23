// import React from 'react';
// import '../styles/ComponentCard.css';
// import societyMembersImage from '../assets/societyMembersImage.png'; 

// const SocietyMembers = () => {
//   return (
//     <div className="card">
//       <h3>SOCIETY MEMBERS</h3>
//       <img src={societyMembersImage} alt="Society Members" className="society-members-image" />
//       <p>➕ ADD NEW MEMBERS</p>
//       <p>🔄 UPDATE MEMBERS</p>
//     </div>
//   );
// };

// export default SocietyMembers;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ComponentCard.css';
import societyMembersImage from '../assets/societyMembersImage.png';

const SocietyMembers = () => {
  const navigate = useNavigate();

  const handleAddMemberClick = () => {
    navigate('/add-member');
  };

  const handleUpdateMembersClick = () => {
    navigate('/download-excel');
  };

  return (
    <div className="card">
      <h3>SOCIETY MEMBERS</h3>
      <img
        src={societyMembersImage}
        alt="Society Members"
        className="society-members-image"
      />
      <p className="action add-member" onClick={handleAddMemberClick}>
        ➕ Add New Members
      </p>
      <p className="action update-member" onClick={handleUpdateMembersClick}>
        🔄 Update Members
      </p>
    </div>
  );
};

export default SocietyMembers;
