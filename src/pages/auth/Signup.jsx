// import axios from "axios";
import service from "../../services/service.config";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import "../../styles/auth.css";

function Signup() {

  const { authenticateUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState(null)

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const fillUserDemo = () => {
    setUsername("User Demo");
    setEmail("user@dangerzone.app");
    setPassword("Dangerzone1");
    setErrorMessage(null);
  };

  const fillAdminDemo = () => {
    setUsername("Admin Demo");
    setEmail("admin@dangerzone.app");
    setPassword("Dangerzone1");
    setErrorMessage(null);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // optional (for showing the same message the backend would provide without having to contact them)
    if (!email || !password) {
      setErrorMessage("Email and Password are required")
      return
    }

    // ... contact backend to register the user
    try {

      const body = {
        email,
        username,
        password
      }
      
      await service.post("/auth/signup", body)

      const loginResponse = await service.post("/auth/login", { email, password })
      localStorage.setItem("authToken", loginResponse.data.authToken)
      await authenticateUser()

      navigate("/")

    } catch (error) {
      console.log(error)
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.errorMessage)
      }
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel" aria-label="Dangerzone register">
        <header className="auth-brand">
          <div className="auth-brand-row">
            <span className="auth-logo" aria-hidden="true">!</span>
            <strong>DANGER<span>ZONE</span></strong>
          </div>
          <p>City Incident Reporting Network</p>
        </header>

        <div className="auth-card">
          <nav className="auth-tabs" aria-label="Authentication">
            <Link className="auth-tab" to="/login">Sign In</Link>
            <Link className="auth-tab active" to="/signup">Register</Link>
          </nav>

          <form className="auth-form" onSubmit={handleSignup}>
            <label className="auth-field">
              <span>Full Name</span>
              <div className="auth-input-wrap">
                <span aria-hidden="true" className="auth-field-icon">o</span>
                <input
                  type="text"
                  name="username"
                  placeholder="Your name"
                  value={username}
                  onChange={handleUsernameChange}
                  autoComplete="name"
                />
              </div>
            </label>

            <label className="auth-field">
              <span>E-Mail</span>
              <div className="auth-input-wrap">
                <span aria-hidden="true" className="auth-field-icon">@</span>
                <input
                  type="email"
                  name="email"
                  placeholder="marco@dangerzone.app"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap">
                <span aria-hidden="true" className="auth-field-icon">#</span>
                <input
                  type="password"
                  name="password"
                  placeholder="........"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>

            {errorMessage && <p className="auth-error">{errorMessage}</p>}

            <button className="auth-submit" type="submit">
              <span aria-hidden="true">~</span>
              Enter Dangerzone
            </button>
          </form>

          <div className="auth-demo-actions">
            <button type="button" onClick={fillUserDemo}>o User Demo</button>
            <button type="button" className="admin" onClick={fillAdminDemo}># Admin Demo</button>
          </div>
        </div>

        <footer className="auth-footer">DANGERZONE v1.0 - Berlin, 2026</footer>
      </section>
    </div>
  );
}

export default Signup;
