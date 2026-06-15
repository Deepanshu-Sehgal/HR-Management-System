import React, { useState } from "react";
import register from "./Registration.module.css";
import { useNavigate ,Link} from "react-router-dom";
import axios from "axios";
import { Logo, EyeOpen, EyeHidden, Onboard } from "../../assets";

const Registration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullname, setfullname] = useState('')

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/auth/register", {
        fullname,
        email,
        password,
      });
      console.log(response);
      if (response.status === 201) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div className={register.registrationPage}>
      <div className={register.registrationContainer}>
        <div className={register.logo}>
          <img src={Logo} alt="Logo" className={register.logoImage} />
        </div>
        <div className={register.contentContainer}>
          <div className={register.formContainer}>
            <h2>Welcome to Dashboard</h2>
            <form onSubmit={handleRegister}>
              <label>Fullname</label>
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                required
                onChange={(e)=>setfullname(e.target.value)}
                value={fullname}
    
    
              />
              <label>Email</label>
              <input type="email" name="email" placeholder="Email" required />
              <label>Password</label>
              <div className={register.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  required
                />
                <img
                  src={showPassword ? EyeOpen : EyeHidden}
                  alt="Toggle Password Visibility"
                  className={register.eyeIcon}
                  onClick={togglePasswordVisibility}
                />
              </div>
              <label>Confirm Password</label>
              <div className={register.passwordField}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  required
                />
                <img
                  src={showConfirmPassword ? EyeOpen : EyeHidden}
                  alt="Toggle Password Visibility"
                  className={register.eyeIcon}
                  onClick={toggleConfirmPasswordVisibility}
                />
              </div>
              <button type="submit" className={register.registerButton}>
                Register
              </button>
            </form>
            <p className={register.acc}>
              Already have an account?{" "}
              <Link to="/login" className={register.login}>
                Login here
              </Link>
            </p>
          </div>
          <div className={register.svgContainer}>
            <img
              src={Onboard}
              alt="Onboarding"
              className={register.mainImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
