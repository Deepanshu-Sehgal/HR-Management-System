import React, { useState } from "react";
import login from "./Registration.module.css";
import { Logo, EyeOpen, EyeHidden, Onboard } from "../../assets";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  
  };


  const handleLogin = async (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
      });
      console.log(response.data);

      localStorage.setItem("token", response.data.token);

      alert("Login successful!");
      navigate("/dashboard/candidates");
    } catch (error) {
      console.error(error);
      alert("Login failed: " + error.response.data.message);
    }
  };

  return (
    <div className={login.registrationPage}>
      {" "}
      {/* Use the imported style */}
      <div className={login.registrationContainer}>
        <div className={login.logo}>
          <img src={Logo} alt="Logo" className={login.logoImage} />
        </div>
        <div className={login.contentContainer}>
          <div className={login.formContainer}>
            <h2>Welcome to Dashboard</h2>
            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input type="email" name="email" placeholder="Email" required />
              <label>Password</label>
              <div className={login.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  required
                />
                <img
                  src={showPassword ? EyeOpen : EyeHidden}
                  alt="Toggle Password Visibility"
                  className={login.eyeIcon}
                  onClick={togglePasswordVisibility}
                />
              </div>
              <button type="submit" className={login.registerButton}>
                Log In
              </button>
            </form>
            <p className={login.acc}>
              Don't have an account?{" "}
              <a href="/" className={login.login}>
                Register
              </a>
            </p>
          </div>
          <div className={login.svgContainer}>
            <img src={Onboard} alt="Onboarding" className={login.mainImage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
