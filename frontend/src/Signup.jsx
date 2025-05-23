import React from "react";
import "./Signup.css";
import lockLadyImg from "./assets/lady-lock.png";
import googleImg from "./assets/google.png";
const Signup = () => {
  return (
    <div className="signup-container">
      <div className="signup-image-section">
        <img src={lockLadyImg} alt="Lady with Lock" className="lady-img" />
      </div>
      <div className="signup-form-section">
        <div className="signup-form-card">
          <div className="signup-logo-row">
            <span className="signup-logo">🔒</span>
            <span className="signup-title">GatedNet</span>
          </div>
          <input type="email" placeholder="Enter Your Email" className="signup-input" />
          <input type="password" placeholder="Enter Password" className="signup-input" />
          <input type="text" placeholder="Enter Society Name" className="signup-input" />
          <button className="signup-btn">SIGN UP</button>
          <div className="signup-divider-row">
            <span className="signup-divider" />
            <span className="signup-or">OR</span>
            <span className="signup-divider" />
          </div>
          <button className="signup-google-btn">
            <img src={googleImg} alt="Google" className="google-icon" />
            Continue With Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup; 