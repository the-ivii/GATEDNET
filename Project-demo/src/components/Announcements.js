import React, { useEffect, useState } from 'react';
import { getAnnouncements } from '../services/api';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    getAnnouncements().then(res => setAnnouncements(res.data));
  }, []);

  return (
    <div>
      <h2>Announcements</h2>
      {announcements.map(announcement => (
        <div key={announcement._id}>
          <h3>{announcement.title}</h3>
          <p>{announcement.message}</p>
        </div>
      ))}
    </div>
  );
}

export default Announcements;
