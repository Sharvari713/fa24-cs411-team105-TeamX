import React, { useState } from "react";
import './login.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform validation
    if (!email || !password) {
      alert("Please enter valid credentials");
      return;
    }

    try {
      // Send login request to the Flask backend
      const response = await axios.post("http://localhost:5001/login", {
        EmailId: email,
        Password: password,
      });

      // If login is successful
      if (response.status === 200) {
        localStorage.setItem("user", response.data.user.FirstName); // Store user info
        localStorage.setItem("userId", response.data.user.Id); // global variable 
        navigate("/dashboard"); // Redirect to the dashboard or the next page
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Invalid email or password!");
      } else {
        alert("An error occurred while logging in. Please try again.");
      }
    }
  };

  return (
    <div className="login">
      <h2>Login Page</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            placeholder="Enter your password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
