import React from "react";
import "./Login.css";
import lockLadyImg from "./assets/lady-lock.png";

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-image-section">
        <img src={lockLadyImg} alt="Lady with Lock" className="lady-img" />
      </div>
      <div className="login-form-section">
        <div className="login-form-card">
          <div className="login-logo-row">
            <span className="login-logo">🔒</span>
            <span className="login-title">GatedNet</span>
          </div>
          <input type="text" placeholder="Enter Registered Number" className="login-input" />
          <input type="password" placeholder="Enter Password" className="login-input" />
          <div className="login-remember-row">
            <input type="checkbox" id="rememberMe" />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>
          <button className="login-btn">LOGIN</button>
          <div className="login-forgot">Forgot password?</div>
        </div>
      </div>
    </div>
  );
};

export default Login; 