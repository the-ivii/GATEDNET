import React from "react";
import "./Settings.css";

const Settings = () => {
  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2 className="settings-title">Settings</h2>
        <form className="settings-form">
          <label className="settings-label section">Name Society</label>
          <div className="settings-static-text">Greenlands society</div>
          <label className="settings-label section">Flat Number</label>
          <div className="settings-static-text">E303</div>
          <label className="settings-label section update-password">Update Your Password</label>
          <label className="settings-label">Current Password</label>
          <input type="password" className="settings-input" placeholder="Current password" />
          <label className="settings-label">New Password</label>
          <input type="password" className="settings-input" placeholder="New password" />
          <label className="settings-label">Confirm New Password</label>
          <input type="password" className="settings-input" placeholder="Confirm new password" />
          <button className="settings-save-btn" type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default Settings; 